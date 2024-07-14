<template>
  <ColumnFolder
    v-if="storage"
    :storage_id="_storage_id"
    :subs="storage"
    belonged="storage"
  />
</template>

<script setup>
import { provide, ref, toRefs, watch } from "vue";
import ColumnFolder from "./ColumnFolder.vue";
import { useFetchStorage } from "src/hooks/project/useFetchStorage.js";
import { computed } from "vue";

const props = defineProps({
  proj_id: {
    type: String,
    default: "",
  },
  storage_id: {
    type: String,
    default: "",
  },
  by: {
    type: String,
    default: "project",
  },
});

// 由路由注入此两项参数
const { proj_id: project_id, storage_id, by } = toRefs(props);
const _storage_id = computed(() => Number(storage_id.value));
provide("by", by.value);

const storage = ref();
const fetchStorage = async () => {
  let res = await useFetchStorage(_storage_id.value, project_id.value);
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
