<template>
  <q-header height-hint="98">
    <q-bar
      class="border-bottom items-center gap-xs"
      :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
      style="height: 40px"
    >
      <q-btn v-if="$q.screen.gt.xs" flat icon="menu" padding="xs" @click="toggleleftDrawer()" />
      <q-btn v-else flat icon="mdi-chevron-left" padding="xs" @click="backHome()" />
      <template v-if="teamStore.project">
        <q-btn v-if="teamStore.project?.meeting" flat dense round color="red" icon="radio_button_checked" @click="toggleMeet()" />
        <ProjectNavigation />
        <q-space />
        <MembersIndicator
          v-if="teamStore?.project?.id && membersForAvatar && $q.screen.gt.xs"
          :members="membersForAvatar"
          @click="toggleRightpannel"
        />
        <q-btn
          v-if="teamStore.project?.id"
          flat
          dense
          icon="more_vert"
          @click="uiStore.project_settings = true"
        />
        <q-dialog
          v-model="uiStore.project_settings"
          persistent
          position="top"
          transition-show="slide-down"
          transition-hide="slide-up"
          :maximized="!$q.screen.gt.xs"
        >
          <div v-if="$q.screen.gt.xs" class="q-pt-xl" style="min-width: 61dvw; min-height: 61dvh">
            <ProjectSetting />
          </div>
          <ProjectSetting v-else />
        </q-dialog>
      </template>
    </q-bar>
  </q-header>
</template>

<script setup>
import { computed, onBeforeMount } from "vue";
import MembersIndicator from "src/pages/team/components/MembersIndicator.vue";
import ProjectSetting from "src/pages/team/settings/ProjectSetting.vue";

import ProjectNavigation from "./ProjectNavigation.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import localforage from "localforage";

import { useRouter } from "vue-router";

const emit = defineEmits(["toggleRightpannel", "toggleleftDrawer"]);
const toggleleftDrawer = () => {
  uiStore.projectLeftDrawer = !uiStore.projectLeftDrawer
};
const toggleRightpannel = () => {
  if (teamStore.rightDrawer === "member_manager") {
    teamStore.rightDrawerOpen = !teamStore.rightDrawerOpen;
  } else {
    teamStore.rightDrawer = "member_manager"
    if (!teamStore.rightDrawerOpen) {
      teamStore.rightDrawerOpen = !teamStore.rightDrawerOpen;
    }
  }
};

const filterArray = (array) => {
  if (!array) return;
  if (array.length <= 3) {
    return array;
  } else {
    return [array[0], array[1], array[array.length - 1]];
  }
};
const membersForAvatar = computed(
  () =>
    teamStore.project?.project_members?.length > 0 &&
    filterArray(teamStore.project?.project_members)
);

const router = useRouter()
const backHome = () => {
  router.push('/teams')
}

const toggleMeet = () => {
  if(!uiStore.init_meet){
    uiStore.init_meet = true
  }
  uiStore.show_meet = !uiStore.show_meet
}

onBeforeMount(async() => {
  const _cacheKey = `${teamStore.team?.id}_showTeamNotification`;
  const notificationCache = await localforage.getItem(_cacheKey);
  if(!notificationCache || notificationCache?.content !== teamStore.team?.notification){
    uiStore.showTeamNotification = true;
  }
})
</script>
