<template>
  <q-layout
    view="hHh LpR lfr"
    container
    class="absolute-full no-scroll"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <NavigatorHeader />
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
      <template v-if="$q.screen.gt.xs">
        <q-drawer
          side="left"
          v-model="uiStore.navigatorDrawer"
          :breakpoint="640"
          :width="navDrawerWidth"
          class="border-right"
        >
          <div v-if="uiStore.app === 'teams' || uiStore.app === 'threads'"
            class="absolute-full column no-wrap"
            :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'"
          >
            <template v-if="team">
              <q-item v-if="!isExternal" class="q-px-sm">
                <q-item-section>
                  <div class="row no-wrap items-center">
                    <q-btn
                      dense
                      flat
                      no-caps
                      padding="xs sm"
                      :label="team.display_name"
                      icon-right="mdi-chevron-down"
                      class="no-wrap font-bold-600"
                    >
                      <TeamMenu v-if="!userStatus_byTeam" :team />
                    </q-btn>
                    <q-space />
                    <q-btn v-if="enalbe_project || enalbe_channel"
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
              <SideNavigation v-else-if="enalbe_project || enalbe_channel"
                class="q-space"
                :width="navDrawerWidth"
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
        </q-drawer>
        <q-drawer
          v-model="uiStore.projectRightDrawer"
          v-if="uiStore.projectRightDrawer && uiStore.projectRightDrawerContent"
          bordered
          side="right"
          :width="420"
        >
          <TodoPage
            v-if="
              uiStore.projectRightDrawerContent === 'person_todos' &&
              uiStore.app !== 'affairs'
            "
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
            v-if="haveSubNav"
            class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
            :class="dragWidth ? 'bg-primary ' : ''"
            :style="dragWidth ? 'width: 3px' : 'width: 10px'"
            @mousedown="handleMouseDown"
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
          <div
            v-if="showBrand && $q.screen.gt.xs"
            class="absolute-full flex flex-center"
            :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-3'"
          >
            <WelcomePage v-if="enalbe_project" />
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
import {computed, reactive, ref, watch,} from "vue";
import {useRoute} from "vue-router";

import FlagsContainder from "src/pages/team/chat/FlagsContainder.vue";
import CreateTeam from "src/pages/team/components/CreateTeam.vue";

import TeamMenu from "src/pages/team/components/TeamMenu.vue";
import SideNavigation from "src/pages/team/components/SideNavigation.vue";
import TeamAddmenu from "src/pages/team/components/TeamAddmenu.vue";
import WelcomePage from "src/pages/team/WelcomePage.vue";
import TeamList from "src/pages/team/components/TeamList.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import {useMouse} from "@vueuse/core";
import {useQuasar} from "quasar";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import {enalbe_channel, enalbe_project, isExternal,} from "src/pages/team/hooks/useConfig.js";
import RemovedPic from './components/widgets/icons/RemovedPic.vue'
import ChatNavigation from './chat/components/ChatNavigation.vue'
import AffairsList from 'src/pages/team/todo/affairs/AffairsList.vue'
import FollowedList from 'src/pages/ChannelPage/FollowedList.vue'
import NavigatorHeader from './components/NavigatorHeader.vue'

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
const haveSubNav = computed(() => {
  const enabelSubNavApps = ["teams", "chats", 'affairs', 'brand'];
  return enabelSubNavApps.includes(uiStore.app) && $q.screen.gt.xs;
});

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
</script>

<style scoped>
</style>
