<template>
  <q-layout
    view="hHh LpR lfr"
    container
    class="absolute-full no-scroll"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <q-header>
      <q-bar
        class="border-bottom"
        :class="`${$q.dark.mode ? 'bg-darker text-white' : 'bg-primary-dark text-grey-1'} ${$q.platform.is.electron ? 'q-electron-drag' : ''}`"
        style="height: 2.5rem"
      >
        <div
          v-if="uiStore.app !== 'affairs'"
          class="row no-wrap gap-sm items-center cursor-pointer"
        >
          <q-btn dense flat noCaps padding="xs" icon="apps" />
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
        <q-space />
        <template v-if="$q.screen.gt.xs">
          <q-btn
            v-if="teamStore.project && !teamStore.team?.isExternal && uiStore.app === 'teams'"
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
              专注模式
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
          <q-btn flat dense :class="ossStore.showList ? 'toggle-active' : ''" @click="toggleTransfer()">
            <FileTransfer :color="ossStore.showList ? '#21BA45' : $q.dark.mode ? '#fff' : '#000'" />
          </q-btn>
        </template>
        <AccountMenu v-else />
<!--        <q-btn icon="check" dense @click="$q.dark.toggle()" />-->

        <div v-if="isElectron" class="row no-wrap items-center gap-sm q-pl-md">
          <q-btn dense round size="sm" icon="mdi-window-minimize" @click="minimize()" />
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
    <template v-if="$q.screen.gt.xs">
      <q-drawer
        v-if="uiStore.app === 'teams'"
        side="left"
        v-model="uiStore.navigatorDrawer"
        :breakpoint="640"
        :width="navDrawerWidth"
        class="border-right"
      >
        <div
          class="absolute-full column no-wrap"
          :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'"
        >
          <template v-if="team">
            <q-item v-if="!team.isExternal" class="q-px-sm">
              <q-item-section>
                <div class="row no-wrap items-center">
                  <q-btn
                    dense
                    flat
                    no-caps
                    padding="xs sm"
                    :label="team.display_name"
                    icon-right="mdi-chevron-down"
                    class="no-wrap"
                  >
                    <TeamMenu :team />
                  </q-btn>
                  <q-space />
                  <q-btn dense size="sm" flat round icon="add">
                    <TeamAddmenu />
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
            <SideNavigation
              class="q-space"
              :class="team.isExternal ? 'q-pt-sm' : ''"
            />
          </template>
          <TeamList
            v-else-if="teamStore.init && !teamStore.init.default_team"
            :bordered="false"
            :spaced="false"
            :separator="true"
            assignStyle="transparent"
            :forceDard="true"
            @createTeam="createing = true"
          />
        </div>
      </q-drawer>
      <q-drawer
        v-model="uiStore.projectRightDrawer"
        v-if="uiStore.projectRightDrawer && uiStore.projectRightDrawerContent"
        bordered
        side="right"
        :width="420"
      >
        <TodoPage
          v-if="uiStore.projectRightDrawerContent === 'person_todos' && uiStore.app === 'teams'"
          _for="user_todos"
          class="absolute-full"
        />
        <FlagsContainder
          v-if="uiStore.projectRightDrawerContent === 'flaggeds'"
          :headerless="true"
          class="absolute-full"
        />
      </q-drawer>
    </template>
    <q-page-container>
      <q-page>
        <div
          v-if="$q.screen.gt.xs"
          class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
          :class="dragWidth ? 'bg-primary ' : ''"
          :style="dragWidth ? 'width: 3px' : 'width: 10px'"
          @mousedown="handleMouseDown"
        >
          <q-icon
            :name="`mdi-chevron-${
              uiStore.navigatorDrawer ? 'left' : 'right'
            }`"
            color="primary"
            size="sm"
            @click="toggleNavDrawer()"
            class="cursor-pointer toggle-btn transition z-max"
            :style="`transform: translateX(${
              uiStore.navigatorDrawer ? -16 : 12
            }px)`"
          />
        </div>
        <slot />
        <div
          v-if="showBrand && $q.screen.gt.xs"
          class="absolute-full flex flex-center"
          :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-3'"
        >
          <WelcomePage />
        </div>
      </q-page>
      <q-dialog v-model="createing" persistent>
        <CreateTeam @cannelCreate="createing = false" />
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {ref, computed, onBeforeMount, watch, reactive, onMounted, nextTick} from "vue";
import { useRoute, useRouter } from "vue-router";

import FlagsContainder from "src/pages/team/chat/FlagsContainder.vue";
import CreateTeam from "src/pages/team/components/CreateTeam.vue";

import TeamMenu from "src/pages/team/components/TeamMenu.vue";
import AccountMenu from 'src/pages/team/components/AccountMenu.vue'
import SideNavigation from "src/pages/team/components/SideNavigation.vue";
import TeamAddmenu from "src/pages/team/components/TeamAddmenu.vue";
import WelcomePage from "src/pages/team/WelcomePage.vue";
import TeamList from "src/pages/team/components/TeamList.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import localforage from "localforage";
import {ossStore, teamStore, uiStore} from "src/hooks/global/useStore.js";
import { useMouse } from "@vueuse/core";
import { useQuasar } from "quasar";
import WindowToggle from "src/pages/team/components/widgets/icons/WindowToggle.vue";
import FileTransfer from "pages/team/components/widgets/icons/FileTransfer.vue";

const $q = useQuasar();

const route = useRoute();
const router = useRouter();
const showBrand = computed(() => route.name === "teams");
const team = computed(() => teamStore.team);
const routeName = computed(() => route.name);
watch(
  routeName,
  () => {
    // showNavDom when Mobile
    if (
      (routeName.value === "team_project_homepage" ||
        routeName.value === "teams") &&
      !$q.screen.gt.xs
    ) {
      teamStore.navigatorDrawer = true;
    }
  },
  { immediate: true, deep: false }
);

const createing = ref(false);

const toggleNavDrawer = () => {
  uiStore.navigatorDrawer = !uiStore.navigatorDrawer;
};
const navDrawerWidth = ref(210);

const { x } = useMouse({ touch: false });
const navDrawerMinWidth = ref(180);
const navDrawerMaxWidth = ref(340);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});
const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true;
  _ori_width.value = navDrawerWidth.value;
  uiStore.draging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.draging = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = x.value - position.x;
  if (
    _ori_width.value + deltaX >= navDrawerMinWidth.value &&
    _ori_width.value + deltaX <= navDrawerMaxWidth.value
  ) {
    navDrawerWidth.value = _ori_width.value + deltaX;
  } else if (_ori_width.value + deltaX > navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMaxWidth.value;
  } else if (_ori_width.value + deltaX === navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMinWidth.value;
  } else if (_ori_width.value + deltaX < 50) {
    uiStore.navigatorDrawer = false;
  }
};

const toggleRightDrawer = (val) => {
  if(uiStore.projectRightDrawerContent === void 0){
    uiStore.projectRightDrawer = true;
    uiStore.projectRightDrawerContent = val
  } else if(uiStore.projectRightDrawerContent === val){
    uiStore.projectRightDrawer = !uiStore.projectRightDrawer;
    if(!uiStore.projectRightDrawer){
      uiStore.projectRightDrawerContent = void 0
    }
  } else {
    uiStore.projectRightDrawerContent = val
  }
};

onBeforeMount(async () => {
  const res = await localforage.getItem("isFocusMode");
  uiStore.isFocusMode = res || false;
});
const toggleFocusMode = async () => {
  uiStore.isFocusMode = !uiStore.isFocusMode;
  await localforage.setItem("isFocusMode", uiStore.isFocusMode);
  teamStore.project.isExternal = uiStore.isFocusMode;
  teamStore.isFocusMode = uiStore.isFocusMode;

  if (uiStore.isFocusMode) {
    uiStore.showMainContentList = false
    const _team_id = teamStore.team?.id
    console.log('router isFocusMode')
    await router.push(`/teams/${_team_id}/focus/${teamStore.project?.id}`);
  } else {
    if(teamStore.card){
      teamStore.card = void 0;
    }
    await router.push(`/teams/projects/${teamStore.project?.id}`);
  }
};

const isExternal = computed(() => teamStore.project?.isExternal);
watch(
  isExternal,
  async () => {
    if (isExternal.value && !uiStore.isFocusMode) {
      console.log('router')
      const _team_id = teamStore.team?.id
      await router.push(`/teams/${_team_id}/focus/${teamStore.project?.id}`);
    }
  },
  { immediate: true }
);

const isElectron = computed(() => $q.platform.is.electron);
const isMax = ref(false);
onMounted(async () => {
  if(isElectron.value){
    await nextTick();
    isMax.value = window.windowAPI.isMaximized();
  }
})
function minimize() {
  if (isElectron.value) {
    window.windowAPI.minimize();
  }
}

function toggleMaximize() {
  if (isElectron.value) {
    window.windowAPI.toggleMaximize(isMax.value);
    isMax.value = !isMax.value
  }
}

const hoverClose = ref(false);
function closeApp() {
  if (isElectron.value) {
    window.windowAPI.close();
  }
}

const toggleTransfer = () => {
  ossStore.showList = !ossStore.showList;
};
</script>

<style scoped>
.no-scroll > .absolute-full > .scroll{
  overflow: hidden !important;
}
</style>
