<template>
    <div v-if="i"
        class="row no-wrap gap-xl q-pa-sm radius-sm hovered-item relative-position article hovered-item transition">
        <div class="q-space q-pa-sm column no-wrap gap-md justify-around text-no-wrap">
            <span class="font-large font-bold-600 cursor-pointer" @click="routeTarget && $router.push(routeTarget)">{{
                i.attributes.title }}</span>
            <span class="font-medium font-bold-400 cursor-pointer" :class="$q.dark.mode ? 'text-grey-2' : 'text-grey-9'"
                @click="$router.push(routeTarget)">{{ i.attributes.description }}</span>
            <div class="row no-wrap gap-sm items-center text-no-wrap" :class="$q.dark.mode ? 'text-grey-3' : 'text-grey-7'">
                <template v-if="i.attributes.author?.data">
                    <AutoAvatar :size="28" :attributes="i.attributes.author?.data?.attributes" :withName="true" />
                    ·
                </template>
                <PublishedDate :publishedAt="i.attributes.publishedAt" />
                ·
                <div class="row items-center no-wrap gap-xs">
                    <q-icon :name="isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" />
                    {{ i.attributes?.liked_count || 0 }}
                </div>
                ·
                <div class="row items-center no-wrap gap-xs">
                    <q-icon :name="isUnliked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline'" />
                    {{ i.attributes?.unliked_count || 0 }}
                </div>
                ·
                <div class="row items-center no-wrap gap-xs">
                    <q-icon :name="isViewed ? 'mdi-eye' : 'visibility_off'" />
                    {{ i.attributes?.viewed_count || 0 }}
                </div>
                ·
                <MotifyFavorite :element="i.attributes" :id="i.id" />
            </div>
        </div>
        <q-img v-if="i.attributes.cover?.data?.attributes?.url" :src="i.attributes.cover.data.attributes.url" :ratio="1"
            spinner-color="primary" spinner-size="82px" class="radius-sm" :class="$q.screen.lt.md ? 'col-3' : 'col-2'"
        />
        <div v-if="$route && $route.meta.where == 'userCenter'" class="flex flex-center">
            <DeleteElement :elementId="i.id" />
        </div>
    </div>
</template>

<script setup>
import { ref, toRef } from "vue"
import PublishedDate from 'src/components/VIewComponents/PublishedDate.vue';
import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
import MotifyFavorite from 'src/pages/ChannelPage/Elements/Components/Favorite/MotifyFavorite.vue';
import DeleteElement from 'src/pages/ChannelPage/Elements/Components/DeleteElement.vue';

const props = defineProps({
    element: {
        type: Object,
        default () {
            return {}
        }
    }
});
const i = toRef(props,'element');
const isViewed = ref(i.value.attributes.viewed_by.data.length > 0);
const isLiked = ref(i.value.attributes.liked_by.data.length > 0);
const isUnliked = ref(i.value.attributes.unliked_by.data.length > 0);
const isFaved = ref(i.value.attributes.favorite_by.data.length > 0);

const authorChannelId = ref(i.value.attributes.author?.data?.attributes?.user_channel?.data?.id || null);
const routeTarget = ref(authorChannelId.value ? `/brand/${authorChannelId.value}/element/${i.value.id}` : null)
</script>

<style lang="scss" scoped>
.article {
    background-color: transparent;
}
.article:hover {
    background-color: #c8c8c881;
}
</style>
