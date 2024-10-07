<template>
  <!-- 此处需要一个真实的根节点、否则拖拽插件不能正常工作 -->
  <div
    class="column no-wrap items-center border-placeholder relative-position"
    :class="
      uiStore.dropIn === columnRef?.id
        ? `${$q.dark.mode ? 'bg-dark' : 'bg-white'}`
        : ''
    "
    :id="`reel_${columnRef.id}`"
  >
    <q-scroll-area
      class="full-width q-space scroll-container flex-content"
      v-dragscroll="{
        target: '.q-scrollarea__container',
        active: uiStore.dragReelscrollEnable
      }"
      v-dragscroll.x="true"
      v-dragscroll.y="false"
      v-on:dragscrollstart="dragscrollstart"
      v-on:dragscrollmove="draging"
      v-on:dragscrollend="dragscrollend"
      :id="columnRef.id"
      :style="`height: ${uiStore.reelHeight + 8}px`"
      style="overflow: hidden"
      ref="scrollAreaRef"
      @dblclick="upload(columnRef?.id)"
      @wheel="handleScroll"
    >
      <div
        data-dragscroll
        class="row no-wrap gap-sm relative-position unselected"
        :class="uiStore.activeReel ? 'items-center' : 'flex-center'"
      >
        <div v-if="filteredCards?.length > 0 && !uiStore.activeReel"
          style="height: 100%; width: 40vw; max-width: 39%"
        ></div>
        <VueDraggable v-model="filteredCards"
          :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          handle=".dragItem" filter=".undrag" group="reelItem"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="row no-wrap gap-sm forbid"
          :class="isMounted ? uiStore.activeReel ? 'items-center' : 'flex-center' : 'op-0'"
          :style="`height: ${uiStore.reelHeight + 8}px; min-width: 100%`"
          @start="dragStart" @sort="onSort" @end="dragEnd"
        >
          <SegmentItem
            v-for="element in filteredCards" :key="element.id"
            :card="element" :isCreator_column="isCreator" :column="columnRef"
            @cardChange="cardChange" @cardDelete="cardDelete"
            @mouseenter="disableUpload = true" @mouseleave="disableUpload = false"
          ></SegmentItem>
          <template v-if="useAuths('create', ['card'])">
            <CreateSegment
              v-show="uiStore.createCard_in === columnRef.id"
              :column_id="columnRef.id"
              @createCannel="createCannel"
              @closeCreate="closeCreate"
              ref="CreateSegmentRef"
            />
          </template>
        </VueDraggable>
        <div v-if="filteredCards?.length > 0 && !uiStore.activeReel"
          style="height: 100%; width: 40vw; max-width: 39%"
        />
      </div>
    </q-scroll-area>
    <q-bar v-show="!uiStore.activeReel" class="full-width transparent q-my-xs">
      <q-space />
      <div
        class="row no-wrap items-center q-py-xs q-pl-sm q-pr-xs gap-xs transparent font-medium border bg-dark"
        style="width: 420px"
      >
        <StatusMenu
          :status="column_status"
          :modify="useAuths('status', ['column'])"
          :dense="true"
          @statusChange="statusChange"
        />
        <span class="q-space">{{ column_name || "Reel ?" }}</span>
        <q-btn
          v-if="useAuths('create', ['card'])"
          dense
          flat
          size="sm"
          icon="add"
          @click="CreateCardFn(columnRef.id)"
        />
        <q-btn
          v-if="
            useAuths('name', ['column']) ||
            useAuths('delete', ['column'])
          "
          dense
          size="sm"
          flat
          icon="more_vert"
        >
          <q-menu class="border shadow-24" ref="column_menu">
            <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
              <template
                v-if="useAuths('name', ['column'])"
              >
                <q-item class="no-padding">
                  <q-item-section>
                    <q-input
                      v-model="params.data.name"
                      type="text"
                      :placeholder="`Reel${$t('title')}`"
                      dense
                      square
                      filled
                      autofocus
                      @keyup.enter="updateColumnFn()"
                      @keyup.ctrl.enter="updateColumnFn()"
                      @blur="updateCannel"
                      @keyup.esc="updateCannel"
                    >
                      <template v-slot:append>
                        <q-btn
                          dense
                          flat
                          size="sm"
                          round
                          icon="add"
                          @click="updateColumnFn()"
                        />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item>
                <q-separator spaced />
              </template>
              <template
                v-if="useAuths('delete', ['column'])"
              >
                <q-separator spaced />
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="deleteColumnFn()"
                >
                  <q-item-section>{{ $t('delete') }} Reel</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          v-if="useAuths('order', ['column'])"
          dense
          flat
          size="sm"
          icon="mdi-drag"
          class="reel_dragBar"
        />
      </div>
      <q-space />
    </q-bar>
  </div>
</template>

<script setup>
import {
  ref,
  toRef,
  watch,
  watchEffect,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import { i18n } from 'src/boot/i18n.js';
import { VueDraggable } from 'vue-draggable-plus'
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import { useQuasar } from "quasar";
import {
  updateColumn,
  deleteColumn,
  createCard,
} from "src/api/strapi/project.js";

import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import { filterCardsByString } from "src/hooks/utilits.js";

import {
  userStore,
  teamStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import { useMagicKeys } from "@vueuse/core";
import SegmentItem from "../card/SegmentItem.vue";
import CreateSegment from "../card/components/CreateSegment.vue";
import Bottleneck from "bottleneck";

const $t = i18n.global.t;

const $q = useQuasar();
const props = defineProps({
  column: {
    type: Object,
    default() {
      return {};
    },
  },
  __dragging_column: {
    type: Boolean,
    default: false,
  },
  kanban_id: {
    type: Number,
    default: NaN,
  },
  view_model: {
    type: String,
    default: "kanban",
  },
  isCreator_kanban: {
    type: Boolean,
    default: false,
  },
});
const columnRef = toRef(props, "column");

const scrollAreaRef = ref(null);
const isCreator = computed(
  () =>
    columnRef.value.creator?.id === userStore.userId || props.isCreator_kanban
);
const kanban_idRef = toRef(props, "kanban_id");

let filter_txt = computed(() => teamStore.filter_txt);
let filteredCards = ref();
let cards = ref();
let column_name = ref();
let column_unread_count = ref();
let column_status = ref();
let column_type = ref();
let column_executor = ref();
watch(columnRef, () => {
  if(columnRef.value){
    cards.value = columnRef.value?.cards;
    filteredCards.value = cards.value;
    column_name.value = columnRef.value?.name;
    column_unread_count.value = columnRef.value?.unread_count;
    column_status.value = columnRef.value?.status;
    column_type.value = columnRef.value?.type;
    column_executor.value = columnRef.value?.executor;
  }
},{ immediate: true, deep: true });

const deleteColumnFn = () => {
  const deleteFn = async () => {
    let res;
    if (teamStore.card?.id) {
      const card_id = teamStore.card?.id;
      await deleteColumn(
        teamStore.project.id,
        columnRef.value.id,
        card_id
      );
    } else {
      await deleteColumn(teamStore.project.id, columnRef.value.id);
    }
  };
  if (columnRef.value.cards.length > 0) {
    $q.dialog({
      title: $t('attention'),
      message: $t('delete_reel_include_cards_tip'),
      cancel: $t('cancel'),
      ok: $t('confirm'),
      class: "shadow-24",
    })
      .onOk(() => {
        deleteFn();
      })
  } else {
    deleteFn();
  }
};
const params = ref({
  project_id: teamStore.project?.id,
  kanban_id: kanban_idRef.value,
  data: {
    name: column_name.value,
  },
});
const column_menu = ref();
const updateColumnFn = async () => {
  let res = await updateColumn(columnRef.value.id, params.value);
  if (res) {
    column_menu.value?.hide();
    delete params.value.data.status;
    params.value.data.name = "";
  }
};
const statusChange = (val) => {
  delete params.value.data.name;
  params.value.data.status = val;
  updateColumnFn();
};
const updateCannel = () => {
  params.value.data.name = "";
};

const emit = defineEmits(["cardChange", "cardDelete", "orderCard"]);
const dragCard_sort = async () => {
  let params = {
    project_id: teamStore.project.id,
    kanban_id: kanban_idRef.value,
    data: {
      cards: filteredCards.value.map((i) => i.id),
    },
  };
  await updateColumn(columnRef.value.id, params);
};

const onSort = async () => {
  await nextTick();
  await dragCard_sort()
}

//卡片部分
watchEffect(() => {
  uiStore.createCard_in = uiStore.activeReel ? columnRef.value?.id : NaN;
});
const CreateCardFn = (column_id) => {
  uiStore.createCard_in =
    uiStore.createCard_in === column_id ? null : column_id;
  if (uiStore.createCard_in) {
    scrollAreaRef.value?.setScrollPercentage(
      "horizontal",
      1,
      300
    );
  }
};
// 页面加载后滚动到中间
const isMounted = ref(false); // 控制滚动区域内部元素透明度，当滚动结束后再显示出来，否则页面内容变动体验不好
onMounted(async () => {
  await nextTick();
  scrollAreaRef.value?.setScrollPercentage("horizontal", 0.5, 0);
  isMounted.value = true;
});
const handleScroll = (event) => {
  event.preventDefault();
  const scroolPosition = scrollAreaRef.value?.getScrollPosition();
  let x = scroolPosition.left;
  // 根据滚轮动作计算滚动距离
  const deltaY = event.deltaY || event.detail || event.wheelDelta;
  const moveAmount = -deltaY; // 正负号取决于你希望的滚动方向
  scrollAreaRef.value?.setScrollPosition("horizontal", x + moveAmount, 0);
};
const CreateSegmentRef = ref(null);
const disableUpload = ref(false);
const upload = async (_columnId) => {
  if (disableUpload.value) return;
  CreateCardFn(_columnId);
  await nextTick();
  CreateSegmentRef.value?.handleNodeClick();
};
const closeCreate = () => {
  uiStore.createCard_in = null;
};
const createCannel = () => {
  uiStore.createCard_in = null;
};
const cardChange = (val) => {
  emit("cardChange", val);
};
const cardDelete = (card_id) => {
  emit("cardDelete", card_id);
};
const dragStart = () => {
  teamStore.cardDragging = true;
  uiStore.dragReelscrollEnable = false;
  uiStore.dragging = true;
};
const dragEnd = () => {
  teamStore.cardDragging = false;
  uiStore.dragReelscrollEnable = true;
  uiStore.dragging = false;
};

watch(filter_txt, () => {
  if (cards.value) {
    if (filter_txt.value) {
      filteredCards.value = filterCardsByString(filter_txt.value,cards.value);
    } else {
      filteredCards.value = cards.value;
    }
  }
},{ immediate: true, deep: false });

const { current } = useMagicKeys();
const keys = computed(() => Array.from(current));
watch(
  keys,
  () => {
    if (keys.value) {
      if (
        keys.value?.includes("escape") &&
        uiStore.createCard_in === columnRef.value?.id &&
        !uiStore.activeReel
      ) {
        uiStore.createCard_in = void 0;
      }
    }
  },
  { immediate: false, deep: false }
);

const dropZone = ref(null);
const reel = ref(null);
const loading = ref(false);
const createCardQueue = new Bottleneck({ maxConcurrent: 5 });

const dropCreateCard = async (file) => {
  if (loading.value) return;
  loading.value = true;
  const column_id = columnRef.value?.id;
  if (!column_id) {
    $q.notify(`${$t('miss')}Reel ID`);
    return;
  }
  let params = {
    column_id: column_id,
    data: {
      name: file.attributes.name,
      media: file.id,
    },
  };
  await createCard(params);
  loading.value = false;
};

const onDrop = async (e) => {
  try {
    const files = await confirmUpload(e, userStore.me);
    if (files) {
      for (const file of files) {
        await createCardQueue.schedule(async () => {
          await dropCreateCard(file);
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
};

// 拖拽进入事件
const handleDragEnter = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
  dropZone.value.style.pointerEvents = "auto";
  uiStore.dropIn = columnRef.value?.id;
};

// 拖拽移动事件
const handleDragOver = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
  uiStore.dropIn = columnRef.value?.id;
};

// 拖拽离开事件
const handleDragLeave = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 判断事件目标是否是div元素本身
  uiStore.dropIn = void 0;
};

// 拖拽释放事件
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  let items_asfile = e.dataTransfer?.files;
  let items_asitem = e.dataTransfer?.items;

  let files = [];
  for (let i = 0; i < items_asfile.length; i++) {
    if (items_asfile[i].type !== "") {
      files.push(items_asfile[i]);
    } else {
      let folder = items_asitem[i].webkitGetAsEntry();
      if (folder.isDirectory) {
        $q.notify($t('not_support_upload_dir'));
      }
    }
  }
  if (files.length > 0) {
    // console.log("handleDrop", files);
    onDrop(files);
  }
  uiStore.dropIn = void 0;
};
// 在组件挂载时，绑定事件监听器到div元素上
onMounted(async () => {
  await nextTick();

  reel.value = document.getElementById(columnRef.value?.id);
  dropZone.value = document.getElementById(`reel_${columnRef.value?.id}`);
  if (!dropZone.value) return;
  // 绑定事件监听器到div元素上
  dropZone.value.addEventListener("dragenter", handleDragEnter, false);
  dropZone.value.addEventListener("dragover", handleDragOver, false);
  dropZone.value.addEventListener("dragleave", handleDragLeave, false);
  dropZone.value.addEventListener("drop", handleDrop, false);
});

// 在组件卸载时，移除事件监听器
onUnmounted(() => {
  // 移除事件监听器
  dropZone.value.removeEventListener("dragenter", handleDragEnter, false);
  dropZone.value.removeEventListener("dragover", handleDragOver, false);
  dropZone.value.removeEventListener("dragleave", handleDragLeave, false);
  dropZone.value.removeEventListener("drop", handleDrop, false);
});

const dragscrollstart = () => {
  uiStore.dragging = true;
};
const draging = () => {
  // uiStore.dragging = true
};
const dragscrollend = () => {
  uiStore.dragging = false;
};
</script>

<style lang="scss">
.flex-content .q-scrollarea__content {
  display: flex;
  flex-direction: column;
}
.highlight {
  width: 5px;
}
.cardBody:hover .highlight {
  width: 1px;
}
</style>
