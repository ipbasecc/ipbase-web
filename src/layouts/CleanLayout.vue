<template>
  <q-layout view="hHh lpR fff">
    <q-header v-if="uiStore.topbarShow" class="transparent">
      <q-bar :class="uiStore.topbarClass">
        <q-btn
          v-if="is_development"
          flat
          dense
          icon="dark_mode"
          color="primary"
          @click="$q.dark.toggle()"
        />
        <q-space />
        {{ uiStore?.pageTitle }}
        <q-space />
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page> <router-view /></q-page>
    </q-page-container>

    <q-footer> </q-footer>
  </q-layout>
</template>
<script setup>
import {onBeforeMount, ref} from "vue";
import { uiStore } from "src/hooks/global/useStore.js";
const is_development = ref(process.env.DEV);
onBeforeMount(() => {
  uiStore.topbarShow = false
})

</script>
<style>
.q-field--standard .q-field__control:before {
  border-bottom: 1px solid rgba(0, 0, 0, 0);
}
</style>
