<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-black text-white">
      <q-toolbar class="gap-sm">
        <q-toolbar-title> Title </q-toolbar-title>
        <q-space />
        <q-btn color="primary" no-caps label="Find"
          @click="find"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {onMounted, ref, watch, computed, watchEffect} from 'vue';

import {uiStore} from "src/hooks/global/useStore.js";
import { findProjectBudget } from "src/api/strapi/project.js";

import { useQuasar } from 'quasar'
const $q = useQuasar()
const budget = ref()
const find = async () => {
  const { data } = await findProjectBudget(1);
  budget.value = data;
}

onMounted(() => {
  uiStore.pageLoaded = true;
});
</script>
