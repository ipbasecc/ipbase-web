<template>
    <NavigatorContainer>
        <RouterView v-if="notebook_id" />
        <template v-if="!$q.screen.gt.xs && !note_id">
            <NotebookList />
        </template>
    </NavigatorContainer>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavigatorContainer from '../NavigatorContainer.vue'
import NotebookList from './NotebookList.vue'

const route = useRoute();
const notebook_id = computed(() => route.params.notebook_id);
const note_id = computed(() => route.params.note_id);
</script>

<style scoped>
</style>