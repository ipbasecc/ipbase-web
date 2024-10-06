<template>
  <q-layout view="lHr LpR lFr" container>
    <q-header v-if="kanban_id && !uiStore.activeReel && ((!teamStore.kanban_rightDrawer && !$q.screen.gt.xs) || $q.screen.gt.xs)" class="transparent">
      <q-bar
        class="border-bottom gap-sm q-pr-none overflow-hidden"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
        style="height: 2.3rem"
      >
        <q-btn v-if="!$q.screen.gt.xs"
          flat dense size="sm" icon="mdi-chevron-left"
          :color="$q.dark.mode ? 'white' : 'black'"
          @click="backList()"
        />
        <q-btn flat dense size="sm" icon="mdi-refresh"
         :color="$q.dark.mode ? 'white' : 'black'"
          @click="refresh()"
        >
          <q-tooltip>
            {{ $t('refresh') }}
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn v-if="$q.screen.gt.md && view_model === 'kanban'" dense flat icon="flip"
         :color="$q.dark.mode ? 'white' : 'black'"
         @click="toggleSplitterView()">
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
            :disable="uiStore.splitterView"
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
          dense unelevated icon="task_alt"
          :color="
            teamStore.kanban_rightDrawer === 'private_todos'
              ? 'positive'
              : $q.dark.mode
              ? 'white'
              : 'black'
          "
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
      class="q-pa-xs border-left"
    >
      <AffairsContainer v-if="teamStore.kanban_rightDrawer === 'private_todos'"
        :todogroups="personal_kanbanTodo"
        :hideToolbar="true"
        _for="personal_projectKanbanTodo"
        layout="column"
        class="fit"
      />
      <ThreadContainer
        v-if="teamStore.kanban_rightDrawer === 'thread' && teamStore.thread"
        class="radius-xs border"
        :showRootpost="false"
        :chatInfo
        @closeThread="closeThread"
      />
    </q-drawer>

    <q-page-container v-element-size="onResize">
      <q-page :class="`${uiStore?.draging ? 'unselected' : ''}`">
        <q-splitter v-model="splitterModel"
          :limits="[0, Infinity]"
          class="absolute-full"
          :separator-style="uiStore.splitterView ? '' : 'display: none'"
          :beforeClass="splitterModelClass('left')"
          :afterClass="splitterModelClass('right')"
        >
          <template v-slot:before>
            <div class="absolute-full" @click="activeSplite('left')">
              <KanbanModel v-if="kanban_id"
                ref="KanbanModelRef"
                belong="project_kanban"
                :key="`kanban-${kanban_id}`"
                :project_id="Number(project_id)"
                :kanban_id="Number(kanban_id)"
                :view_model="view_model"
              />
            </div>
          </template>
          <template v-if="uiStore.splitterView" v-slot:separator>
          </template>
          <template v-if="uiStore.splitterView" v-slot:after>
            <div class="absolute-full" @click="activeSplite('right')">
              <KanbanModel v-if="teamStore?.project?.id && teamStore.dropKanbanID"
                :project_id="teamStore?.project.id"
                :kanban_id="teamStore.dropKanbanID"
                belong="project_dropKanban"
                view_model="kanban"
              />
              <div v-if="!teamStore.dropKanbanID"
                class="fit flex flex-center font-medium">
                {{ $t('splite_kanban_right_view_tip') }}
              </div>
            </div>
          </template>
        </q-splitter>
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
          <AffairsContainer v-if="teamStore.kanban_rightDrawer === 'private_todos'"
            :todogroups="personal_kanbanTodo"
            :hideToolbar="true"
            _for="personal_projectKanbanTodo"
            layout="column"
            class="fit"
          />
        </template>
        <template v-if="$q.screen.gt.xs && !teamStore.card">
          <q-dialog v-model="uiStore.topPannel" seamless position="top" full-width>
            <div class="q-pt-md overflow-show">
              <q-card bordered @mouseenter="setTip" @mouseleave="showDeleteTip = false" class="radius-md shadow-24">
                  <q-card-section style="height: 4rem;width: 50vw" class="border full-width">
                    <VueDraggable v-model="_dropItems"
                                  :group="uiStore.dropGroup"
                                  ref="draggableRef"
                                  class="fit flex flex-center overflow-hidden op-1"
                                  @end="showDeleteTip = false"
                    >
                    </VueDraggable>
                    <div class="absolute-full flex flex-center">
                      <div class="absolute-full q-pa-xs">
                        <div class="radius-sm" :class="showDeleteTip ? 'bg-negative op-1 fit' : ''" />
                      </div>
                      <q-avatar v-if="!showDeleteTip" size="lg" color="red" text-color="white" icon="mdi-delete-forever" />
                      <q-chip
                          v-else
                          color="negative"
                          size="md"
                          text-color="white"
                          icon="mdi-delete-forever"
                          :label="$t('delete_card_warning')"
                      />
                    </div>
                  </q-card-section>
              </q-card>
            </div>
            
          </q-dialog>
        </template>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {computed, watchEffect, ref, toRefs, onMounted} from 'vue';
import { useRouter, useRoute } from "vue-router";

import KanbanModel from "./KanbanModel.vue";
import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import localforage from "localforage";
import ThreadContainer from "../chat/ThreadContainer.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import { board_type } from "./BoradsList.js";
import { ensureTrailingSlash } from 'src/hooks/utilits.js'
import { getProjectNav } from "src/pages/team/components/SideNavigation.js";
import { vElementSize } from '@vueuse/components'
import { useQuasar } from 'quasar';
import {VueDraggable} from "vue-draggable-plus";
import { removeCard } from "src/hooks/team/useCard.js";
import { deleteTodogroup } from "src/api/strapi/project.js";

const _dropItems = ref([]);
const showDeleteTip = ref(false)
const setTip = () => {
  if(uiStore.dropGroup) {
    showDeleteTip.value = true
  }
}
const personal_kanbanTodo = ref();
watchEffect(async () => {
  personal_kanbanTodo.value = teamStore.init?.todogroups?.filter(i => i.kanban?.id === teamStore.kanban?.id) || []
  if (_dropItems.value?.length > 0) {
    if(uiStore.dropGroup === 'tasks'){
        await Promise.all(_dropItems.value.map((card) => removeCard(card)));
        _dropItems.value = [];
    }
    if(uiStore.dropGroup === 'todogroup'){
        await Promise.all(_dropItems.value.map((i) => deleteTodogroup(i.id)));
        _dropItems.value = [];
    }
    uiStore.dropGroup = void 0;
  }
});

const $q = useQuasar();
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

const splitterModel = ref(100);
const lastSplitterModel = ref();
watchEffect(() => {
  if(splitterModel.value !== 100){
    lastSplitterModel.value = splitterModel.value;
  }
})
const navigatorDrawerStatus = uiStore.navigatorDrawer
const toggleSplitterView = () => {
  uiStore.splitterView = !uiStore.splitterView;
  if(uiStore.splitterView){
    uiStore.navigatorDrawer = false
  } else {
    uiStore.navigatorDrawer = navigatorDrawerStatus
  }
  splitterModel.value = uiStore.splitterView ? lastSplitterModel.value || 50 : 100
  uiStore.split_kanban_active = uiStore.splitterView ? 'right' : void 0
  set_view_model('kanban')
}
const activeSplite = (val) => {  
  if(uiStore.splitterView){
    uiStore.split_kanban_active = val;
  }
}
const splitterModelClass = (side) => {
  const activeClass = $q.dark.mode ? 'bg-black border-primary border' : 'bg-grey-1 border-primary border'
  const normalClass = $q.dark.mode ? 'bg-darker border-placeholder' : 'bg-grey-3 border-placeholder'
  if(side === 'left'){
    return uiStore.split_kanban_active === 'left' ? activeClass : normalClass
  }
  if(side === 'right'){
    return uiStore.split_kanban_active === 'right' ? activeClass : normalClass
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

const toggleRightDrawer = (val) => {
  teamStore.kanban_rightDrawer = teamStore.kanban_rightDrawer === val ? null : val;
};
const rightDrawer_width = computed(() => teamStore.kanban_rightDrawer === "thread" ? 460 : 400);
const closeThread = () => {
  teamStore.kanban_rightDrawer = null;
  teamStore.thread = null;
};
const backList = () => {
  uiStore.showMainContentList = true;
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
