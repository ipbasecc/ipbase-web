<template>
    <q-header>
      <q-bar
        class="border-bottom"
        :class="`${
          $q.dark.mode ? 'bg-darker text-white' : 'bg-primary-dark text-grey-1'
        } ${$q.platform.is.electron ? 'q-electron-drag' : ''}`"
        style="height: 2.5rem"
      >
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
              @createTeam="createing = true"
            />
          </q-menu>
          <q-spinner-orbit
            v-if="uiStore.axiosStauts === 'pending'"
            color="green-10"
            size="1em"
          />
        </div>

        <div v-if="uiStore.app === 'affairs'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/affairs')"
        >
          <q-icon name="mdi-check-all" />
          <span class="font-small unselected">事务</span>
        </div>
        <div v-if="uiStore.app === 'chats'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/chats')"
        >
          <q-icon name="mark_chat_read" />
          <span class="font-small unselected">沟通</span>
        </div>
        <div v-if="uiStore.app === 'brand'"
             class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
             @click="$router.push('/brand')"
        >
          <q-icon name="mdi-creation" />
          <span class="font-small unselected">圈子</span>
        </div>
        <q-space />
        <template v-if="$q.screen.gt.xs">
          <q-btn
            v-if="
              teamStore.project &&
              isExternal &&
              uiStore.app === 'teams'
            "
            :flat="!uiStore.isFocusMode"
            :color="uiStore.isFocusMode ? 'primary' : ''"
            dense
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
            dense
            :color="
              uiStore.projectRightDrawer &&
              uiStore.projectRightDrawerContent === 'person_todos'
                ? 'green'
                : ''
            "
            icon="mdi-checkbox-marked-circle-outline"
            @click="toggleRightDrawer('person_todos')"
          />
          <q-btn
            flat
            dense
            :color="
              uiStore.projectRightDrawer &&
              uiStore.projectRightDrawerContent === 'flaggeds'
                ? 'green'
                : ''
            "
            icon="bookmarks"
            @click="toggleRightDrawer('flaggeds')"
          />
          <q-btn
            flat
            dense
            :class="ossStore.showList ? 'toggle-active' : ''"
            @click="toggleTransfer()"
          >
            <FileTransfer :color="ossStore.showList ? '#21BA45' : '#fff'" />
          </q-btn>
        </template>
        <AccountMenu v-else />
        <!--        <q-btn icon="check" dense @click="$q.dark.toggle()" />-->

        <div v-if="isElectron" class="row no-wrap items-center gap-sm q-pl-md">
          <q-btn
            dense
            round
            size="sm"
            icon="mdi-window-minimize"
            @click="minimize()"
          />
          <q-btn dense round size="sm" @click="toggleMaximize()">
            <WindowToggle
              v-if="isMax"
              :color="$q.dark.mode ? 'white' : 'black'"
            />
            <q-icon v-else name="mdi-window-maximize" />
          </q-btn>
          <q-btn
            dense
            round
            size="sm"
            icon="close"
            @mouseenter="hoverClose = true"
            :class="hoverClose ? 'bg-negative' : ''"
            @mouseleave="hoverClose = false"
            @click="closeApp()"
          />
        </div>
      </q-bar>
    </q-header>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount, watch } from 'vue'
import {ossStore, teamStore, uiStore} from "src/hooks/global/useStore.js";
import {isExternal,} from "src/pages/team/hooks/useConfig.js";
import localforage from "localforage";
import {useQuasar} from "quasar";

import AccountMenu from "src/pages/team/components/AccountMenu.vue";
import WindowToggle from "src/pages/team/components/widgets/icons/WindowToggle.vue";
import FileTransfer from "pages/team/components/widgets/icons/FileTransfer.vue";
import TeamList from "src/pages/team/components/TeamList.vue";

const $q = useQuasar();

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

onBeforeMount(async () => {
  const res = await localforage.getItem("isFocusMode");
  uiStore.isFocusMode = res || false;
});

watch(
  isExternal,
  async () => {
    if (isExternal.value && !uiStore.isFocusMode) {
      console.log("router");
      const _team_id = teamStore.team?.id;
      await router.push(`/teams/${_team_id}/focus/${teamStore.project?.id}`);
    }
  },
  { immediate: true }
);

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