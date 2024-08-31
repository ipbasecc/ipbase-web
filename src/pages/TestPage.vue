<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-black text-white">
      <q-toolbar class="gap-sm">
        <q-toolbar-title> Title </q-toolbar-title>
        <q-space />
        <q-btn color="primary" no-caps label="addMedia" @click="addMediaFn()" />
        <q-btn color="primary" no-caps label="queryMedias" @click="fetchMedias()" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        {{ medias }}
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { queryMedias, addMedia } from 'src/api/strapi.js';
import { uiStore } from "src/hooks/global/useStore.js";

const medias = ref();
const fetchMedias = async () => {
  const params = {
    data: {
      overview_id: 410
    },
  }
  const res = await queryMedias(params);
  if(res?.data){
    medias.value = res.data;
  }
};

const addMediaFn = async () => {
  const params = {
    data: {
      overview_id: 410
    },
  }
  const res = await addMedia(params);
  if(res?.data){
    medias.value = res.data;
  }
};
onMounted(() => {
  uiStore.pageLoaded = true;
});
</script>
