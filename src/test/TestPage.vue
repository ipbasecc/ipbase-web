<template>
    <q-layout view="hHh lpR fFf">
        <q-header class="bg-black text-white">
            <q-toolbar class="gap-sm">
                <q-toolbar-title> Title </q-toolbar-title>
                <q-space />
                <q-btn color="primary" no-caps label="Find" @click="refreshTokenFn" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md">
                {{token}}

            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { onMounted, ref, watch, computed, watchEffect } from 'vue';
import { uiStore } from "src/hooks/global/useStore.js";
import { refreshToken } from "src/api/strapi.js";

const token = ref();
const refreshTokenFn = async () => {
    token.value = await refreshToken()
}

onMounted(() => {
    uiStore.pageLoaded = true;
});
</script>