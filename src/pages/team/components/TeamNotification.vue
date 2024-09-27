<template>
    <q-toolbar class="row no-wrap bg-primary text-white">
        {{ teamStore.team?.notification }}
        <q-space />
        <q-btn flat round dense icon="close" @click="set_teamNotification" />
    </q-toolbar>
</template>

<script setup>
import {teamStore, uiStore} from "src/hooks/global/useStore";
import localforage from "localforage";

const set_teamNotification = async () => {
    uiStore.showTeamNotification = false;
    const _cacheKey = `${teamStore.team?.id}_showTeamNotification`;
    const _cacheVal = {
        show: uiStore.showTeamNotification,
        content: teamStore.team?.notification
    }
    await localforage.setItem(_cacheKey, _cacheVal);
}
</script>

<style scoped>
</style>