<template>
  <template v-if="storage">
    <AzureBlob v-if="storage.type === 'azure_blob'" :storage />
    <ColumnFolder
      v-else
      :storage_id="_storage_id"
      :subs="storage"
      :readOnly
      belonged="storage"
    />
  </template>
  <div v-if="!storage" class="absolute-full flex flex-center">
    <BgBrand />
  </div>
</template>

<script setup>
import { provide, ref, toRefs, watch } from "vue";
import ColumnFolder from "./ColumnFolder.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import { useFetchStorage } from "src/hooks/project/useFetchStorage.js";
import { findShareCardStorage } from "src/api/strapi/project.js";
import { computed } from "vue";
import AzureBlob from "../filemamager/AzureBlob.vue";
import {teamStore, uiStore} from 'src/hooks/global/useStore';
import { uniqueById } from "src/hooks/utilits.js";

const props = defineProps({
  project_id: {
    type: String,
    default: "",
  },
  storage_id: {
    type: Number,
    default: NaN,
  },
  by: {
    type: String,
    default: "project",
  },
});

// 由路由注入此两项参数
const { project_id, storage_id, by } = toRefs(props);
const _storage_id = computed(() => Number(storage_id.value));
provide("by", by.value);

const members = computed(() => {
  const _cardMembers = teamStore?.card?.card_members || [];
  const _projectMembers = teamStore?.project?.project_members || [];
  return uniqueById([..._projectMembers, ..._cardMembers])
});
const roles = computed(() => {
  const _projectRoles = teamStore?.project?.member_roles || [];
  const _cardRoles =teamStore?.card?.member_roles || [];
  return [..._projectRoles, ..._cardRoles]
});
provide("members", members.value);
provide("roles", roles.value);

const readOnly = computed(() => uiStore.isShared)

const storage = ref();
const fetchStorage = async () => {
  let res
  if(teamStore.shareInfo){
    res = await findShareCardStorage(teamStore.card?.id, _storage_id.value,teamStore.shareInfo.code, teamStore.shareInfo.by);
  } else {
    res = await useFetchStorage(_storage_id.value, project_id.value);
  }
  if (res) {
    storage.value = res;
  }
};
watch(
  _storage_id,
  () => {
    // console.log("watch storage_id");
    if (_storage_id.value) {
      // console.log("watch storage_id.value");
      fetchStorage();
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
