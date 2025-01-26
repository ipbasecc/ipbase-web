<template>
    <q-header class="z-max">
      <q-bar
        class="border-bottom unselected"
        :class="`${
          $q.dark.mode ? 'bg-darker text-white' : 'bg-primary-dark text-grey-1'
        } ${$q.platform.is.electron ? 'q-electron-drag q-pr-none' : ''}`"
        style="height: 2.5rem"
      >
        <span class="font-small font-bold-600 cursor-pointer" @click="goHome()">Bamboo!</span>
        <!-- <q-btn icon="check" dense @click="$q.dark.toggle()" /> -->
        <template  v-if="isElectron">
          <q-separator spaced inset vertical />
          <section class="full-height row no-wrap items-center" style="padding: 2px">
            <q-btn dense square size="sm" icon="mdi-window-minimize"
              class="full-height" padding="0 12px"
              @click="minimize()"
            />
            <q-btn dense square size="sm" class="full-height" padding="0 12px" @click="toggleMaximize()">
              <WindowToggle v-if="isMax" :color="$q.dark.mode ? 'white' : 'black'" />
              <q-icon v-else name="mdi-window-maximize" />
            </q-btn>
            <q-btn dense square size="sm" icon="close"
              class="full-height" padding="0 12px"
              @mouseenter="hoverClose = true"
              :class="hoverClose ? 'bg-negative' : ''"
              @mouseleave="hoverClose = false"
              @click="closeApp()"
            />
          </section>
        </template>
        <q-space />
        <AccountMenu
          :avatarSize="28" show="slide-down" hide="slide-up"
        />
      </q-bar>
      <TeamNotification v-if="uiStore.showTeamNotification && teamStore.team?.notification" />
    </q-header>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount, watch, nextTick } from 'vue'
import {ossStore, teamStore, uiStore, discoverStore} from "src/hooks/global/useStore.js";
import {isExternal,} from "src/pages/team/hooks/useConfig.js";
import localforage from "localforage";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";

import AccountMenu from "src/pages/team/components/AccountMenu.vue";
import WindowToggle from "src/pages/team/components/widgets/icons/WindowToggle.vue";
import TeamNotification from './TeamNotification.vue'

const $q = useQuasar();
const router = useRouter();
const emit = defineEmits(['createTeam']);
const goHome = () => {
  uiStore.app = 'teams'
  router.push('/teams')
}

const checkNotification = async () => {
  if (!teamStore.team?.notification || teamStore.team?.notification === '') {
    uiStore.showTeamNotification = false;
  } else {
    const _cacheKey = `${teamStore.team?.id}_showTeamNotification`;
    const notificationCache = await localforage.getItem(_cacheKey);
    if((!notificationCache || teamStore.team?.notification !== notificationCache.content)){
      uiStore.showTeamNotification = true;
    }
  }
}
onBeforeMount(async () => {
  const res = await localforage.getItem("isFocusMode");
  uiStore.isFocusMode = res || false;
  await checkNotification();
});

const goDiscover = () => {
  if(discoverStore.actived){
    discoverStore.actived = null;
  } else {
    discoverStore.list = 'home'
    router.push('/discover');
  }
}

watch(
  isExternal,
  async () => {
    if (isExternal.value && !uiStore.isFocusMode) {
      console.log("router");
      const _team_id = teamStore.team?.id;
      if(_team_id){
        const project_id = teamStore.project?.id;
        if(project_id){
          await router.push(`/teams/${_team_id}/external/${project_id}`);
        } else {
          await router.push(`/teams/${_team_id}/external/`);
        }
      }
    }
  },
  { immediate: true }
);

// 团队通知更新时，检查是否需要显示通知
const notification = computed(() => {
  return teamStore.team?.notification;
})
watch(notification, async () => {
  if(notification.value){
    await checkNotification();
  }
},{immediate: false, deep: false})

const isElectron = computed(() => $q.platform.is.electron);
const isMax = ref(false);
onMounted(async () => {
  if (isElectron.value) {
    await nextTick();
    isMax.value = window.windowAPI?.isMaximized();
  }
});
function minimize() {
  if (isElectron.value) {
    window.windowAPI?.minimize();
  }
}

function toggleMaximize() {
  if (isElectron.value) {
    window.windowAPI?.toggleMaximize(isMax.value);
    isMax.value = !isMax.value;
  }
}

const hoverClose = ref(false);
function closeApp() {
  if (isElectron.value) {
    window.windowAPI?.close();
  }
}

const toggleTransfer = () => {
  ossStore.showList = !ossStore.showList;
};
</script>

<style scoped>
</style>