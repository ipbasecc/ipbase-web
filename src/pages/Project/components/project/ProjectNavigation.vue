<template>
  <q-tabs v-model="tab" dense stretch shrink inline-label no-caps>
    <template v-for="i in tabs" :key="i.name">
      <q-tab :name="i.name" :icon="i.icon" :label="i.label" @click="goto(i)" />
    </template>
  </q-tabs>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import useProjectStore from "src/stores/project.js";
import { useRouter, useRoute } from "vue-router";
import localforage from "localforage";

const projectStore = useProjectStore();
const project = computed(() => projectStore?.project);
const project_chatService = computed(() => projectStore?.project.chat_service);

const tab = ref(projectStore.navigation);
let tabs = [
  {
    name: "chat",
    label: "讨论",
    to: `/projects/${project.value.id}/chat`,
    icon: "forum",
  },
  {
    name: "kanban",
    label: "看板",
    to: `/projects/${project.value.id}/kanban`,
    icon: "mdi-chart-gantt",
  },
  {
    name: "document",
    label: "文档",
    to: `/projects/${project.value.id}/document`,
    icon: "menu_book",
  },
  {
    name: "storage",
    label: "文件",
    to: `/projects/${project.value.id}/storage`,
    icon: "storage",
  },
  {
    name: "schedule",
    label: "规划",
    to: `/projects/${project.value.id}/schedule`,
    icon: "schedule",
  },
];
watch(
  project_chatService,
  () => {
    if (!project_chatService.value) {
      tabs = tabs.filter((i) => i.name != "chat");
    }
  },
  { immediate: true, deep: true }
);

const router = useRouter();
const route = useRoute();
watch(
  route,
  () => {
    if (
      route.params.proj_id &&
      (route.params.kanban_id || route.name === "kanban_homepage")
    ) {
      tab.value = "kanban";
      projectStore.navigation = "kanban";
    } else if (
      route.params.proj_id &&
      (route.params.chat_id || route.name === "project_chat_homepage")
    ) {
      tab.value = "chat";
      projectStore.navigation = "chat";
    } else if (
      route.params.proj_id &&
      (route.params.storage_id || route.name === "project_storage_homepage")
    ) {
      tab.value = "storage";
      projectStore.navigation = "storage";
    } else if (
      route.params.proj_id &&
      (route.params.schedule_id || route.name === "project_schedule_homepage")
    ) {
      tab.value = "schedule";
      projectStore.navigation = "schedule";
    } else if (
      route.params.proj_id &&
      (route.params.document_id || route.name === "project_document_homepage")
    ) {
      tab.value = "document";
      projectStore.navigation = "document";
    }
  },
  { immediate: true, deep: true }
);

const goto = async (i) => {
  projectStore.navigation = i.name;
  router.push(i.to);
  await localforage.setItem(
    `__last_navigation_of_project_${projectStore?.project?.id}`,
    i.name
  );
};
</script>

<style lang="scss" scoped></style>
