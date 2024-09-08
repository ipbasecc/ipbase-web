<template>
    <div v-if="element" class="full-width column no-wrap q-pa-md article">
        <template v-if="doing === 'reading'">
            <div
                v-if="(element.type === 'article' && (element.cover.data?.attributes?.url || element.media.data?.attributes.url)) ||
                ((element.type === 'video' || element.type === 'audio') && element.media.data?.attributes.url)"
                class="q-mb-md">
                <q-img
                    v-if="element.type === 'article' && (element.cover.data?.attributes?.url || element.media.data?.attributes.url)"
                    :src="element.media.data?.attributes.url ? element.media.data?.attributes.url : element.cover.data.attributes.url"
                    spinner-color="primary"
                    spinner-size="82px"
                />
                <FileViewer
                    v-if="(element.type === 'video' || element.type === 'audio') && element.media.data?.attributes.url"
                    :file="element.media?.data?.attributes"
                    :cover="element.cover?.data?.attributes.url || ''"
                />
            </div>
            <div class="row no-wrap items-center">
                <q-btn color="primary" icon="arrow_back_ios_new" flat round @click="$router.go(-1)" />
                <div class="font-large font-bold-600 q-space q-pl-sm">{{ element.title }}</div>
                <div v-if="Number(userStore.userId) === element.author.data.id">
                    <q-btn dense flat round color="primary" icon="mdi-dots-vertical">
                        <q-menu>
                            <q-list bordered dense style="min-width: 100px">
                                <q-item clickable v-close-popup @click="editElement(element)">
                                    <q-item-section side><q-icon name="mdi-pencil" /></q-item-section>
                                    <q-item-section>修改</q-item-section>
                                </q-item>
                                <DeleteElement :elementId="elementidRef" />
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>
            </div>
            <div class="row items-center no-wrap gap-sm q-mt-sm q-px-md text-no-wrap" :class="$q.dark.mode ? 'text-grey-3' : 'text-grey-8'">
                <AvatarWithname :author="element.author.data" />
                ·
                <PublishedDate :publishedAt="element.publishedAt"/>
                ·
                <div class="row items-center no-wrap gap-xs">
                    <q-icon :name="isViewed ? 'mdi-eye' : 'visibility_off'" />
                    {{ viewed_count }}
                </div>
                ·
                <UpDown
                    :elementid="elementidRef"
                    :element="element"
                    :liked_count="liked_count"
                    :unliked_count="unliked_count"
                />
                ·
                <MotifyFavorite
                    :element="element"
                    :id="elementidRef"
                />
                <q-space />
            </div>
            <div class="row no-wrap gap-sm items-center q-mt-sm q-px-md">
                <template v-if="element.category?.data">
                    <div class="row no-wrap gap-xs items-center cursor-pointer" @click="goCategory(element.category.data.id)">
                        <q-icon :name="element.category.data.attributes.icon" />
                        <span>{{ element.category.data.attributes.name }}</span>
                    </div>
                    ·
                </template>
                <div class="row no-wrap gap-xs items-center">
                    <q-chip
                        v-for="i in element.tags.data" :key="i.id"
                        dense square icon="tag" :label="i.attributes.name" clickable
                        @click="goTag(i.id)"
                    />
                </div>
            </div>
            <div v-if="element.description" class="q-px-md">
                <DescriptionBlock :description="element.description" />
            </div>
            <div class="font-medium q-my-lg q-px-md" v-html="element.content" />
            <div v-if="attachments" class="column no-wrap gap-sm">
                <template v-for="i in attachments" :key="i.id">
                    <FileViewer :file="i.attributes" />
                </template>
            </div>
            <RelationCards v-if="element.relations?.data?.length > 0" :relations="element.relations.data" />
            <div v-if="elementPostId" class="q-mt-md">
                <MessageRoot
                    :postId="elementPostId"
                    :isPost="true"
                    :elementId="elementidRef"
                />
            </div>
        </template>
        <UpdateElement
            v-if="doing === 'updating'"
            :editTarget="editTarget"
            :editTargetId="elementidRef"
            @MotifyCompleted="MotifyCompleted"
        />
    </div>
</template>
<script setup>
import { ref, toRef, watch } from 'vue'
import { findElementByID, findGategories } from "src/apollo/api/api.js";
import { useRouter } from 'vue-router';
import MessageRoot  from "src/pages/ChannelPage/Components/Message/MessageRoot.vue";
import PublishedDate from 'src/components/VIewComponents/PublishedDate.vue'
import DescriptionBlock from 'src/components/VIewComponents/DescriptionBlock.vue'
import AvatarWithname from 'src/components/VIewComponents/CardContainer/AvatarWithname.vue'
import RelationCards from 'src/components/VIewComponents/CardContainer/RelationCards.vue'
import UpDown  from "src/pages/ChannelPage/Elements/Components/UpDown.vue";
import UpdateElement from 'src/pages/ChannelPage/Elements/Components/UpdateElement.vue';
import DeleteElement from 'src/pages/ChannelPage/Elements/Components/DeleteElement.vue';
import MotifyFavorite from 'src/pages/ChannelPage/Elements/Components/Favorite/MotifyFavorite.vue';
import FileViewer from "src/components/VIewComponents/FileViewer.vue";
import useUserStore from "src/stores/user.js";
import useWorkStore from 'src/stores/work.js';
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
const $q = useQuasar()

const props = defineProps({
    elementid: {
        type: String,
        required: true
    }
});

const router = useRouter();

const doing = ref('reading');

const elementidRef = toRef(props,'elementid');
const element = ref();

const logged = ref();
const viewed = ref();
const isViewed = ref();

const userStore = useUserStore();
const workStore = useWorkStore();
watch(userStore,() => {
    logged.value = userStore?.logged || false;
    viewed.value = userStore?.viewed || [];
},{immediate: false, deep: true});

const local_viewed = ref(localStorage.getItem('isViewedIds'));
const unLoggedViewed = ref(JSON.parse(local_viewed.value) || []);
if (!local_viewed.value) {
    unLoggedViewed.value = []
}

const attachments = ref();

const viewed_count = ref();
const favorite_count = ref();
const liked_count = ref();
const unliked_count = ref();
const elementPostId = ref();

let refetchElement;
let count = 0
const queryElement = () => {
    count++
    console.log('get element detial',count);
    const findElementByIDParmars = ref(
        {
            elementId: elementidRef.value,
            "filters": {
                "id": {
                    "eq": userStore.userId
                }
            },
            "likedByFilters2": {
                "id": {
                    "eq": userStore.userId
                }
            },
            "unlikedByFilters2": {
                "id": {
                    "eq": userStore.userId
                }
            },
            "viewedByFilters2": {
                "id": {
                    "eq": userStore.userId
                }
            }
        }
    )
    const { loading, error, result, refetch:rf } = findElementByID(findElementByIDParmars.value);
    refetchElement = rf;
    watch(result,() => {
        if(result.value) {
            element.value = result.value?.element?.data?.attributes;
            attachments.value = element.value?.attachments?.data?.length > 0 && element.value?.attachments?.data || null;

            workStore.creator = element.value?.is_opus && element.value.makers?.length > 0 && element.value?.makers || null
            viewed_count.value = element.value?.viewed_count || 0;
            favorite_count.value =  element.value?.favorite_count || 0;
            liked_count.value =  element.value?.liked_count || 0;
            unliked_count.value =  element.value?.unliked_count || 0;

            elementPostId.value =  element.value?.post?.data?.id || null;

            isViewed.value = element.value?.viewed_by?.data?.length ? true : false;
        }
    },{immediate: true, deep: true});
}

watch([isViewed,element,logged],() => {

    if(isViewed.value) {
        return
    } else if (
        !logged.value && !unLoggedViewed.value.includes(elementidRef.value)
    ) {
        const isReadedTime = ref();
        const clacIsReadedTime = (val) => {
            isReadedTime.value = val / 30 * 1000
        }
        clacIsReadedTime(element.value?.content.length);
        setTimeout(() => {
            setViewed();
        }, isReadedTime.value);
    }
},{immediate: false, deep: true});

let cb = 0
watch(userStore.userId,() => {
    cb++
    console.log('userStore.userId',cb);
},{immediate: true, deep: true});
const setViewed = async () => {
    try {
        const response = await api.put(
            `elements/${elementidRef.value}/viewed`,
            {
                user_id: userStore?.userId ? Number(userStore.userId) : null,
                element_id: Number(elementidRef.value)
            }, // 此处有大坑，id不知为何类型是String，后端需要的是Number
        );
        if(response) {
            if (response.error?.status === 403) {
                $q.notify('您无权进行该操作');
                return
            }
            isViewed.value = true;
            viewed_count.value = response.data.new_viewed_count;

            unLoggedViewed.value.push(elementidRef.value);
            localStorage.setItem('isViewedIds',JSON.stringify(unLoggedViewed.value));
            // if(!logged.value) {
            //     updateUnLoggedViewed();
            // }
        }
    } catch (error) {
        console.error(error);
        if (error.status === 403) {
            $q.notify('您无权进行该操作');
            return
        }
    }
}

watch(elementidRef,() => {
    if(elementidRef.value) {
        queryElement();
    }
},{immediate: true, deep: true});

const MotifyCompleted = () => {
    doing.value = 'reading';
    attachments.value = [];
    refetchElement();
}
const editTarget = ref();
const editElement = (e) => {
    doing.value = 'updating';
    editTarget.value = e;
};

const goCategory = (val) => {

    const findGategoriesParams = ref({
        subLimit: {
            limit: 9999,
        }
    });

    const { loading, error, result, refetch, fetchMore } = findGategories(
        findGategoriesParams.value
    );
    watch(
        result,
        () => {
        if (result.value) {
            let gategories = result.value?.categories?.data || [];
            generateData(gategories,val);
        }
        },
        { immediate: true, deep: true }
    );

    function generateData(arr, id) {
        let data = {
            id: id,
            name: null,
            belong: null,
            sub_category: null
        };
        let ids = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                data.name = arr[i].attributes.name;
                data.sub_category = arr[i].attributes.sub_category.data;
                ids.push(arr[i].id);
                break;
            } else if (arr[i].attributes.sub_category.data.some(item => item.id === id)) {
                data.belong = arr[i].id;
                ids.push(id, ...arr[i].attributes.sub_category.data.map(item => item.id));
                let subItem = arr[i].attributes.sub_category.data.find(item => item.id === id);
                if (subItem.attributes && subItem.attributes.name) {
                    data.name = subItem.attributes.name;
                }
            break;
            }
        }
        const {name, belong} = data;
        userStore.readingCategory = { id, name, belong, ids };
        router.push('/')
    }
}

const goTag = (id) => {
    userStore.readingTags = [id];
    router.push('/')
}

</script>
