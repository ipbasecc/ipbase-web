<template>
  <q-tabs v-model="tab" dense stretch shrink inline-label no-caps>
    <template v-for="i in tabs" :key="i.name">
      <q-tab
        :name="i.name"
        @click="goto(i)"
        :class="`q-px-sm q-mx-xs
          ${tab === i.name ? '' : 'op-7'}
        `"
      >
        <q-icon v-if="$q.screen.gt.sm" :name="i.name === 'chat' ? $t(isChatMode() ? i.icon : 'mdi-newspaper') : i.icon" size="1.2rem" />
        <span class="q-ml-sm">{{ i.name === 'chat' ? $t(isChatMode() ? 'chat' : 'quick_post') : $t(i.label) }}</span>
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
import useProject from "src/pages/team/hooks/useProject.js";

const $q = useQuasar();
const { isTargetRole, isMember, isManager, isChatMode } = useProject();

const project = computed(() => teamStore?.project);
const isProjectStaff = computed(() => isTargetRole('staff') || isManager());
const isProjectMember = computed(() => isMember());
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
  teamStore.project?.preferences.find(i => i.name === 'enable_settings')?.settings
    ?.filter((i) => (isProjectStaff.value && i.staff_enable) || (isProjectMember.value && i.member_enable))
    ?.map((j) => j.name)
);
watchEffect(() => {
  console.log('teamStore?.project', teamStore?.project)
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
      name: "resource",
      label: "resource",
      to: `/teams/projects/${project.value.id}/resource`,
      icon: "mdi-sale",
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
    {
      name: "budget",
      label: "budget",
      to: `/teams/projects/${project.value.id}/budget`,
      icon: "mdi-cash",
    },
  ];
  const inSettings = teamStore.project?.preferences.find(i => i.name === 'enable_settings')?.settings?.map(
    (i) => i.name
  );

  tabs.value = enabled.value.map((i) => tabs.value.find((j) => j.name === i));
  const unIncludes = tabs.value.filter((i) => !inSettings?.includes(i.name));
  if (unIncludes?.length > 0) {
    tabs.value = [...tabs.value, ...unIncludes];
  }
  console.log('tabs.value', tabs.value);
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
      route?.name === "team_resource_homepage" ||
      route?.name === "team_resource_page"
    ) {
      teamStore.navigation = "resource";
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
