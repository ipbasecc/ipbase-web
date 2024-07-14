<template>
    <q-card style="min-width: 760px;min-height: 55vh;" class="full-width column">
        <q-card-section class="border-bottom">
            <q-btn flat dense round color="primary" icon="mdi-chevron-left" @click="$router.go(-1)" />
            管理收藏夹
        </q-card-section>
        <q-card-section class="q-space row no-wrap gap-sm q-pa-sm">
            <q-list
                class="text-no-wrap q-pr-xs"
            >
                <q-item
                    v-for="i in userStore.favorites"
                    :key="i.id"
                    v-ripple
                    clickable
                    class="hovered-item "
                    :class="selectedFavoriteID == i.id ? 'border radius-sm text-white q-px-md active-listitem' : 'q-py-xs q-px-sm'"
                    @click="queryFavoriteItems(i.id)"
                >
                    <q-item-section>{{ i.attributes.name }}</q-item-section>
                    <q-item-section side class="hover-show transition">
                        <q-btn dense size="sm" flat round :color="selectedFavoriteID == i.id ? 'white' : 'primary'" icon="mdi-dots-vertical">
                            <q-menu>
                                <q-list style="min-width: 100px">
                                    <q-item class="q-pa-xs">
                                        <q-item-section>
                                            <q-input
                                                v-model="changeNameTilte"
                                                dense square filled type="text" label="修改名称"
                                                @keyup.esc="changeNameTilte = ''"
                                                @keyup.enter="changeName(i)"
                                            >
                                                <template v-slot:prepend>
                                                    <q-icon name="edit" size="xs" />
                                                </template>
                                                <template v-if="changeNameTilte" v-slot:append>
                                                    <q-btn dense size="sm" round color="primary" icon="mdi-plus" @click="changeName(i)" />
                                                </template>
                                            </q-input>
                                        </q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click.stop="deletFavCol(i.id)">
                                        <q-item-section side><q-icon name="delete" size="xs" /></q-item-section>
                                        <q-item-section>删除收藏夹</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-item-section>
                </q-item>
                <q-item clickable v-ripple @click="createFavCol = !createFavCol" v-if="!createFavCol" class="q-py-xs q-pl-sm q-pr-xl">
                    <q-item-section side>
                        <q-icon name="mdi-plus" />
                    </q-item-section>
                    <q-item-section>
                        新建收藏夹
                    </q-item-section>
                </q-item>
                <q-item v-else class="q-pa-none border-top q-mt-xs">
                    <q-item-section class="q-pa-none">
                        <q-input
                            dense square filled
                            v-model="newFavName"
                            type="text" label="新收藏夹名称"
                            @keyup.esc="createFavCol = false"
                            @blur="createFavCol = false"
                            @keyup.enter="createFavoriteCollection"
                        >
                            <template v-if="newFavName" v-slot:append>
                                <q-btn dense round size="sm" color="primary" icon="mdi-plus" @click="createFavoriteCollection" />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
            </q-list>
            <div class="q-pa-md q-space">
                <template v-if="favItems && favItems.length > 0">
                    <div
                        v-for="i in favItems" :key="i.id"
                        class="row no-wrap gap-xl q-pa-sm radius-sm hovered-item relative-position article transition relative-position"
                        @mouseenter="selectedFavItem = i.id"
                        @mouseleave="selectedFavItem = ''"
                    >
                        <div class="q-space q-pa-sm column no-wrap gap-md justify-around">
                            <span class="font-large font-bold-600 cursor-pointer"
                                @click="$router.push(`element/${i.id}`)"
                            >{{ i.attributes.title }}</span>
                            <span class="font-medium font-bold-400 cursor-pointer" :class="$q.dark.mode ? 'text-grey-2' : 'text-grey-9'"
                                @click="$router.push(`element/${i.id}`)"
                            >{{ i.attributes.description }}</span>
                            <div class="row no-wrap gap-sm items-center text-no-wrap" :class="$q.dark.mode ? 'text-grey-3' : 'text-grey-7'">
                                <AutoAvatar
                                    :size="28"
                                    :attributes="i.attributes.author.data.attributes"
                                />
                                <span>{{ i.attributes.author.data.attributes.username }}</span>
                                ·
                                <PublishedDate :publishedAt="i.attributes.publishedAt"/>
                                ·
                                <div class="row items-center no-wrap gap-xs">
                                    <q-icon name="mdi-thumb-up-outline" />
                                    {{ i.attributes.liked_by && i.attributes.liked_by.data?.length }}
                                </div>
                                ·
                                <div class="row items-center no-wrap gap-xs">
                                    <q-icon name="mdi-thumb-down-outline" />
                                    {{ i.attributes.unliked_by && i.attributes.unliked_by.data?.length }}
                                </div>
                                ·
                                <div class="row items-center no-wrap gap-xs">
                                    <q-icon name="mdi-eye" />
                                    {{ i.attributes.viewed_by && i.attributes.viewed_by.data?.length }}
                                </div>
                                ·
                                <div class="row items-center no-wrap gap-xs cursor-pointer">
                                    <q-icon name="mdi-star" />
                                    {{ i.attributes.favorite_by && i.attributes.favorite_by.data?.length }}
                                </div>
                            </div>
                        </div>
                        <q-img
                            v-if="i.attributes.cover?.data?.attributes?.url"
                            :src="i.attributes.cover.data.attributes.url"
                            :ratio="1"
                            spinner-color="primary"
                            spinner-size="82px"
                            class="radius-sm"
                            :class="$q.screen.lt.md ? 'col-3' : 'col-2'"
                            style="min-width: 120px;"
                        />
                        <template v-if="selectedFavItem == i.id">
                            <div class="absolute-right flex flex-center bg-white-right">
                                <q-btn color="primary" rounded padding="xs md" icon="close" label="从收藏中移除" @click="removeItemFromFavorite(i.id)" />
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { findFavoriteItemByID, UpdateFavorite, CreateFavorite, DeleteFavoriteCol } from "src/apollo/api/api.js";
import useUserStore from "src/stores/user.js";
import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
import PublishedDate from 'src/components/VIewComponents/PublishedDate.vue';
import { useQuasar } from 'quasar'

const $q = useQuasar();

const emit = defineEmits(['favChanged','favItemRemoved'])

const userStore = useUserStore();

const favItems = ref();
const selectedFavoriteID = ref();
const selectedFavItem = ref();

const newFavName = ref();
const changeNameTilte = ref();
const isChanging = ref(false)


const favorites = ref();
let refetchFavorites;

let refetchFavoriteItems;
const queryFavoriteItems = async (id) => {
    console.log('开始请求收藏夹内容');
    selectedFavoriteID.value = id;
    const { loading, error, result, refetch:rf } = findFavoriteItemByID({favoriteId: id});
    
    watch(result,() => {
        if(result.value) {
            refetchFavoriteItems = rf;
            favItems.value = result.value?.favorite.data.attributes.elements?.data || null;
        }
    },{immediate: true, deep: true});
}

watch(userStore, () => {
    favorites.value = userStore.favorites;
},{immediate:true,deep:true});

onMounted(() => {
    if(favorites.value && favorites.value.length > 0) {
        queryFavoriteItems(favorites.value[0].id)
    }
})

const UpdateFavoriteParmas = ref();
const updateFavoriteFn = async () => {
    const {
        mutate: UpdateFavoriteMutate,
        onDone: UpdateFavoriteOnDone,
        onError,
    } = UpdateFavorite(UpdateFavoriteParmas);

    const { data } = await UpdateFavoriteMutate();
    if (data) {
        emit('favChanged')
    }
}
const changeName = async (i) => {

    UpdateFavoriteParmas.value = {
        updateFavoriteId: i.id,
        data: {
            name: changeNameTilte.value,
        }
    };
    await updateFavoriteFn();
    console.log('内容已被收藏');
    changeNameTilte.value = ''
    isChanging.value = false;
}
const removeItemFromFavorite = async (id) => {

    let elementsOfCurrentFav = favItems.value.filter((i) => i.id != id).map((i) => i.id);

    console.log('收藏列表',elementsOfCurrentFav);
    UpdateFavoriteParmas.value = {
        updateFavoriteId: selectedFavoriteID,
        data: {
            elements: elementsOfCurrentFav,
        }
    };
    await updateFavoriteFn();
    refetchFavoriteItems();
    emit('favItemRemoved');
    // favItems.value = favItems.value.filter(item => item.id != id);
}
const createFavCol = ref(false)
const createFavoriteCollection = async () => {
    const CreateFavoriteParmas = ref({
        data: {
            name: newFavName.value,
            favorite_by: userStore && userStore.userId,
        }
    })
    const {
        mutate: CreateFavoriteMutate,
        onDone: CreateFavoriteOnDone,
        onError,
    } = CreateFavorite(CreateFavoriteParmas);

    const { data } = await CreateFavoriteMutate();
    if (data) {
        // refetchFavorites();
        createFavCol.value = false;
        newFavName.value = ''
    }
}
const deletFavCol = async (i) => {
    const DeleteFavoriteColParmas = ref({
        deleteFavoriteId: i
    })
    const {
        mutate: DeleteFavoriteColMutate,
        onDone: DeleteFavoriteColOnDone,
        onError,
    } = DeleteFavoriteCol(DeleteFavoriteColParmas);

    const { data } = await DeleteFavoriteColMutate();
    if (data) {
        console.log('删除成功');
        userStore.favorites = favorites.value.filter(item => item.id != i);
        // refetchFavorites();
    }
}
const favManager = ref(false);
</script>