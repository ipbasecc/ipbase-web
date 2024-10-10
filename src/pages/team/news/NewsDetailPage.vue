<template>
    <!-- active_news: {{ teamStore.news }} -->
    <div v-if="teamStore.active_news" class="column items-center new-body">
        <div class="q-px-md column q-pb-lg">
            <div class="text-h1">{{ teamStore.active_news?.title }}</div>
            <div class="op-5">
                <TimeAgo :time="teamStore.active_news?.createdAt" />
            </div>
        </div>
        <div class="q-px-md">
            <q-img
                v-if="teamStore.active_news?.cover?.url"
                :src="teamStore.active_news?.cover.url"
                :ratio="16/9"
                spinner-color="primary"
                spinner-size="82px"
            />
        </div>
        <TipTap
            :jsonContent="teamStore.active_news?.jsonContent"
            :editable="false"
            :isRender="true"
            contentStyle="width: 100%; max-width: 46rem;"
        />
    </div>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'
import {teamStore} from "src/hooks/global/useStore.js";
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue';
import TimeAgo from "pages/team/components/widgets/TimeAgo.vue";

onBeforeUnmount(() => {
    teamStore.active_news = null
});

</script>

<style scoped>
.new-body div{
    width: 100%;
    max-width: 46rem;
}
</style>
