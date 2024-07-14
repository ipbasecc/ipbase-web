<template>
    <div
        v-if="elementRef"
        class="row items-center no-wrap gap-xs cursor-pointer"
        @click.stop="queryFavorite_OwnerIsMe_IncludesThisElememt()"
    >
        <q-icon :name="isfaved ? 'mdi-star' : 'mdi-star-outline'" />
        {{ favorite_count }}
        <q-menu class="shadow-24">
            <q-card style="min-width: 210px">
                <q-card-section class="q-pa-sm row border-bottom">
                    请选择一个收藏夹
                    <q-space />
                    <q-btn flat dense size="sm" round color="primary" icon="settings" @click="$router.push(`/${userStore.channelId}/favorite`)" />
                </q-card-section>
                <q-card-section class="q-pa-sm">
                    <q-list>
                        <q-item
                            v-for="i in userStore.favorites"
                            :key="i.id"
                            clickable
                            v-ripple
                            @click.stop="toggleFavorite(i.id)"
                        >
                            <q-item-section v-if="favorites_has_this_element_Ids && favorites_has_this_element_Ids.includes(i.id)" side>
                                <q-icon color="primary" name="mdi-checkbox-marked-circle" />
                                <q-tooltip>
                                    当前内容收藏在此处
                                </q-tooltip>
                            </q-item-section>
                            <q-item-section>{{ i.attributes.name }}</q-item-section>
                        </q-item>
                        <q-item class="q-pa-xs border-top">
                            <q-item-section>
                                <q-btn v-if="!createFavCol" color="primary" icon="mdi-plus" label="新建收藏夹" @click="createFavCol = !createFavCol" />
                                <q-input v-else dense square filled v-model="newFavName" type="text" label="新收藏夹名称" @keyup.esc="createFavCol = false">
                                    <template v-if="newFavName" v-slot:append>
                                        <q-btn dense round size="sm" color="primary" icon="mdi-plus" @click="createFavoriteCollection" />
                                    </template>
                                </q-input>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-menu>
    </div>
</template>

<script setup>
import { ref, toRef, watch } from "vue";
import { findFavorites, CreateFavorite } from "src/apollo/api/api.js";
import useUserStore from "src/stores/user.js";
import { api } from 'boot/axios'

const props = defineProps({
    element: {
        type: Object,
        default () {
            return
        }
    },
    id: {
        type: String,
        default: ''
    }
});


const elementRef = toRef(props,'element');
const elementId = toRef(props,'id');
const favorite_count = ref(elementRef.value.favorite_count)

const userStore = useUserStore();

const isfaved = ref(elementRef.value.favorite_by.data.length > 0);

const favorites_has_this_element = ref();
const favorites_has_this_element_Ids = ref();
let refetch;
const queryFavorite_OwnerIsMe_IncludesThisElememt = () => {
    const parmas = ref({
        "filters": {
            "elements": {
                "id": {
                    "contains": elementId.value
                }
            },
            "owner": {
                "id": {
                    "eq": userStore.userId
                }
            }
        }
    })
    const { loading,error, result, refetch:rf } = findFavorites(parmas.value);
    watch(result, () => {
        if(result.value) {
            refetch = rf;
            favorites_has_this_element.value = result.value;
            favorites_has_this_element_Ids.value = result.value.favorites.data.map(i => i.id);
        }
    },{immediate:true,deep:true});
};

const newFavName = ref();

const createFavCol = ref(false);
const tmp = ref()
const createFavoriteCollection = async () => {
    const CreateFavoriteParmas = ref({
        data: {
            name: newFavName.value,
            owner: userStore && userStore.userId,
        }
    })
    const {
        mutate: CreateFavoriteMutate,
        onDone: CreateFavoriteOnDone,
        onError,
    } = CreateFavorite(CreateFavoriteParmas);

    const { data } = await CreateFavoriteMutate();
    if (data) {
        console.log('新建成功');
        createFavCol.value = false;
        newFavName.value = '';
        userStore.favorites = [...userStore.favorites, data.createFavorite.data]
    }
}

const toggleFavorite = async (id) => {
    try {
        // const response = await api.put(
        //     `elements/${elementId.value}/favorite`, 
        //     { 
        //         favorite_id: Number(id),
        //         user_id: Number(userStore.userId),
        //         element_id: Number(elementId.value)
        //      } // 此处有大坑，id不为何类型是String，后端需要的是Number
        // );
        const response = await api.put(`elements/${elementId.value}/favorite/${Number(id)}`);
        if(response) {
            favorites_has_this_element_Ids.value = response.data.favorites_has_this_element_Ids.map(i => String(i));
            favorite_count.value = response.data.new_favorite_count;
            isfaved.value = favorites_has_this_element_Ids.value.length > 0;
        }
    } catch (error) {
        console.error(error);
        if (error.status === 403) {
            $q.notify('您无权进行该操作');
            return
        }
    }
}
</script>

<style lang="scss" scoped></style>
