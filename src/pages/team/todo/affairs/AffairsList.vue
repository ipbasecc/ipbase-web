<template>
  <q-list v-if="userStore" dense class="full-width q-pa-sm column no-wrap gap-sm">
    <q-item v-for="i in options" :key="i.id" tag="label" v-ripple class="radius-xs"
            :class="userStore.affairsFilterIDs?.includes(i.id) ? 'border' : 'border-placeholder'"
    >
      <q-item-section side>
        <q-checkbox dense v-model="userStore.affairsFilterIDs" :val="i.value" @update:model-value="syncCache" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{i.label}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import {ref, computed, onBeforeMount} from 'vue'
import { userStore } from "src/hooks/global/useStore.js";
import localforage from 'localforage';

const options = computed(() => {
  return userStore.todogroups?.map((group) => {
    return {
      id: group.id,
      show: userStore.affairsFilterIDs?.includes(group.id),
      label: group.name,
      value: group.id,
    };
  });
});
const syncCache = async () => {
  const cacheValue = JSON.parse(JSON.stringify(userStore.affairsFilterIDs));
  await localforage.setItem('affairsFilterIDs', cacheValue);
}
onBeforeMount(async () => {
  const cache = await localforage.getItem('affairsFilterIDs');
  if(cache) {
    userStore.affairsFilterIDs = cache
  }
})

</script>

<style scoped>
</style>