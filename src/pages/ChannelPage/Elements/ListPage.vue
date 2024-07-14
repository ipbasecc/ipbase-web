<template>
    <template v-for="i in elementsRef" :key="i.id">
        <ArticleItem v-if="i.attributes.type == 'article'" :element="i" />
        <MediaItem v-else :element="i" />
    </template>
</template>
<script setup>
import { toRef } from "vue";
import ArticleItem from 'src/pages/ChannelPage/Elements/Components/ListSection/ArticleItem.vue';
// 文件名不可以是MediaItem.vue，原因不知
import MediaItem from 'src/pages/ChannelPage/Elements/Components/ListSection/ItemFormedia.vue';

const props = defineProps({
    elements: {
        type: Array,
        default () {
            return []
        }
    }
});
const elementsRef = toRef(props,'elements');
</script>