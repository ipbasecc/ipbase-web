<template>
    <q-layout view="hHh lpR fFf" container class="absolute-full">
        <q-header class="bg-black text-white">
            <q-toolbar class="gap-sm">
                <q-toolbar-title> Title </q-toolbar-title>
                <q-space />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md flex flex-center">
                <SubscriptionPlan />
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { onMounted, ref, useTemplateRef, computed, watchEffect } from 'vue';
import { uiStore } from "src/hooks/global/useStore.js";
import { folderService } from 'src/api/strapi/services/folderService.js'
import SubscriptionPlan from './components/SubscriptionPlan.vue'


const creatFolder = async () => {
    const params = {
        name: 'test create',
        parentId: null
    }
    const res = await folderService.createFolder(params)
    console.log(res);
    
}
onMounted(() => {
    uiStore.pageLoaded = true;
});
</script>