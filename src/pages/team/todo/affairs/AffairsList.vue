<template>
  <q-list v-if="options" dense class="full-width q-pa-sm column no-wrap gap-sm">
    todogroups: {{ teamStore.init?.todogroups }}
    <q-item v-for="i in options" :key="i.id" tag="label" v-ripple class="radius-xs"
            :class="userStore.affairsFilterIDs?.includes(i.id) ? 'border' : 'border-placeholder'"
    >
      <q-item-section side>
        <q-checkbox dense v-model="filters" :val="i.value" @update:model-value="setAffairsFilterIDs" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{i.label}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import {ref, watch, computed, onBeforeMount} from 'vue'
import { userStore, teamStore } from "src/hooks/global/useStore.js";
import localforage from 'localforage';

//此字段的目的是为了在排序变化时，以此为据更新userStore.affairsFilterIDs
const filters = ref(userStore.affairsFilterIDs);
const options = computed(() => {
  return teamStore.init?.todogroups?.map((group) => {
    return {
      id: group.id,
      show: userStore.affairsFilterIDs?.includes(group.id) || true,
      label: group.name,
      value: group.id,
    };
  });
});
onBeforeMount(async () => {
  const cache = await localforage.getItem('affairsFilterIDs');
  if(cache) {
    userStore.affairsFilterIDs = cache
    filters.value = cache
  }
})
const setAffairsFilterIDs = async () => {
  const _all_ids = teamStore.init?.todogroups?.map((group) => group.id);
  userStore.affairsFilterIDs = _all_ids.filter((id) => filters.value.includes(id));
}
const syncCache = async () => {
  const cacheValue = JSON.parse(JSON.stringify(userStore.affairsFilterIDs));
  await localforage.setItem('affairsFilterIDs', cacheValue);
}
const affairsFilterIDs = computed(() => userStore.affairsFilterIDs);
watch(affairsFilterIDs, async () => {
  if(affairsFilterIDs.value?.length > 0){
    await syncCache();
  }
})

</script>

<style scoped>
</style>