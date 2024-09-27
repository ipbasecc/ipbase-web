<template>
  <q-toolbar class="bg-deep-orange text-white">
    {{ serverInfo?.notification }}
    <q-space />
    <q-btn flat round dense icon="close" @click="set_appNotification" />
  </q-toolbar>
</template>

<script setup>
import {teamStore, uiStore} from "src/hooks/global/useStore";
import localforage from "localforage";
import { serverInfo } from 'src/boot/server.js'

const set_appNotification = async () => {
  if(serverInfo.value?.notification) {
    uiStore.showAppNotification = false;
    const _cacheVal = {
        show: uiStore.showAppNotification,
        content: serverInfo.value?.notification
    }
    await localforage.setItem('showAppNotification', _cacheVal);
  }
}
</script>

<style scoped>
</style>