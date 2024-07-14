<template>
  <embed :src="srcRef" type="application/pdf" width="100%" height="100%" />
</template>

<script setup>
import { toRef } from "vue";
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
});
const srcRef = toRef(props, "src");
</script>

<style lang="scss" scoped></style>
