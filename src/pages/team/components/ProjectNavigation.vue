<template>
  <q-tabs v-model="tab" dense stretch shrink inline-label no-caps>
    <template v-for="i in tabs" :key="i.name">
      <q-tab
        :name="i.name"
        @click="goto(i)"
        :class="`
          ${$q.screen.gt.sm ? '' : 'q-px-xs'}
          ${tab === i.name ? '' : 'op-7'}
        `"
      >
        <q-icon v-if="$q.screen.gt.sm" :name="i.icon" size="1.4rem" />
        <span class="q-ml-sm">{{ $t(i.label) }}</span>
      </q-tab>
    </template>
  </q-tabs>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { setProjectNav } from "src/pages/team/components/SideNavigation.js";
import { watchEffect } from "vue";
import {teamStore, uiStore} from 'src/hooks/global/useStore.js';
import { useQuasar } from "quasar";

const $q = useQuasar();

const project = computed(() => teamStore?.project);
const teamMode = computed(() => teamStore.team?.config?.mode || 'toMany')
const router = useRouter();
const route = useRoute();

const tab = ref(teamStore.navigation);
const tabs = ref();
const navigation = computed(() => teamStore.navigation);
const goto = async (i) => {
  teamStore.navigation = i.name;
  teamStore.kanban = null;
  uiStore.showMainContentList = true
  await setProjectNav(teamStore.project?.id, i.name);
  await router.push(i.to);
};
const enabled = computed(() =>
  teamStore.project?.preferences?.enable_settings
    ?.filter((i) => i.enable)
    ?.map((j) => j.name)
);
watchEffect(() => {
  // console.log('teamStore?.project', teamStore?.project)
  tabs.value = [
    {
      name: "chat",
      label: teamMode.value === 'OneToMay' ? "chat" : 'interact',
      to: `/teams/projects/${project.value.id}/chat`,
      icon: "forum",
    },
    {
      name: "kanban",
      label: "kanban",
      to: `/teams/projects/${project.value.id}/kanban`,
      icon: "mdi-chart-gantt",
    },
    {
      name: "classroom",
      label: "classroom",
      to: `/teams/projects/${project.value.id}/classroom`,
      icon: "mdi-school",
    },
    {
      name: "segment",
      label: "segment",
      to: `/teams/projects/${project.value.id}/segment`,
      icon: "mdi-film",
    },
    {
      name: "document",
      label: "document",
      to: `/teams/projects/${project.value?.id}/document`,
      icon: "menu_book",
    },
    {
      name: "storage",
      label: "storage",
      to: `/teams/projects/${project.value.id}/storage`,
      icon: "storage",
    },
    {
      name: "schedule",
      label: "schedule",
      to: `/teams/projects/${project.value.id}/schedule`,
      icon: "schedule",
    },
  ];
  const inSettings = teamStore.project?.preferences?.enable_settings?.map(
    (i) => i.name
  );
  const unIncludes = tabs.value.filter((i) => !inSettings?.includes(i.name));

  tabs.value = tabs.value.filter((i) => enabled.value?.includes(i.name));
  if (unIncludes?.length > 0) {
    tabs.value = [...tabs.value, ...unIncludes];
  }
});

watch(
  [navigation, tab],
  () => {
    if (navigation.value && !tab.value) {
      tab.value = navigation.value;
    }
  },
  { immediate: true, deep: false }
);
watch(
  route,
  () => {
    if (
      route.name === "team_project_chat_homepage" ||
      route.name === "team_project_chat_page"
    ) {
      teamStore.navigation = "chat";
    }
    if (
      route.name === "team_kanban_homepage" ||
      route.name === "team_kanban_page"
    ) {
      teamStore.navigation = "kanban";
    }
    if (
      route?.name === "team_classroom_homepage" ||
      route?.name === "team_classroom_page"
    ) {
      teamStore.navigation = "classroom";
    }
    if (
      route.name === "team_project_document_homepage" ||
      route.name === "team_project_document_page"
    ) {
      teamStore.navigation = "document";
    }
    if (
      route.name === "team_project_storage_homepage" ||
      route.name === "team_project_storage_page"
    ) {
      teamStore.navigation = "storage";
    }
    if (
      route.name === "team_project_schedule_homepage" ||
      route.name === "team_project_schedule_page"
    ) {
      teamStore.navigation = "schedule";
    }
    if (
      route.name === "team_segment_homepage" ||
      route.name === "team_segment_page"
    ) {
      teamStore.navigation = "segment";
    }
  },
  { immediate: true, deep: false }
);
</script>

<style lang="scss" scoped></style>
