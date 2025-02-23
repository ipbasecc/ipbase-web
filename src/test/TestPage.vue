<template>
    <q-layout view="hHh lpR fFf">
        <q-header class="bg-black text-white">
            <q-toolbar class="gap-sm">
                <q-toolbar-title> Title </q-toolbar-title>
                <q-space />
                <q-btn color="primary" no-caps label="join_meet" @click="join_meet" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <AiChat />
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { onMounted, ref, useTemplateRef, computed, watchEffect } from 'vue';
import { uiStore } from "src/hooks/global/useStore.js";
import AiChat from '../pages/ai/AiChat.vue'


onMounted(() => {
    uiStore.pageLoaded = true;
});
</script>