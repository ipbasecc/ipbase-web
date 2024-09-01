<template>
  <LoadingBlock v-if="loading" />
  <template v-else-if="useAuths('read', ['kanban']) || isShared">
    <q-scroll-area
      v-bind="$attrs"
      v-dragscroll="{
        target: '.q-scrollarea__container',
        active: uiStore.dragKanbanScrollEnable && view_model === 'kanban'
      }"
      v-dragscroll.x="$q.screen.gt.xs"
      v-dragscroll.y="false"
      v-on:dragscrollstart="dragscrollstart"
      v-on:dragscrollmove="draging"
      v-on:dragscrollend="dragscrollend"
      class="absolute-full"
      ref="scrollAreaRef"
      @wheel="handleScroll"
    >
      <div v-if="kanban"
        class="relative-position"
        :class="`${view_model !== 'list' ? '' : ''} ${
          uiStore.activeReel ? 'column no-wrap' : 'q-pa-sm '
        }`"
        :style="`height: ${kanbanHeight}px;`"
      >
        <SegmentPage v-if="uiStore.activeReel" />
        <!-- {{ view_model }} -->
        <QuadrantModebl
          v-if="view_model === 'quadrant'"
          :kanban_data="kanban"
          :isCreator_kanban="isCreator"
        />
        <VueDraggable v-else v-model="kanban.columns"
          :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          filter=".undrag" group="column"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          :handle="setDragHandle(view_model)"
          class="no-wrap border-placeholder"
          :class="`${view_model === 'kanban' && $q.screen.gt.xs ? 'row gap-sm' : 'column'} ${
            uiStore.activeReel ? 'border-top q-py-sm' : 'fit'
          }`"
          @change="dragColumn_done(kanban_id)"
        >
          <div v-for="element in kanban.columns" :key="element.id"
            v-show="!uiStore.activeReel || element.id === uiStore.activeReel"
          >
            <ColumnContainer
              v-if="view_model === 'kanban' || view_model === 'list'"
              :isCreator_kanban="isCreator"
              :view_model="view_model"
              :column="element"
              :kanban_id="kanban.id"
              :__dragging_column="__dragging_column"
              @cardChange="cardChange"
              @cardDelete="cardDelete"
            />
            <ReelContainer
              v-if="view_model === 'segment'"
              :isCreator_kanban="isCreator"
              :view_model="view_model"
              :column="element"
              :kanban_id="kanban.id"
              :__dragging_column="__dragging_column"
              :reelHeight
              @cardChange="cardChange"
              @cardDelete="cardDelete"
            />
          </div>
          <template v-if=" useAuths('create', [authBase.collection]) && !uiStore.activeReel && !isShared">
            <div
              :class="`${view_model !== 'kanban' ? 'row' : ''} ${
                view_model === 'segment' ? 'flex-center' : ''
              }`"
              style="min-width: 322px"
            >
              <div v-if="new_column_ing" class="q-pa-xs q-mb-xl radius-xs border">
                <q-input
                  v-model="new_column_name"
                  type="text"
                  :placeholder="`${columnLabel} ${$t('title')}`"
                  dense
                  square
                  filled
                  autofocus
                  @keyup.enter="createColumnFn"
                  @keyup.esc="new_column_ing = false"
                >
                  <template v-slot:append>
                    <q-btn
                      v-if="new_column_name"
                      dense
                      flat
                      size="sm"
                      round
                      icon="add"
                      @click="createColumnFn"
                    />
                    <q-btn
                      v-else
                      dense
                      flat
                      size="sm"
                      round
                      icon="close"
                      @click="new_column_ing = false"
                    />
                  </template>
                </q-input>
              </div>
              <q-btn
                v-else-if="kanban.columns.length === 0"
                dense
                :class="view_model === 'list' ? '' : 'full-width'"
                align="left"
                color="primary"
                icon="add"
                :label="`${$t('add_new')}${columnLabel}`"
                @click="new_column_ing = true"
              />
              <div
                v-else
                :class="`${view_model !== 'kanban' ? '' : 'full-width'} ${
                  $q.dark.mode ? 'text-grey-1' : 'text-grey-10'
                } `"
                class="q-px-xs q-pt-xs q-pb-xl cursor-pointer transition font-medium hover-highlight-lg"
                @click="new_column_ing = true"
              >
                {{ $t('create') }}{{ columnLabel }}
              </div>
            </div>
          </template>
        </VueDraggable>
      </div>
    </q-scroll-area>
  </template>
  <div v-else class="fit flex flex-center">
    <span class="op-5">{{ $t('no_premission_to_view') }}</span>
  </div>
</template>

<script setup>
import {ref, toRefs, watch, watchEffect, onMounted, computed, provide, nextTick} from "vue";
import { VueDraggable } from 'vue-draggable-plus'
import { kanbanUpdate, createColumn } from "src/api/strapi/project.js";
import ColumnContainer from "./ColumnContainer.vue";
import QuadrantModebl from "./QuadrantModebl.vue";
import {
  send_MattersMsg,
  send_CardMsg,
} from "src/pages/team/hooks/useSendmsg.js";
import {
  getKanbanCache,
  getKanban,
  putKanbanCache,
} from "src/hooks/project/useProcess.js";
import LoadingBlock from "../../../components/VIewComponents/LoadingBlock.vue";
import { userStore,  teamStore,  mm_wsStore,  uiStore } from "src/hooks/global/useStore.js";
import { genCardName } from "src/hooks/utilits.js";
import localforage from "localforage";
import ReelContainer from "./ReelContainer.vue";
import SegmentPage from "../card/SegmentPage.vue";
import { i18n } from 'src/boot/i18n.js';
import { useQuasar } from "quasar";

const $t = i18n.global.t;
const $q = useQuasar();

const userId = computed(() => teamStore.init?.id);
const props = defineProps({
  project_id: {
    type: Number,
    default: NaN,
  },
  kanban_id: {
    type: Number,
    default: NaN,
  },
  view_model: {
    type: String,
    default: "kanban",
  },
});
const { project_id, kanban_id, view_model } = toRefs(props);
const isShared = computed(() => uiStore.isShared)
const columnLabel = computed(() => {
  let _label;
  if (kanban.value?.type === "kanban") {
    _label = $t('column');
  } else if (kanban.value?.type === "segment") {
    _label = $t('Reel');
  } else if (teamStore.navigation === "classroom") {
    _label = $t('Chapter');
  }
  return _label;
});

const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card && !isShared.value) {
    const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "column",
      of: "card",
    };
  } else {
    res = {
      collection: "column",
      of: "project",
    };
  }
  return res;
});
provide("authBase", authBase.value);

const kanban = ref();
const loading = ref(false);
const isCreator = computed(() => kanban.value.creator?.id === userStore.userId);
// Segment模式时会筛选columns，这里在初始化时先保存一个原始数据，以便用来还原
const _kanbanSource = ref();

const setDragHandle = (view_model) => {
  if(view_model === 'kanban'){
    return '.columnDragBar'
  } else if(view_model === 'list'){
    return '.listDragBar'
  } else if(view_model === 'segment'){
    return '.reel_dragBar'
  }
}

const initKanban = async (kid) => {
  if (loading.value) return;
  loading.value = true;
  async function attachExpand(kanban) {
    if (kanban.columns && kanban.columns.length > 0) {
      kanban.columns = kanban.columns.map(async (i) => {
        if (i.cards && i.cards.length > 0) {
          // 使用 Promise.all 来等待所有异步操作完成
          const cardPromises = i.cards.map(async (card) => {
            const expandStatus = await localforage.getItem(
              `___card_expandStatus_${card.id}`
            );
            return { ...card, expand: expandStatus || "expand" };
          });

          // 等待所有 card 的异步操作完成
          const updatedCards = await Promise.all(cardPromises);
          return { ...i, cards: updatedCards };
        } else {
          return { ...i, cards: [] };
        }
      });

      // 等待所有 column 的异步操作完成
      kanban.columns = await Promise.all(kanban.columns);
    }
    return kanban;
  }
  const init = async (res) => {
    // 附加卡片的折叠状态数据
    // console.log('res', res)
    const _attachExpand = await attachExpand(res);
    if (_attachExpand) {
      kanban.value = _attachExpand;
      _kanbanSource.value = kanban.value;
      // 当有 teamStore.card 时，说明card的详情弹框是打开状态
      if (teamStore.card) {
        teamStore.cardKanban = _attachExpand;
      } else if(!teamStore.dropKanbanID) {
        teamStore.kanban = _attachExpand;
        teamStore.kanban_type = _attachExpand.type;
        await putKanbanCache(_attachExpand);
      }
    }
  };

  if(isShared.value){
    await init(teamStore.card?.card_kanban)
  } else {
    let cache = await getKanbanCache(kid);
    if (cache) {
      await init(cache);
    }
    const fetch = await getKanban(kid);
    if (fetch) {
      await init(fetch);
    }
    loading.value = false;
  }
};
defineExpose({
  initKanban
})
watch(kanban_id, async () => {
  if(kanban_id.value){
    teamStore.kanban_id = kanban_id.value;
    await initKanban(kanban_id.value);
  }
},{immediate: true,deep:false})

const kanbanHeight = computed(() => 
  teamStore.kanban_rightDrawer === 'drop_kanban'
  ? uiStore.mainWindowSize?.height - 2
  : uiStore.mainWindowSize?.height
);
const reelHeight = computed( () =>
  (uiStore.mainWindowSize?.height - 48) / _kanbanSource.value?.columns?.length - 64 || 240
);
watch(reelHeight, () => {
  uiStore.reelHeight = !uiStore.activeReel ? reelHeight.value : 160;
  uiStore.reelHeight_SC = reelHeight.value;
});

const scrollAreaRef = ref(null);
const handleScroll = (event) => {
  if (!uiStore.scrollX_byWheel || uiStore.draging || $q.screen.lt.sm) return;
  uiStore.draging = true;
  event.preventDefault();
  const scroolPosition = scrollAreaRef.value?.getScrollPosition();
  let x = scroolPosition.left;
  // 根据滚轮动作计算滚动距离
  const deltaY = event.deltaY || event.detail || event.wheelDelta;
  const moveAmount = -deltaY; // 正负号取决于你希望的滚动方向
  scrollAreaRef.value?.setScrollPosition("horizontal", x + moveAmount, 0);
  uiStore.draging = false;
};
watch(
  [project_id, kanban_id],
  () => {
    if (project_id.value && kanban_id.value) {
      teamStore.kanban_id = kanban_id.value;
      initKanban(kanban_id.value);
    }
  },
  { immediate: true, deep: true }
);

watch(
  teamStore,
  async () => {
    // Card详情对话框开启时收到来自ws的刷新看板数据时，不能立刻刷新，否则弹框会关闭，先记住要刷新的状态，在关闭弹框时再刷新
    if (teamStore.need_refecth_kanban && !teamStore.card) {
      teamStore.need_refecth_kanban = false;
      await initKanban(kanban_id.value);
    }
  },
  { immediate: false, deep: false }
);

const __dragging_column = ref(false);
const dragColumn_done = async (_kanban_id) => {
  let params = {
    data: {
      columns: columns.value?.map((i) => i.id),
    }
  }
  // console.log('columns params', params)
  let res = await kanbanUpdate(_kanban_id, params);
  if (res.data) {
    __dragging_column.value = false;
    let chat_Msg = {
      body: `${userStore.me?.username}将调整了看板 - ${teamStore.kanban?.title}内${columnLabel.value}的排序`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: _kanban_id,
            action: "orderColumn",
            body: {
              order: res.data.columns.map((i) => i.id),
            }
          }
        }
      }
    }
    await send_chat_Msg(chat_Msg);
  }
};

const new_column_name = ref();
const createColumnFn = async () => {
  let params = {
    project_id: teamStore.project.id,
    kanban_id: kanban.value?.id,
    data: {
      name: new_column_name.value,
    },
  };
  if (teamStore.card) {
    params.kanban_id = teamStore.card?.card_kanban?.id;
  }
  let res = await createColumn(params);
  if (res?.data) {
    let chat_Msg = {
      body: `${userStore.me?.username}在看板 - ${
        teamStore.card ? genCardName(teamStore.card) : teamStore.kanban?.title
      }内新建了${columnLabel.value} ${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: teamStore.card
              ? teamStore.card?.card_kanban?.id
              : teamStore.kanban?.id,
            action: "columnCreated",
            body: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
    if (teamStore.card?.mm_thread?.id) {
      delete chat_Msg.props;
      await send_CardMsg(chat_Msg);
    }
    new_column_ing.value = false;
    new_column_name.value = "";
  }
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

const cardChange = () => {
  // kanban.value.columns = kanban.value.columns.map(c => ({
  //     ...c,
  //     cards: c.cards.map(card => card.id === val.id ? val : card)
  // }))
};
const cardDelete = (card_id) => {
  kanban.value.columns = kanban.value.columns.map((c) => ({
    ...c,
    cards: c.cards.filter((card) => card.id !== card_id),
  }));
  syncStoreByKanban();
};

const new_column_ing = ref(false);
const columns = ref();
watchEffect(() => {
  if (uiStore.activeReel) {
    columns.value = kanban.value?.columns?.filter(
      (i) => i.id === uiStore.activeReel
    );
  } else {
    columns.value = kanban.value?.columns;
  }
  if(uiStore.isFocusMode){
    uiStore.navigatorDrawer = false
  }
});
const dragscrollstart = () => {
  uiStore.draging = true;
};
const draging = () => {
  // uiStore.draging = true
};
const dragscrollend = () => {
  uiStore.draging = false;
};

const syncStoreByKanban = async () => {
  if(teamStore.card){
    teamStore.cardKanban = kanban.value;
  } else {
    teamStore.kanban = kanban.value;
  }
  await putKanbanCache(kanban.value);
}

// -----------------------------------------
// ws data update line
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "columnCreated"
        ) {
          kanban.value.columns.push(strapi.data.body);
          syncStoreByKanban();
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "columnDeleted"
        ) {
          function isSameId(element) {
            return element.id === strapi.data.column_id;
          }
          if (teamStore.showCards) {
            const index = teamStore.card.card_kanban.columns.findIndex(isSameId);
            if (index !== -1) {
              teamStore.card.card_kanban.columns.splice(index, 1);
            }
          } else {
            const index = kanban.value.columns.findIndex(isSameId);
            if (index !== -1) {
              kanban.value.columns.splice(index, 1);
            }
          }
          syncStoreByKanban();
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban_id.value &&
          strapi.data.action === "orderColumn"
        ) {
          const order = strapi.data.body.order
          let _all_columns = kanban.value.columns
          teamStore.kanban.wanderingColumns = kanban.value.columns.filter((i) => !order.includes(i.id));
          if(teamStore.kanban.wanderingColumns){
            _all_columns = [...teamStore.kanban.wanderingColumns, ..._all_columns]
          }
          kanban.value.columns = order.map((i) =>
            _all_columns.find((c) => c.id === i)
          );
          syncStoreByKanban();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.kanban_id === kanban.value?.id &&
          strapi.data.action === "QuadrantChange"
        ) {
          kanban.value.columns = kanban.value.columns?.map((column) => ({
            ...column,
            cards: column.cards.map((card) => ({
              ...card,
              importance:
                (card.id === strapi.data.card_id &&
                  strapi.data.quadrant.importance) ||
                card.importance,
              urgency:
                (card.id === strapi.data.card_id &&
                  strapi.data.quadrant.urgency) ||
                card.urgency,
            })),
          }));
          syncStoreByKanban();
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
<style scoped></style>
