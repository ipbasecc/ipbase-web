<template>
  <RouterView />
  <BgBrand />
</template>

<script setup>
import useProjectStore from "src/stores/project.js";
import { computed } from "vue";
import { toRefs } from "vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
const projectStore = useProjectStore();

const props = defineProps({
  proj_id: {
    type: String,
    default: "",
  },
  document_id: {
    type: String,
    default: "",
  },
  by: {
    type: String,
    default: "project",
  },
});

const { proj_id, document_id, by } = toRefs(props);
const documents = computed(() => {
  let res = void 0;

  if (by.value === "project") {
    res = projectStore.project?.project_documents;
  } else if (by.value === "card") {
    res = projectStore.card?.card_documents;
  } else if (by.value === "user") {
    res = "";
  }

  return res;
});
</script>

<style lang="scss" scoped></style>
