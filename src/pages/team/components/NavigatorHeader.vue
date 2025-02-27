<template>
    <q-header class="z-max">
      <q-bar
        class="border-bottom q-pl-sm"
        :class="`${
          $q.dark.mode ? 'bg-darker text-white' : 'bg-primary-dark text-grey-1'
        } ${$q.platform.is.electron ? 'q-electron-drag q-pr-none' : ''}`"
        style="height: 2.7rem"
      >
        <q-btn-group class="border-op-sm border-solid border-xs" style="height: 28px;padding: 2px;">
          <q-btn padding="none" style="width: 6px;" class="radius-none"
            :color="$q.dark.mode ? 'grey-7' : 'primary'"
            :class="uiStore.appDrawer ? 'op-4' : 'op-2'"
            @click="uiStore.appDrawer = !uiStore.appDrawer">
            <q-tooltip class="no-padding" :class="$q.dark.mode ? 'text-white' : 'text-grey-10'">
              <q-card bordered class="q-px-sm q-py-xs font-medium">
                {{ uiStore.appDrawer ? '隐藏主导航' : '显示主导航' }}
              </q-card>
            </q-tooltip>
          </q-btn>

          <div class="bg-gery-8" style="width: 2px;" />

          <q-btn padding="none" style="width: 12px;"
            :color="$q.dark.mode ? 'grey-7' : 'primary'"
            :class="uiStore.navigatorDrawer ? 'op-4' : 'op-2'"
            @click="uiStore.navigatorDrawer = !uiStore.navigatorDrawer">
            <q-tooltip class="no-padding" :class="$q.dark.mode ? 'text-white' : 'text-grey-10'">
              <q-card bordered class="q-px-sm q-py-xs font-medium">
                {{ uiStore.navigatorDrawer ? '隐藏二级导航' : '显示二级导航' }}
              </q-card>
            </q-tooltip>
          </q-btn>

          <div class="bg-gery-9" style="width: 2px;" />

          <q-btn padding="none" style="width: 26px;" :color="$q.dark.mode ? 'grey-7' : 'primary'" class="op-4 radius-none" />
        </q-btn-group>
        <div v-if="uiStore.app === 'deliver'"
          class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
        >
          <q-icon name="mdi-cards" />
          <span class="font-small unselected">合作</span>
          <CreateDealbtn />
        </div>
        <div v-if="uiStore.app === 'teams'"
          class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
        >
          <q-icon :name="teamStore?.project ? 'developer_board' : 'forum'" />
          <span class="font-small unselected">{{
            teamStore?.project ? "Projects" : "Channels"
          }}</span>
          <q-menu v-model="uiStore.showToggleTeam" class="radius-sm">
            <TeamList
              :bordered="true"
              :separator="true"
              :spaced="true"
              @createTeam="createTeam"
            />
          </q-menu>
        </div>

        <div v-if="uiStore.app === 'affairs'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/affairs')"
        >
          <q-icon name="mdi-checkbox-marked-circle-outline" />
          <span class="font-small unselected">事务</span>
        </div>
        <div v-if="uiStore.app === 'chats'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/chats')"
        >
          <q-icon name="mark_chat_read" />
          <span class="font-small unselected">沟通</span>
        </div>
        <div v-if="uiStore.app === 'notebooks'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
        >
          <q-icon name="mdi-book-open-page-variant" />
          <span class="font-small unselected">笔记</span>
        </div>
        <div v-if="uiStore.app === 'brand'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/brand')"
        >
          <q-icon name="mdi-creation" />
          <span class="font-small unselected">圈子</span>
        </div>
        <div v-if="uiStore.app === 'discover'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="goDiscover()"
        >
          <q-icon name="mdi-compass-outline" />
          <span class="font-small unselected">{{ $t('discover') }}</span>
        </div>
        <div v-if="uiStore.app === 'aichat'"
          class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
        >
          <AiStar color="white" :width="18" :height="18" />
          AI 对话
        </div>
        <q-space />
        <template v-if="$q.screen.gt.xs">
          <q-btn v-if="uiStore.app !== 'aichat'" @click="toggleRightDrawer('aichat')"
            flat round
          >
            <AiStar
              :color="uiStore.projectRightDrawer &&
                uiStore.projectRightDrawerContent === 'aichat'
                  ? 'green': 'white'
              "
            />
            <q-tooltip>
              <span class="text-no-wrap">{{ $t('aichat_panel') }}</span>
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="
              teamStore.project &&
              isExternal &&
              uiStore.app === 'teams'
            "
            :flat="!uiStore.isFocusMode"
            :color="uiStore.isFocusMode ? 'primary' : ''"
            dense round
            icon="mdi-target"
            @click="toggleFocusMode()"
          >
            <q-tooltip
              :class="
                $q.dark.mode
                  ? 'bg-black text-white border'
                  : 'bg-grey-1 text-grey-10 border'
              "
            >
              {{ $t('focus_model') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="uiStore.app !== 'affairs'"
            flat
            dense round
            :color="
              uiStore.projectRightDrawer &&
              uiStore.projectRightDrawerContent === 'person_todos'
                ? 'green'
                : ''
            "
            icon="mdi-checkbox-marked-circle-outline"
            @click="toggleRightDrawer('person_todos')"
          />
          <q-btn @click="toggleRightDrawer('flaggeds')"
            icon="bookmarks" flat dense round
            :color="uiStore.projectRightDrawer &&
              uiStore.projectRightDrawerContent === 'flaggeds'
                ? 'green': ''
            "
          />
          <q-btn @click="toggleTransfer()"
            flat dense round :class="ossStore.showList ? 'toggle-active' : ''"
          >
            <FileTransfer :color="ossStore.showList ? '#21BA45' : '#fff'" />
          </q-btn>
          <q-btn @click="toggleRightDrawer('talkers')"
            icon="mdi-forum" flat dense round
            :color="uiStore.projectRightDrawer &&
              uiStore.projectRightDrawerContent === 'talkers'
                ? 'green': ''
            "
          >
            <q-tooltip>
              <span class="text-no-wrap">{{ $t('deliver_talkers_panel') }}</span>
            </q-tooltip>
          </q-btn>
        </template>
        <AccountMenu v-else />
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
      </q-bar>
      <TeamNotification v-if="uiStore.showTeamNotification && teamStore.team?.notification" />
    </q-header>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount, watch, watchEffect, nextTick, onUnmounted } from 'vue'
import {ossStore, teamStore, uiStore, discoverStore} from "src/hooks/global/useStore.js";
import {isExternal,} from "src/pages/team/hooks/useConfig.js";
import localforage from "localforage";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";

import AccountMenu from "src/pages/team/components/AccountMenu.vue";
import WindowToggle from "src/pages/team/components/widgets/icons/WindowToggle.vue";
import FileTransfer from "pages/team/components/widgets/icons/FileTransfer.vue";
import TeamList from "src/pages/team/components/TeamList.vue";
import TeamNotification from './TeamNotification.vue'
import CreateDealbtn from 'src/pages/deliver/components/CreateDealbtn.vue'
import AiStar from './widgets/icons/AiStar.vue'

const $q = useQuasar();
const router = useRouter();
const emit = defineEmits(['createTeam']);
const createTeam = () => {
  emit('createTeam');
}

const toggleFocusMode = async () => {
  uiStore.isFocusMode = !uiStore.isFocusMode;
  await localforage.setItem("isFocusMode", uiStore.isFocusMode);
  teamStore.project.isExternal = uiStore.isFocusMode;
  teamStore.isFocusMode = uiStore.isFocusMode;

  if (uiStore.isFocusMode) {
    uiStore.showMainContentList = false;
    const _team_id = teamStore.team?.id;
    console.log("router isFocusMode");
    await router.push(`/teams/${_team_id}/focus/${teamStore.project?.id}`);
  } else {
    if (teamStore.card) {
      teamStore.card = void 0;
    }
    await router.push(`/teams/projects/${teamStore.project?.id}`);
  }
};

const toggleRightDrawer = (val) => {
  if (uiStore.projectRightDrawerContent === void 0) {
    uiStore.projectRightDrawer = true;
    uiStore.projectRightDrawerContent = val;
  } else if (uiStore.projectRightDrawerContent === val) {
    uiStore.projectRightDrawer = !uiStore.projectRightDrawer;
    if (!uiStore.projectRightDrawer) {
      uiStore.projectRightDrawerContent = void 0;
    }
  } else {
    uiStore.projectRightDrawerContent = val;
  }
};
watchEffect(() => {
  let rightDrawerState = uiStore.projectRightDrawer;
  if (uiStore.app === 'aichat' && uiStore.projectRightDrawerContent === 'aichat') {
    uiStore.projectRightDrawer = false;
  }
  onUnmounted(() => {
    uiStore.projectRightDrawer = rightDrawerState;
  })
})

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
  await nextTick();
  if (isElectron.value) {
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