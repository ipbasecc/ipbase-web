<template>
  <q-card v-if="fetched" bordered class="fit q-space no-wrap row radius-sm shadow-focus relative-position">
    <q-layout v-if="teamStore?.card"
      view="lHh LpR lFf" container class="q-space"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp"
    >
      <q-header class="transparent">
        <q-bar class="border-bottom"
          :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
          style="height: 2.3rem"
        >
          <q-btn v-if="uiStore.app === 'teams'" dense flat icon="menu" @click="toggleLeftDrawer" />
          <q-space />
          <template v-if="hasDetialAuth">
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
            <template v-if="teamStore.card?.isCreator">
              <q-btn v-if="!teamStore.card?.published" icon="mdi-eye" color="positive" class="q-mr-lg border"
              :label="$t('publish')" @click="publishCard()" />
              <q-btn v-else-if="!teamStore.card?.pulled" icon="mdi-cart-off" color="negative" class="q-mr-lg border"
              :label="$t('pulled')" @click="pulledCard()" />
              <q-btn v-else icon="mdi-cart-plus" color="positive" class="q-mr-lg border"
              :label="$t('unpulled')" @click="unpulledCard()" />
            </template>
            <q-btn @click="toggleRightDrawer()"
              flat dense size="sm" round
              :icon="classExtendIcon()"
              :class="rightDrawerOpen ? '' : 'op-5'"
              :color="rightDrawerOpen ? 'positive' : ''"
            />
            <q-separator spaced inset vertical />
          </template>
          <q-btn dense round flat icon="close" size="sm" v-close-popup />
        </q-bar>
      </q-header>
      <q-drawer v-if="uiStore.app === 'teams'" v-model="leftDrawerOpen"
        side="left" :width="leftDrawerWidth" :breakpoint="500"
        :class="$q.dark.mode ? 'bg-darker border-right' : 'bg-white text-grey-10 border-right'"
      >
        <CoursesList :courses @toggleCousrse="toggleCousrse" />
      </q-drawer>
      <q-drawer v-if="rightDrawerOpen"
        :key="teamStore.card?.id"
        v-model="rightDrawerOpen"
        side="right"
        :overlay="drawerOverlay"
        :width="rightDrawerWidth"
        class="border-left column no-wrap"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-2'"
      >
        <q-bar class="transparent border-bottom" style="height: 36px;">
          <q-tabs v-model="current_classExtend"
            inline-label dense no-caps stretch
          >
            <template v-for="i in classExtends" :key="i.id">
              <q-tab :name="i.name" :label="$t(i.label)" class="q-px-sm" />
            </template>
          </q-tabs>
          <q-space />
          <q-btn @click="drawerOverlay = !drawerOverlay"
            dense round flat icon="push_pin" size="sm"
            :color="drawerOverlay ? '' : 'positive'"
            :class="drawerOverlay ? 'op-5' : ''"
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
          <template v-if="current_classExtend === 'class_note'">
            <NotebookList v-if="!uiStore.active_note_id" />
            <NoteDetial :active_note_id="uiStore.active_note_id" v-else />
          </template>
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
                :withSaveBtn="true"
                :withImageBtn="true"
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
        :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-3 text-grey-10'"
        :style-fn="resetHeight">
          <template v-if="hasDetialAuth">
            <KeepAlive>
              <OverView wasAttached_to="card" ref="overviewRef"
                :onlyMedia="true"
              />
            </KeepAlive>
          </template>
          <div v-else class="absolute-full column flex-center">
            <div class="q-space row no-wrap gap-md flex-center">
              <q-card v-if="teamStore.card?.message" bordered>
                <q-card-section>
                  <div class="text-h6">{{ teamStore.card?.message }}</div>
                </q-card-section>
              </q-card>
              <OrderCard v-else :card>
                <template #buyBtn>
                  <PayButton
                    class="full-width" btnColor="negative"
                    subject="card" :commodity="card" @buyData="buyData"
                  />
                </template>
              </OrderCard>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
    <q-dialog v-model="cant_publish" position="top">
      <q-card style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">{{ $t('cant_published_no_media_tip') }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="show_pulled_dlg" persistent>
      <q-card bordered>
        <q-card-section class="row items-center no-wrap">
          <q-icon name="mdi-information" color="deep-orange" size="xl" />
          <span class="q-ml-sm">{{ $t('pulled_card_tip') }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
          <q-space />
          <q-btn :label="$t('confirm')" color="primary" v-close-popup @click="pulledCard()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, toRefs, computed, watchEffect, onMounted, reactive, onUnmounted } from "vue";
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
import { useMouse } from '@vueuse/core'
import NotebookList from '../notebook/NotebookList.vue'
import NoteDetial from '../notebook/note/NoteDetial.vue'
import PayButton from 'src/components/order/PayButton.vue'
import OrderCard from './components/OrderCard.vue'
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  card: {
    type: Object,
    default: void 0,
  },
});
const { card } = toRefs(props);

const personal_kanbanTodo = ref([]);

watchEffect(async () => {
  // console.log('personal_kanbanTodo.value 1', personal_kanbanTodo.value);
  personal_kanbanTodo.value = teamStore.init?.todogroups?.filter(i => i.kanban?.id === teamStore.card?.card_kanban?.id);
  // console.log('personal_kanbanTodo.value 2', personal_kanbanTodo.value);
});
const emit = defineEmits(["closeCardList", "publishCard", "pulledCard", "isPulledCard"]);

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
const leftDrawerWidth = ref(240);
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
const cant_publish = ref(false)
const publishCard = () => {
  const medias = teamStore.card?.overviews?.filter(i => i.media);  
  if(medias?.length === 0){
    cant_publish.value = true
  } else {
    emit('publishCard', teamStore.card?.id)
  }
}

const show_pulled_dlg = ref(false);
const pulledCard = () => {
  if(show_pulled_dlg.value){
    emit('pulledCard', teamStore.card?.id)
  } else {
    show_pulled_dlg.value = true
  }
}
const unpulledCard = () => {
  emit('unpulledCard', teamStore.card?.id)
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
watchEffect(() => {
  if(uiStore.app === 'notebooks'){
    classExtends.value = classExtends.value.filter(i => i.name !== 'class_note');
  }
})
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

const hasDetialAuth = computed(() => teamStore.card?.hasDetialAuth)
const fetched = ref(false)
const getCard = async (card_id) => {
  let res = await findCard(card_id);

  if (res?.data) {
    card_members.value = res.data.card_members;
    teamStore.card = res.data;
    if(card.value?.activeVersion){
      teamStore.card.activeVersion = teamStore.card.overviews.find(i => i.id === card.value.activeVersion.id)
    }
    teamStore.cards = [res.data];
    fetched.value = true
  }
};
const buyData = (data) => {
  teamStore.card = data
  emit('buyData', data)
};

const toggleCousrse = async (cousrse) => {
  await getCard(cousrse.id);
}

onMounted(async() => {
  if (card.value) {
    await getCard(card.value.id);
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
