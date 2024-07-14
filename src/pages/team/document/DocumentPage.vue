<template>
  <RouterView v-bind="$attrs" />
  <BgBrand v-if="!document_id" />
</template>

<script setup>
import { toRefs } from "vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

const props = defineProps({
  project_id: {
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

const { document_id } = toRefs(props);
</script>

<style lang="scss" scoped></style>
