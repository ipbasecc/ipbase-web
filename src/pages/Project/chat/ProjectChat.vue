<template>
  <ChatContainter v-bind="$attrs" :channel_id :key="channel_id" />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import useProjectStore from "src/stores/project.js";
import ChatContainter from "./ChatContainter.vue";

const projectStore = useProjectStore();
projectStore.navigation = "chat";

const route = useRoute();
const channel_id = computed(() => route.params?.channel_id);
</script>

<style lang="scss" scoped></style>
