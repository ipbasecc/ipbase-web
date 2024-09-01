<template>
  <q-layout view="lHr LpR lFr" container>
    <q-header v-if="kanban_id && !uiStore.activeReel && ((!teamStore.kanban_rightDrawer && !$q.screen.gt.xs) || $q.screen.gt.xs)" class="transparent">
      <q-bar
        class="border-bottom gap-sm q-pr-none overflow-hidden"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
        style="height: 2.3rem"
      >
        <q-btn
          v-if="!$q.screen.gt.xs"
          flat dense
          size="sm"
          icon="mdi-chevron-left"
         :color="$q.dark.mode
            ? 'white'
            : 'black'
          "
          @click="backList()"
        />
        <q-btn
          flat dense
          size="sm"
          icon="mdi-refresh"
         :color="$q.dark.mode
            ? 'white'
            : 'black'
          "
          @click="refresh()"
        >
          <q-tooltip>
            {{ $t('refresh') }}
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
         :color="$q.dark.mode
            ? 'white'
            : 'black'
          " dense flat icon="flip" @click="toggleRightDrawer('drop_kanban')">
          <q-tooltip class="border font-medium" :class="$q.dark.mode ? 'bg-dark text-white' : 'bg-white text-black'">
            {{ $t('splite_kanban_tip') }}
          </q-tooltip>
        </q-btn>
        <q-btn-group v-if="show_viewModel_togger && $q.screen.gt.xs" flat class="border">
          <q-btn
            v-for="i in view_models"
            :key="i.val"
            dense
            padding="4px 10px"
            :label="$t(i.label)"
            :icon="i.icon"
            :color="view_model === i.val ? 'primary' : ''"
            :class="
              view_model === i.val
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
            @click="set_view_model(i.val)"
          />
        </q-btn-group>
        <q-btn
          v-if="teamStore.kanban_rightDrawer !== 'drop_kanban'"
          :flat="teamStore.kanban_rightDrawer !== 'private_todos'"
          dense
          unelevated
          :color="
            teamStore.kanban_rightDrawer === 'private_todos'
              ? 'positive'
              : $q.dark.mode
              ? 'white'
              : 'black'
          "
          icon="task_alt"
          :class="
            teamStore.kanban_rightDrawer === 'private_todos' ? '' : 'op-7'
          "
          @click="toggleRightDrawer('private_todos')"
        />
        <q-input
          v-model="teamStore.filter_txt"
          type="text"
          flat
          dense
          filled
          square
          class="no-padding"
          :class="$q.dark.mode ? '' : 'bg-white border-left'"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-bar>
    </q-header>
    <q-drawer
      v-if="teamStore.kanban && $q.screen.gt.xs"
      v-model="rightDrawer"
      side="right"
      :class="`
        ${uiStore.split_kanban_active === 'right' ? $q.dark.mode ? 'bg-black border-primary border' : 'bg-grey-1 border-primary border' : $q.dark.mode ? 'bg-darker' : 'bg-grey-3'}`
      "
      :width="rightDrawer_width"
      class="q-pa-xs"
      @show="onShow"
      @hide="onHide"
      @click="activeSplite('right')"
    >
      <TodoPage
        v-if="teamStore.kanban_rightDrawer === 'private_todos'"
        :kanban_id="teamStore.kanban?.id"
      />
      <ThreadContainer
        v-if="teamStore.kanban_rightDrawer === 'thread' && teamStore.thread"
        class="radius-xs border"
        :showRootpost="false"
        :chatInfo
        @closeThread="closeThread"
      />
      <KanbanModel
        v-if="teamStore.kanban_rightDrawer === 'drop_kanban' && teamStore?.project?.id && teamStore.dropKanbanID"
        :project_id="teamStore?.project.id"
        :kanban_id="teamStore.dropKanbanID"
        view_model="kanban"
      />
      <div v-else class="fit flex flex-center font-medium">
        {{ $t('splite_kanban_right_view_tip') }}
      </div>
    </q-drawer>

    <q-page-container v-element-size="onResize">
      <q-page :class="`
        ${uiStore?.draging ? 'unselected' : ''}
        ${uiStore.split_kanban_active === 'left' ? $q.dark.mode ? 'bg-black border-primary border' : 'bg-grey-1 border-primary border' : $q.dark.mode ? 'bg-darker' : 'bg-grey-3'}
      `"
      @click="activeSplite('left')">
        <KanbanModel
          v-if="kanban_id"
          ref="KanbanModelRef"
          :key="`kanban-${kanban_id}`"
          :project_id="Number(project_id)"
          :kanban_id="Number(kanban_id)"
          :view_model="view_model"
        />
        <div v-if="!kanban_id && $q.screen.gt.xs" class="absolute-full flex flex-center">
          <BgBrand />
        </div>
        <template v-if="!$q.screen.gt.xs">
          <ThreadContainer v-if="teamStore.kanban_rightDrawer === 'thread' && teamStore.thread"
              :showRootpost="false"
              :chatInfo
              class="absolute-full"
              :class="$q.dark.mode ? 'bg-darker text-grey-1' : 'bg-grey-1 text-grey-10'"
              @closeThread="closeThread"
          />
          <TodoPage v-if="teamStore.kanban_rightDrawer === 'private_todos'"
            class="absolute-full"
            :kanban_id="teamStore.kanban?.id"
          >
            <template #bar_left>
              <q-btn flat dense icon="close" @click="teamStore.kanban_rightDrawer = void 0" />
            </template>
          </TodoPage>
        </template>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {computed, watchEffect, ref, toRefs, onMounted} from 'vue';
import { useRouter, useRoute } from "vue-router";

import KanbanModel from "./KanbanModel.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import localforage from "localforage";
import ThreadContainer from "../chat/ThreadContainer.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import {
  board_type,
} from "./BoradsList.js";
import { ensureTrailingSlash } from 'src/hooks/utilits.js'
import { getProjectNav } from "src/pages/team/components/SideNavigation.js";
import { vElementSize } from '@vueuse/components'

const props = defineProps({
  project_id: {
    type: String,
    default: "",
  },
  kanban_id: {
    type: String,
    default: "",
  },
});
const { project_id, kanban_id } = toRefs(props);
const route = useRoute();
const router = useRouter();
onMounted(() => {
  setTimeout(async() => {
    if(!route.params?.kanban_id) {
      let nva = await getProjectNav(project_id.value);
      const res = await localforage.getItem(`___last_${nva}_of_project_${project_id.value}`);
      if(res) {
        await router.push(`${ensureTrailingSlash(route.path)}${res.id}`);
      }
    }
  }, 500);
})
const view_models = ref()
const all_view_models = [
  { val: "kanban", label: "kanban", icon: "view_kanban" },
  { val: "segment", label: "segment", icon: "mdi-film" },
  { val: "list", label: "list", icon: "format_list_bulleted" },
  { val: "quadrant", label: "quadrant", icon: "border_inner" },
];
const conflicts = ["kanban", "segment"];
const ex_conflicts = computed(() => conflicts.filter((i) => i !== teamStore?.navigation));
watchEffect(() => {
  view_models.value = all_view_models.filter(
    (i) => !ex_conflicts.value?.includes(i.val)
  );
})
const show_viewModel_togger = computed(() => {
  const _show = ["kanban", "segment"];
  return _show.includes(teamStore?.kanban?.type);
});

const chatInfo = computed(() => ({
  mm_channel_id: teamStore.project?.mm_channel?.id,
  post_id: teamStore.thread?.id,
}));

const view_model = ref();
const get_view_model = async () => {
  const res = await localforage.getItem(
    `__kanban_${kanban_id.value}_view_model`
  );
  if (res) {
    view_model.value = res;
  }
};
get_view_model();
const set_view_model = async (val) => {
  if (!kanban_id.value) return;
  view_model.value = val;
  await localforage.setItem(`__kanban_${kanban_id.value}_view_model`, val);
};

const onResize = ({ width, height }) => {
  // uiStore.mainWindowSize = size;
  uiStore.mainWindowSize = {
    width: width,
    height: height,
  };
};

const activeSplite = (val) => {
  if(teamStore.kanban_rightDrawer === 'drop_kanban'){
    uiStore.split_kanban_active = val;
  }
}

watchEffect(() => {
  if (
    route?.name === "team_kanban_homepage" ||
    route?.name === "team_kanban_page"
  ) {
    teamStore.navigation = "kanban";
    view_model.value = "kanban";
  }
  if (
    route?.name === "team_classroom_homepage" ||
    route?.name === "team_classroom_page"
  ) {
    teamStore.navigation = "classroom";
    view_model.value = "kanban";
  }
  if (
    route?.name === "team_segment_homepage" ||
    route?.name === "team_segment_page"
  ) {
    teamStore.navigation = "segment";
    view_model.value = "segment";
    uiStore.activeReel = NaN;
  }
});

const rightDrawer = computed(() =>
  teamStore.kanban_rightDrawer ? true : false
);
const navigatorDrawer = ref();
const onShow = () => {
  navigatorDrawer.value = uiStore.navigatorDrawer;
  uiStore.navigatorDrawer = false;
  if(teamStore.kanban_rightDrawer === 'drop_kanban'){
    uiStore.split_kanban_active = 'right';
  }
}
const onHide = () => {
  teamStore.dropKanbanID = void 0;
  teamStore.kanban_rightDrawer = void 0;
  uiStore.navigatorDrawer = navigatorDrawer.value;
  uiStore.split_kanban_active = void 0;
}

const toggleRightDrawer = (val) => {
  teamStore.kanban_rightDrawer = teamStore.kanban_rightDrawer === val ? null : val;
};
const rightDrawer_width = computed(() =>
  teamStore.kanban_rightDrawer === "thread" ? 460 
  : teamStore.kanban_rightDrawer === 'drop_kanban' ? uiStore.mainWindowSize?.width / 2
  : 400
);
const closeThread = () => {
  teamStore.kanban_rightDrawer = null;
  teamStore.thread = null;
};
const backList = () => {
  uiStore.showMainContentList = true;
  teamStore.kanban_id = void 0;
  teamStore.kanban = void 0;
  router.push(`/teams/projects/${teamStore.project?.id}/${board_type.value}`);
}

const KanbanModelRef = ref();
const refresh = () => {
  let _kanban
  if(teamStore.card){
    _kanban = teamStore.cardKanban;
  } else {
    _kanban = teamStore.kanban
  }
  if(_kanban){
    KanbanModelRef.value?.initKanban(_kanban.id);
  }
}
</script>
