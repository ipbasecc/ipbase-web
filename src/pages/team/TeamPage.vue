<template>
  <NavigatorContainer>
    <template v-if="teamStore.navigatorDrawer && !$q.screen.gt.xs">
      <SideNavigation v-if="team"
        class="absolute-full"
        :team
        :class="team.isExternal ? 'q-pt-sm' : ''"
      />
      <TeamList v-else-if="
          !$q.screen.gt.xs &&
          teamStore.init &&
          !teamStore.init.default_team
        "
        :bordered="false"
        :spaced="false"
        :separator="true"
        assignStyle="transparent"
        :forceDard="true"
        @createTeam="createing = true"
      />
    </template>
    <q-layout v-else view="hHh LpR lFr" container
      :class="dragWidth ? 'col-resize' : ''"
      class="absolute-full"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp">
      <ProjectHeader v-if="teamStore?.project && !uiStore.activeReel && !uiStore.isFocusMode" />
      <template v-if="teamStore.navigation && (teamStore.navigation !== 'chat' || teamMode === 'toMany')">
        <q-drawer
          v-if="
            $q.screen.gt.xs
            && uiStore.app === 'teams'
            && teamStore?.project_id
            && !uiStore.isFocusMode
          "
          v-model="uiStore.projectLeftDrawer"
          side="left"
          class="column border-right"
          :width="leftDrawerWidth"
        >
          <BoradsList v-if="showBoard" />
          <template v-else-if="teamStore.navigation === 'chat'">
            <ChatList />
            <q-space />
          </template>
          <StorageList v-else-if="teamStore.navigation === 'storage' && teamStore.project?.storages"
            :storages="teamStore.project?.storages"
            :by_info="byInfo"
            :sortAuth="useAuths('modify', ['project'])"
          />
          <ScheduleList v-else-if="teamStore.navigation === 'schedule'"
            :schedules="teamStore.project?.schedules"
            :by_info="byInfo"
          />
          <DocumentList v-else-if="teamStore.navigation === 'document'"
            :sortAuth="useAuths('modify', ['project'])"
            :documents="teamStore.project.project_documents"
            :by_info="byInfo"
          />
          <BudgetList v-else-if="teamStore.navigation === 'budget'" />
          <div v-else class="absolute-full column flex-center">
            <div class="col-4 column flex-center">
              <span class="op-5">{{ $t('enter_functions') }}</span>
              <span class="text-orange">{{ $t('click_right_navigation') }}</span>
            </div>
            <q-space />
          </div>
          <div v-if="dragWidth" class="absolute-full"></div>
        </q-drawer>
      </template>
      <q-drawer
        v-if="teamStore?.project_id && $q.screen.gt.xs && teamStore.rightDrawerOpen"
        v-model="teamStore.rightDrawerOpen"
        side="right"
        :width="teamStore.rightDrawerWidth"
        class="border-left"
      >
        <MemberManager
          v-if="teamStore.rightDrawer === 'member_manager' && teamStore?.project?.id"
          :byInfo
        />
        <FlagsContainder
          v-else-if="teamStore.rightDrawer === 'flaggeds'"
          :headerless="false"
        />
        <JoinRequestlist
          v-else-if="teamStore.rightDrawer === 'join_request' && teamStore?.project?.id"
          :project="teamStore.project"
        />
        <ChatContainter v-else-if="teamStore.rightDrawer === 'chat_pannel'"
          class="border-left"
          :mm_channel_id="teamStore.project?.mm_channel?.id"
          :pannel_mode="true"
          :key="teamStore.project?.mm_channel?.id"
        />
      </q-drawer>

      <q-page-container>
        <q-page :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-3'">
          <div v-if="$q.screen.gt.xs"
            class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
            :class="dragWidth ? 'bg-primary ' : ''"
            :style="dragWidth ? 'width: 3px' : 'width: 10px'"
            @mousedown="handleMouseDown"
          >
            <q-icon
              :name="`mdi-chevron-${uiStore.projectLeftDrawer ? 'left' : 'right'}`"
              color="primary"
              size="sm"
              @click="toggleleftDrawer"
              class="cursor-pointer toggle-btn transition z-max"
              :style="`transform: translateX(${uiStore.projectLeftDrawer ? -16 : 12}px)`"
            >
              <q-tooltip class="border" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
                shift + {{ uiStore.projectLeftDrawer ? '<' : '>' }}
              </q-tooltip>
            </q-icon>
          </div>
          <div class="absolute-full">
            <router-view v-show="$q.screen.gt.xs || !uiStore.showMainContentList" />
            <template v-if="!$q.screen.gt.xs && uiStore.showMainContentList">
              <BoradsList v-if="showBoard" />
              <template v-if="teamStore.navigation === 'chat' && teamStore.project">
                <ChatList />
              </template>
              <StorageList v-if="teamStore.navigation === 'storage' && teamStore.project?.storages"
                :storages="teamStore.project?.storages"
                :by_info="byInfo"
                :sortAuth="useAuths('modify', ['project'])"
              />
              <ScheduleList
                  v-if="teamStore.navigation === 'schedule'"
                  :schedules="teamStore.project?.schedules"
                  :by_info="byInfo"
              />
              <DocumentList
                  v-if="teamStore.navigation === 'document'"
                  :sortAuth="useAuths('modify', ['project'])"
                  :documents="teamStore.project?.project_documents"
                  :by_info="byInfo"
              />
            </template>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </NavigatorContainer>
</template>

<script setup>
import {ref, watch, computed, reactive, provide, watchEffect, onUnmounted, onMounted, nextTick} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMouse } from '@vueuse/core'

import NavigatorContainer from './NavigatorContainer.vue'
import FlagsContainder from "src/pages/team/chat/FlagsContainder.vue";

import BoradsList from "src/pages/team/kanban/BoradsList.vue";
import ChatList from "src/pages/team/chat/ChatList.vue";
import StorageList from "src/pages/team/storage/StorageList.vue";
import ScheduleList from "src/pages/team/schedule/ScheduleList.vue";
import DocumentList from "src/pages/team/document/DocumentList.vue";
import MemberManager from "src/pages/team/settings/MemberManager.vue";
import ProjectHeader from "./components/ProjectHeader.vue";

import { uiStore, teamStore } from "src/hooks/global/useStore.js";
import { findRoles } from 'src/pages/team/hooks/useMember.js'
import SideNavigation from "pages/team/components/SideNavigation.vue";
import TeamList from "pages/team/components/TeamList.vue";
import BudgetList from './budget/BudgetList.vue'
import JoinRequestlist from './settings/JoinRequestlist.vue'
import ChatContainter from "./chat/ChatContainter.vue";
import { setLastChannel } from "src/pages/team/chat/TeamChat.js";

const route = useRoute();
const router = useRouter();

const isExternal = ref();
const team = computed(() => teamStore.team);
const teamMode = computed(() => teamStore.team?.config?.mode || 'toMany');
const user_roles = computed(() => findRoles(team.value?.members, team.value?.member_roles));
const gotoProjectChannel = async (project) => {
  if(!project || !project.mm_channel) return;
  await setLastChannel(project.id, project.mm_channel?.id);
  teamStore.mm_channel = project.mm_channel;
  await router.push(`/teams/projects/${project?.id}/chat/${project.mm_channel?.id}`);
  uiStore.showMainContentList = false;
};
watchEffect(async () => {
  // console.log('user_roles',user_roles.value);
  isExternal.value = user_roles.value?.includes('external')
  if(teamStore.rightDrawer === 'chat_pannel' && teamStore.navigation === 'chat'){
    teamStore.rightDrawerOpen = false
  }
  if(teamMode.value === 'toOne' && teamStore.navigation === 'chat'){
    console.log('init mm_channel 2');
    const project = teamStore.project
    await gotoProjectChannel(project)
  }
})

const toggleleftDrawer = () => {
  uiStore.projectLeftDrawer = !uiStore.projectLeftDrawer;
};
const { x } = useMouse({ touch: false })
const leftDrawerWidth = ref(180);
const leftDrawerMinWidth = ref(140);
const leftDrawerMaxWidth = ref(480);
const _ori_width = ref()
const dragWidth = ref(false)
const position = reactive({
  x: NaN,
  y: NaN
})
const handleMouseDown = () => {
  if(!uiStore.projectLeftDrawer){
    uiStore.projectLeftDrawer = true
  } else {
    position.x = x.value;
    dragWidth.value = true
    _ori_width.value = leftDrawerWidth.value
    uiStore.dragging = true
  }
}
const handleMouseUp = () => {
  dragWidth.value = false
  uiStore.dragging = false
}
const handleMouseMove = () => {
  if(!position.x || !dragWidth.value || !_ori_width.value) return
  const deltaX = x.value - position.x;
  if(_ori_width.value + deltaX >= leftDrawerMinWidth.value && _ori_width.value + deltaX <= leftDrawerMaxWidth.value){
    leftDrawerWidth.value = _ori_width.value + deltaX
  } else if(_ori_width.value + deltaX > leftDrawerMaxWidth.value) {
    leftDrawerWidth.value = leftDrawerMaxWidth.value
  } else if(_ori_width.value + deltaX === leftDrawerMaxWidth.value) {
    leftDrawerWidth.value = leftDrawerMinWidth.value
  } else if(_ori_width.value + deltaX < 50){
    uiStore.projectLeftDrawer = false
  }
}

const byInfo = ref({
  by: "project",
  project_id: computed(() => teamStore?.project?.id),
});
const createing = ref(false);

// you need filter Boards by Type in different Models, use teamStore.navigation value as filter's Key
const showBoard = computed(() => {
  const _show = ["kanban", "classroom", "resource", "segment"];
  return _show.includes(teamStore.navigation);
});

watch(route, () => {
  if (route?.params?.project_id) {
    teamStore.project_id = route.params.project_id;
  }
},{ immediate: true, deep: true });

watch(teamStore, () => {
  if (teamStore?.team?.status || teamStore?.team?.isExternal) {
    router.push("/teams");
  }
},{ immediate: true, deep: true });

provide('isExternal', isExternal.value)
onUnmounted(() => {
  teamStore.$reset_project();
  teamStore.$reset_channel();
})
</script>

<style lang="scss" scoped></style>
