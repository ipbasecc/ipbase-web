<template>
    <TipTap
        :jsonContent="teamStore.active_news?.jsonContent"
        :editable="false"
        :isRender="true"
        contentStyle="width: 100%; max-width: 46rem;"
    />
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import {teamStore} from "src/hooks/global/useStore.js";
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'

onBeforeUnmount(() => {
    teamStore.active_news = null
})

</script>

<style scoped>
</style>