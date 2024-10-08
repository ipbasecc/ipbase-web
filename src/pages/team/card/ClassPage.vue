<template>
  <q-card bordered class="fit q-space no-wrap row radius-sm shadow-focus relative-position">
    <q-layout
      v-if="teamStore?.card"
      view="lHh LpR lFf"
      container
      class="q-space"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp"
    >
      <q-header class="transparent">
        <q-bar
          class="border-bottom"
          :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
          style="height: 2.3rem"
        >
          <q-btn dense flat icon="menu" @click="toggleLeftDrawer" />
          <q-space />
          <q-chip v-if="activeVersion && teamStore.card?.overviews.filter(o => o.media)?.length > 1"
            outline dense flat color="primary" clickable class="q-px-sm no-shadow"
            :label="activeVersion.name === 'Initial_Version' ? $t(activeVersion.name) : activeVersion.name"
          >
            <q-menu 
            transition-show="jump-down"
            transition-hide="jump-up"
            :transition-duration="200">
              <VersionTogger
                :overviews="teamStore.card?.overviews"
                :authBase
                :overView_attachedTo="teamStore.card"
                @set_current_version="set_current_version"
                @set_defaultVersion="set_defaultVersion"
              />
            </q-menu>
          </q-chip>
          <q-space />
          <q-btn
            flat
            dense
            size="sm"
            round
            :icon="classExtendIcon()"
            :class="rightDrawerOpen ? '' : 'op-5'"
            :color="rightDrawerOpen ? 'positive' : ''"
            @click="toggleRightDrawer()"
          />
          <q-separator spaced inset vertical />
          <q-btn dense round flat icon="close" size="sm" v-close-popup />
        </q-bar>
      </q-header>
      <q-drawer
        v-model="leftDrawerOpen"
        side="left"
        :width="200"
        :breakpoint="500"
        :class="$q.dark.mode ? 'bg-darker border-right' : 'bg-grey-1 text-grey-10 border-right'"
      >
        <CoursesList :courses />
      </q-drawer>
      <q-drawer
        v-if="rightDrawerOpen"
        :key="teamStore.card?.id"
        v-model="rightDrawerOpen"
        side="right"
        :overlay="drawerOverlay"
        :width="rightDrawerWidth"
        class="border-left column no-wrap"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
      >
        <q-bar class="transparent border-bottom" style="height: 36px;">
          <q-tabs
            v-model="current_classExtend"
            inline-label
            dense
            no-caps
            stretch
          >
            <template v-for="i in classExtends" :key="i.id">
              <q-tab :name="i.name" :label="$t(i.label)" class="q-px-sm" />
            </template>
          </q-tabs>
          <q-space />

          <q-btn
            dense
            round
            flat
            icon="push_pin"
            :color="drawerOverlay ? '' : 'positive'"
            :class="drawerOverlay ? 'op-5' : ''"
            size="sm"
            @click="drawerOverlay = !drawerOverlay"
          />
        </q-bar>
        <div class="q-space relative-position">
          <template v-if="current_classExtend === 'class_overview'">
            <KeepAlive>
              <OverView wasAttached_to="card" class="absolute-full"
                :hideMedia="true"
              />
            </KeepAlive>
          </template>
          <template
            v-if="
              teamStore.card.mm_thread && current_classExtend === 'class_forum'
            "
          >
            <KeepAlive>
              <ThreadContainer
                :showToolbar="false"
                :chatInfo
                :showRootpost="false"
              />
            </KeepAlive>
          </template>
          <AffairsContainer v-if="current_classExtend === 'class_note'"
            :todogroups="personal_kanbanTodo"
            :card="teamStore.card"
            :hideToolbar="true"
            _for="personal_kanbanTodo"
            displayType="note"
            layout="column"
            class="fit"
          />
          <template v-if="current_classExtend === 'class_kanban'">
            <KanbanContainer
              v-if="
                !teamStore.card?.private || useAuths('read', ['column'])
              "
              :project_id="teamStore.project?.id"
              :kanban_id="teamStore.card?.card_kanban?.id"
              :hiddenToolbar="true"
            />
            <div v-else class="absolute-full flex flex-center op-3">
              {{ $t(no_premission_to_view) }}
            </div>
          </template>
          <template v-if="current_classExtend === 'class_documents'">
            <template v-if="!teamStore.card.private || useAuths('read', ['card_document'])">
              <DocumentBody
                v-if="teamStore.active_document"
                :current_document="teamStore.active_document"
                :withSaveBtb="true"
                :withImageBtb="true"
                :by_info="byInfo"
              />
              <DocumentList
                v-else
                :documents="teamStore.card.card_documents"
                :by_info="byInfo"
                :sortAuth="useAuths('modify', ['card'])"
              />
            </template>
            <div v-else class="absolute-full flex flex-center op-3">
              您无权查看此内容
            </div>
          </template>
          <template
            v-if="
              current_classExtend === 'class_storage' &&
              teamStore.card?.storage?.id
            "
          >
            <StoragePage :storage_id="teamStore.card.storage.id" by="card" />
          </template>
        </div>
        <div v-if="$q.screen.gt.xs"
          class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
          :class="dragWidth ? 'bg-primary ' : ''"
          :style="dragWidth ? 'width: 3px' : 'width: 10px'"
          @mousedown="handleMouseDown"
        >
          <q-icon
            :name="`mdi-chevron-${!rightDrawerOpen ? 'left' : 'right'}`"
            color="primary"
            size="sm"
            @click="toggleRightDrawer"
            class="cursor-pointer toggle-btn transition z-max"
            :style="`transform: translateX(-16px)`"
          />
        </div>
      </q-drawer>

      <q-page-container>
        <q-page :key="teamStore.card?.id" class="column flex-center"
        :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
        :style-fn="resetHeight">
          <KeepAlive>
            <OverView wasAttached_to="card" ref="overviewRef"
              :onlyMedia="true"
            />
          </KeepAlive>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-card>
</template>

<script setup>
import { ref, toRefs, computed, watchEffect, onMounted, reactive } from "vue";
import { findCard } from "src/api/strapi/project.js";
import OverView from "src/pages/team/components/OverView.vue";
import KanbanContainer from "./KanbanContainer.vue";
import DocumentList from "src/pages/team/document/DocumentList.vue";
import DocumentBody from "src/pages/team/document/DocumentBody.vue";
import StoragePage from "src/pages/team/storage/StoragePage.vue";
import ThreadContainer from "../chat/ThreadContainer.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import CoursesList from './components/CoursesList.vue'
import VersionTogger from './components/VersionTogger.vue'
import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
import { useMouse } from '@vueuse/core'

const props = defineProps({
  card: {
    type: Object,
    default: void 0,
  },
});
const { card } = toRefs(props);

const personal_kanbanTodo = ref([]);
watchEffect(async () => {
  personal_kanbanTodo.value = teamStore.init?.todogroups?.filter(i => i.kanban?.id === teamStore.card?.card_kanban?.id);
});
const emit = defineEmits(["closeCardList"]);

const rightDrawerWidth = ref(640);
const rightDrawerOpen = ref(false);
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};
const leftDrawerOpen = ref(true);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const { x } = useMouse({ touch: false })
const leftDrawerWidth = ref(180);
const leftDrawerMinWidth = ref(360);
const leftDrawerMaxWidth = ref(1280);
const _ori_width = ref()
const dragWidth = ref(false)
const position = reactive({
  x: NaN,
  y: NaN
})
const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true
  _ori_width.value = rightDrawerWidth.value
  uiStore.dragging = true
}
const handleMouseUp = () => {
  dragWidth.value = false
  uiStore.dragging = false
}
const handleMouseMove = () => {
  if(!position.x || !dragWidth.value || !_ori_width.value) return

  const deltaX = x.value - position.x;
  if(_ori_width.value - deltaX >= leftDrawerMinWidth.value && _ori_width.value - deltaX <= leftDrawerMaxWidth.value){
    rightDrawerWidth.value = _ori_width.value - deltaX
  } else if(_ori_width.value - deltaX > leftDrawerMaxWidth.value) {
    rightDrawerWidth.value = leftDrawerMaxWidth.value
  } else if(_ori_width.value - deltaX === leftDrawerMaxWidth.value) {
    rightDrawerWidth.value = leftDrawerMinWidth.value
  } else if(_ori_width.value - deltaX < 50){
    uiStore.projectLeftDrawer = false
  }
}

const overviewRef = ref();
const set_current_version = (id) => {
  overviewRef.value?.set_current_version(id);
}
const set_defaultVersion = (id) => {
  overviewRef.value?.set_defaultVersion(id)
}
const isShared = computed(() => uiStore.isShared)
const userId = computed(() => teamStore.init?.id);
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card && !isShared.value) {
    const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "card",
      of: "project",
    };
  }
  return res;
});
const activeVersion = computed(() => teamStore.card?.activeVersion);

const current_classExtend = ref("class_overview");
const classExtends = ref([
  { id: 0, label: "class_overview", name: "class_overview", icon: "mdi-developer-board" },
  { id: 1, label: "class_forum", name: "class_forum", icon: "forum" },
  // { id: 2, label: "class_kanban", name: "class_kanban", icon: "view_kanban" },
  { id: 3, label: "class_documents", name: "class_documents", icon: "article" },
  { id: 4, label: "class_storage", name: "class_storage", icon: "storage" },
  { id: 5, label: "class_note", name: "class_note", icon: "mdi-checkbox-marked-outline" }
]);
const splitterModel = ref(260);
const limits = ref([160, 480]);
const drawerOverlay = ref(true);

const current_card_id = computed(() => teamStore.card?.id);
const byInfo = computed(() => ({
  by: "card",
  card_id: current_card_id.value,
}));
const chatInfo = computed(() => ({
  mm_channel_id: teamStore.project?.mm_channel?.id,
  post_id: teamStore.card?.mm_thread?.id,
}));
const courses = computed(() => teamStore.kanban?.columns);

const card_members = ref();

const getCard = async (card_id) => {
  let res = await findCard(card_id);

  if (res?.data) {
    card_members.value = res.data.card_members;
    teamStore.card = res.data;
    if(card.value?.activeVersion){
      teamStore.card.activeVersion = teamStore.card.overviews.find(i => i.id === card.value.activeVersion.id)
    }
    teamStore.cards = [res.data];
  }
};
onMounted(() => {
  if (card.value) {
    getCard(card.value.id);
  }
})

const classExtendIcon = () => {
  const _cur_extend = classExtends.value.find(
    (i) => i.name === current_classExtend.value
  );
  return _cur_extend.icon;
};

const resetHeight = (offset, height) => {
  return { minHeight: `calc(${height - offset - 2}px)` }
}
</script>

<style lang="scss" scoped></style>
