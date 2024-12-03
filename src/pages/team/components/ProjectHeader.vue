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
        <StartMeet v-if="$q.screen.gt.xs" :project="teamStore.project" class="q-pr-sm" />
        <MembersIndicator
          v-if="teamStore?.project?.id && membersForAvatar && $q.screen.gt.xs"
          :members="membersForAvatar"
          @click="toggleRightpannel('member_manager')"
        />
        <q-btn
          v-if="useAuths('approve_join_request',['project'])"
          flat
          dense
          round
          icon="notifications"
          :color="show_join_alert ? 'orange' : ''"
          @click="toggleRightpannel('join_request')"
        />
        <q-btn
          v-if="teamStore.project?.id && teamStore.navigation !== 'chat'"
          flat
          dense
          icon="mdi-message"
          @click="toggleRightpannel('chat_pannel')"
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
          allow-focus-outside
          position="top"
          transition-show="slide-down"
          transition-hide="slide-up"
          :maximized="!$q.screen.gt.xs"
        >
          <div v-if="$q.screen.gt.xs" class="q-pt-xl overflow-hidden" style="min-width: 61dvw; height: 61dvh">
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
import StartMeet from 'src/components/meet/StartMeet.vue'

const emit = defineEmits(["toggleRightpannel", "toggleleftDrawer"]);
const toggleleftDrawer = () => {
  uiStore.projectLeftDrawer = !uiStore.projectLeftDrawer
};
const toggleRightpannel = (val) => {
  if (teamStore.rightDrawer === val) {
    teamStore.rightDrawerOpen = !teamStore.rightDrawerOpen;
  } else {
    teamStore.rightDrawer = val
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

const show_join_alert = computed(() => {
  const filter_requests = teamStore.project.join_requests?.filter(item => !item.approved)
  return filter_requests?.length > 0
})

onBeforeMount(async() => {
  const _cacheKey = `${teamStore.team?.id}_showTeamNotification`;
  const notificationCache = await localforage.getItem(_cacheKey);
  if(!notificationCache || notificationCache?.content !== teamStore.team?.notification){
    uiStore.showTeamNotification = true;
  }
})
</script>
