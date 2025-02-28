<template>
  <q-layout
    view="hHh LpR lfr"
    container
    class="absolute-full no-scroll"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <NavigatorHeader v-if="$q.screen.gt.xs || !uiStore.hide_top" />
    <template v-if="teamStore.status === 'deleted'">
      <q-page-container>
        <q-page>
          <div class="absolute-full flex flex-center">
            <q-card bordered class="q-pa-lg" style="min-width: 16rem;">
              <q-card-section>
                <RemovedPic :height="360"/>
              </q-card-section>
              <div class="absolute-top flex flex-center q-pt-xl">
                <div class="column flex-center q-pa-md" style="text-shadow: 0 0 30px #000;">
                  <div class="text-h1">{{ $t('team_deleted_tip_title') }}</div>
                  <span class="font-large font-bold-600">{{ $t('team_deleted_tip_caption') }}</span>
                </div>
              </div>
            </q-card>
          </div>
        </q-page>
      </q-page-container>
    </template>
    <template v-else>
      <template v-if="$q.screen.gt.xs && uiStore.app">
        <q-drawer
          v-if="show_list"
          side="left"
          v-model="uiStore.navigatorDrawer"
          :breakpoint="640"
          :width="uiStore.navDrawerWidth"
          class="border-right"
          :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'"
        >
          <div v-if="uiStore.app === 'teams' || uiStore.app === 'threads'"
            class="absolute-full column no-wrap"
          >
            <template v-if="team">
              <q-list v-if="isAdmin && hasNewMembers" class="q-pa-sm" dense>
                <q-item class="bg-orange radius-xs" clickable ripple @click="openMemberManager">
                  <q-item-section side>
                    <q-icon name="info" />
                  </q-item-section>
                  <q-item-section>
                    有新成员加入
                  </q-item-section>
                </q-item>
              </q-list>
              <q-item v-if="!isExternal" class="q-px-sm">
                <q-item-section>
                  <div class="row no-wrap items-center">
                    <q-btn dense flat no-caps
                      padding="xs sm" align="left"
                      icon-right="mdi-chevron-down"
                      class="no-wrap font-bold-600"
                      :style="`max-width: ${uiStore.navDrawerWidth - 40}px`"
                    >
                      <span class="text-limit q-pr-sm">{{ team.display_name }}</span>
                      <TeamMenu v-if="!userStatus_byTeam" :team ref="teamMenu" />
                    </q-btn>
                    <q-space />
                    <q-btn v-if="
                      (enable_project && useAuths('create', ['project']))
                      || (enable_channel && useAuths('create', ['channel']))"
                    dense size="sm" flat round icon="add">
                      <TeamAddmenu />
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
              <div v-if="userStatus_byTeam" class="q-px-md full-width">
                <q-card class="bg-purple" bordered>
                  <q-card-section>
                    <div class="text-h4">
                      {{ userStatus_byTeam === 'blocked' ? $t('field_blocked')
                        : userStatus_byTeam === 'unconfirmed' ? $t('field_unconfirmed') : ''}}
                    </div>
                    <div class="q-mt-sm">
                      <template v-if="userStatus_byTeam === 'blocked'">
                        {{ $t("userStatus_byTeam_blocked") }}
                      </template>
                      <template v-else-if="userStatus_byTeam === 'unconfirmed'">
                        {{ $t("userStatus_byTeam_unconfirmed") }}
                      </template>
                    </div>
                    <div class="q-mt-sm">
                      {{ $t("userStatus_byTeam_tip") }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <SideNavigation v-else-if="enable_project || enable_channel"
                class="q-space"
                :team="team"
                :width="uiStore.navDrawerWidth"
                :class="isExternal ? 'q-pt-sm' : ''"
              />
            </template>
            <TeamList
              v-else-if="teamStore.init && !teamStore.init.default_team"
              :bordered="false"
              :spaced="false"
              :separator="true"
              assignStyle="transparent"
              :forceDard="true"
            />
          </div>
          <ChatNavigation v-if="uiStore.app === 'chats'" />
          <AffairsList v-if="uiStore.app === 'affairs'" />
          <FollowedList v-if="uiStore.app === 'brand'" />
          <NotebookList v-if="uiStore.app === 'notebooks'" />
          <BussinessMenu v-if="uiStore.app === 'business'" />
          <DiscoverNavigator v-if="uiStore.app === 'discover'" />
          <DeliverNavigator v-if="uiStore.app === 'deliver'" />
          <StudioNavigation v-if="uiStore.app === 'studio'" />
          <slot name="left_drawer" v-if="uiStore.app === 'aichat'" />
        </q-drawer>
        <RightPannel />
      </template>
      <q-page-container>
        <q-page>
          <div v-if="haveSubNav"
            class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
            :class="dragWidth && dragSide === 'left' ? 'bg-primary ' : ''"
            :style="dragWidth && dragSide === 'left' ? 'width: 3px' : 'width: 10px'"
            @mousedown="handleMouseDown('left')"
            @dblclick="uiStore.navDrawerWidth = 210"
          >
            <q-icon
              :name="`mdi-chevron-${uiStore.navigatorDrawer ? 'left' : 'right'}`"
              color="primary"
              size="sm"
              @click="toggleNavDrawer()"
              class="cursor-pointer toggle-btn transition z-max"
              :style="`transform: translateX(${
                uiStore.navigatorDrawer ? -16 : 12
              }px)`"
            >
              <q-tooltip class="border" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
                shift + {{ uiStore.navigatorDrawer ? '<' : '>' }}
              </q-tooltip>
            </q-icon>
          </div>
          <slot />
          <div v-if="uiStore.projectRightDrawer"
            class="absolute-right full-height hover-col-resize flex flex-center toggle-container z-max"
            :class="dragWidth && dragSide === 'right' ? 'bg-primary ' : ''"
            :style="dragWidth && dragSide === 'right' ? 'width: 3px' : 'width: 10px'"
            @mousedown="handleMouseDown('right')"
            @dblclick="uiStore.rightDrawerWidth = 420"
          >
            <q-icon
              name="mdi-chevron-right"
              color="primary"
              size="sm"
              @click="uiStore.projectRightDrawer = false"
              class="cursor-pointer toggle-btn transition z-max"
              :style="`transform: translateX(${
                uiStore.projectRightDrawer ? -16 : 12
              }px)`"
            >
            </q-icon>
          </div>
          <div v-if="showBrand && $q.screen.gt.xs"
            class="absolute-full flex flex-center"
            :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-3'"
          >
            <WelcomePage v-if="enable_project" />
            <BgBrand v-else />
          </div>
        </q-page>
        <q-dialog v-model="uiStore.createTeam" persistent>
          <CreateTeam @cannelCreate="uiStore.createTeam = false" />
        </q-dialog>
      </q-page-container>
    </template>
  </q-layout>
</template>

<script setup>
import {computed, reactive, ref, watch, onMounted } from "vue";
import {useRoute} from "vue-router";

import CreateTeam from "src/pages/team/components/CreateTeam.vue";

import TeamMenu from "src/pages/team/components/TeamMenu.vue";
import SideNavigation from "src/pages/team/components/SideNavigation.vue";
import TeamAddmenu from "src/pages/team/components/TeamAddmenu.vue";
import WelcomePage from "src/pages/team/WelcomePage.vue";
import TeamList from "src/pages/team/components/TeamList.vue";
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import {useMouse} from "@vueuse/core";
import {useQuasar} from "quasar";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import {enable_channel, enable_project, isExternal,} from "src/pages/team/hooks/useConfig.js";
import RemovedPic from './components/widgets/icons/RemovedPic.vue'
import ChatNavigation from './chat/components/ChatNavigation.vue'
import AffairsList from 'src/pages/team/todo/affairs/AffairsList.vue'
import FollowedList from 'src/pages/ChannelPage/FollowedList.vue'
import NavigatorHeader from './components/NavigatorHeader.vue'
import RightPannel from './components/RightPannel.vue'
import NotebookList from './notebook/NotebookList.vue'
import BussinessMenu from '../business/BussinessMenu.vue'
import DiscoverNavigator from './discover/DiscoverNavigator.vue'
import DeliverNavigator from '../deliver/DeliverNavigator.vue'
import StudioNavigation from '../studio/StudioNavigation.vue'
import { $ui } from "src/boot/service";

// 团队状态是否存在 blocked 或 unconfirmed
const userStatus_byTeam = computed(() => teamStore.team?.status);

const $q = useQuasar();

const route = useRoute();
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

const hasNewMembers = computed(() => {
  const unconfirmedRole = teamStore.team?.member_roles?.find(i => i.subject === 'unconfirmed');
  const unconfirmeds = teamStore.team?.members.filter(i => i.member_roles.map(j => j.id)?.includes(unconfirmedRole.id));
  
  return unconfirmeds?.length > 0
})
const isAdmin = computed(() => {
  const adminRole = teamStore.team?.member_roles?.find(i => i.subject === 'admin');  
  const admins = teamStore.team?.members.filter(i => i.member_roles.map(j => j.id)?.includes(adminRole.id));
  
  return !!admins.find(i => i.by_user?.id === teamStore.init?.id)
})

const teamMenu = ref(null)
const openMemberManager = () => {
  teamMenu.value.menu.show();
  teamMenu.value.openMemberManager = true
}

const haveSubNav = computed(() => {
  return $ui().can_drag_apps.includes(uiStore.app) && $q.screen.gt.xs;
});

const toggleNavDrawer = () => {
  uiStore.navigatorDrawer = !uiStore.navigatorDrawer;
};

const dragSide = ref('left');
const { x } = useMouse({ touch: false });
const navDrawerMinWidth = ref(180);
const navDrawerMaxWidth = ref(340);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});
const handleMouseDown = (side) => {
  uiStore.disable_selected = true;
  dragSide.value = side;
  position.x = x.value;
  dragWidth.value = true;
  if(side === 'left') {
    _ori_width.value = uiStore.navDrawerWidth;
    navDrawerMinWidth.value = 180;
    navDrawerMaxWidth.value = 340;
  } else {
    _ori_width.value = uiStore.rightDrawerWidth;
    navDrawerMinWidth.value = 240;
    navDrawerMaxWidth.value = 860;
  }
  uiStore.dragging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.dragging = false;
  uiStore.disable_selected = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = dragSide.value === 'left' ? x.value - position.x : position.x - x.value  ;
  if (
    _ori_width.value + deltaX >= navDrawerMinWidth.value &&
    _ori_width.value + deltaX <= navDrawerMaxWidth.value
  ) {
    if (dragSide.value === 'left') {
      uiStore.navDrawerWidth = _ori_width.value + deltaX;
    } else {
      uiStore.rightDrawerWidth = _ori_width.value + deltaX;
    }
  } else if (_ori_width.value + deltaX > navDrawerMaxWidth.value) {
    if (dragSide.value === 'left') {
      uiStore.navDrawerWidth = navDrawerMaxWidth.value;
    } else {
      uiStore.rightDrawerWidth = navDrawerMaxWidth.value;
    }
  } else if (_ori_width.value + deltaX === navDrawerMaxWidth.value) {
    if (dragSide.value === 'left') {
      uiStore.navDrawerWidth = navDrawerMinWidth.value;
    } else {
      uiStore.rightDrawerWidth = navDrawerMinWidth.value;
    }
  } else if (_ori_width.value + deltaX < 50) {
    if (dragSide.value === 'left') {
      uiStore.navigatorDrawer = false;
    } else {
      uiStore.projectRightDrawer = false;
    }
  }
};
const show_list = computed(() => (uiStore.app === 'affairs' && teamStore.init?.todogroups?.length > 0) || uiStore.app !== 'affairs')
</script>

<style scoped>
</style>
