<template>
    <q-layout view="lHh LpR fFf" container class="absolute-full">  
      <q-page-container>
        <q-page>
            <router-view :pannelMode="false" />
        </q-page>
      </q-page-container>
  
    </q-layout>
  </template>
<script setup>
import { computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNotebook } from "src/api/strapi/notebook";
import { teamStore } from 'src/hooks/global/useStore';

const route = useRoute();
const router = useRouter();
const notebook_id = computed(() => route.params.notebook_id)
const note_id = computed(() => route.params.note_id)

watchEffect(async () => {
    if(notebook_id.value && !teamStore.notebook) {
        teamStore.notebook = await getNotebook(notebook_id.value);
    }
    if(teamStore.notebook && teamStore.note && !note_id.value){
        router.push(`/notebooks/${teamStore.notebook?.id}/${teamStore.note?.id}`)
    }
})
</script>

<style scoped>
</style>