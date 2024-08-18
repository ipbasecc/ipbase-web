<template>
    <div v-if="i" class="column no-wrap q-pa-sm radius-sm hovered-item relative-position hovered-item">
        <div class="row no-wrap gap-md">
            <span class="font-large font-bold-600 cursor-pointer q-mb-xs q-space" @click="$router.push(routeTarget)">{{
                i.attributes.title }}</span>
            <div v-if="$route && $route.meta.where == 'userCenter'" class="flex flex-center">
                <DeleteElement :elementId="i.id" />
            </div>
        </div>
        <FileViewer
            v-if="i.attributes.media?.data?.attributes?.url"
            :file="i.attributes.media?.data?.attributes"
            :cover="i.attributes.cover?.data?.attributes?.url || ''"
        />
        <div class="row no-wrap gap-sm items-center text-no-wrap q-my-sm" :class="$q.dark.mode ? 'text-grey-3' : 'text-grey-7'">
            <AutoAvatar :size="28" :attributes="i.attributes.author.data.attributes" :withName="true" />
            ·
            <PublishedDate :publishedAt="i.attributes.publishedAt" />
            ·
            <div class="row items-center no-wrap gap-xs">
                <q-icon name="mdi-thumb-up-outline" />
                {{ i.attributes?.liked_count || 0 }}
            </div>
            ·
            <div class="row items-center no-wrap gap-xs">
                <q-icon name="mdi-thumb-down-outline" />
                {{ i.attributes?.unliked_count || 0 }}
            </div>
            ·
            <div class="row items-center no-wrap gap-xs">
                <q-icon name="mdi-eye" />
                {{ i.attributes?.viewed_count || 0 }}
            </div>
            ·
            <MotifyFavorite :element="i.attributes" :id="i.id" />
        </div>
    </div>
</template>

<script setup>
import { ref, toRef } from "vue"
import PublishedDate from 'src/components/VIewComponents/PublishedDate.vue';
import AutoAvatar from 'src/components/VIewComponents/AutoAvatar.vue';
import MotifyFavorite from 'src/pages/ChannelPage/Elements/Components/Favorite/MotifyFavorite.vue';
import DeleteElement from 'src/pages/ChannelPage/Elements/Components/DeleteElement.vue';
import FileViewer from "src/components/VIewComponents/FileViewer.vue"

const props = defineProps({
    element: {
        type: Object,
        default () {
            return {}
        }
    }
});
const i = toRef(props,'element');

const authorChannelId = ref(i.value.attributes?.author?.data?.attributes?.user_channel?.data?.id || null);
const routeTarget = ref(`/brand/${authorChannelId.value}/element/${i.value.id}`)
</script>

<style lang="scss" scoped></style>
