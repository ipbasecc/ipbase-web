<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> Title </q-toolbar-title>
        <q-space />
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
import { queryMedias } from 'src/api/strapi.js';
import { uiStore } from "src/hooks/global/useStore.js";

const medias = ref();
const fetchMedias = async () => {
  const params = {
    data: {
      overview_id: 409
    },
  }
  const res = await queryMedias(params);
  if(res?.data){
    medias.value = res.data;
  }
};
onMounted(() => {
  uiStore.pageLoaded = true;
});
</script>
