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
          :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          filter=".undrag" group="column"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          :handle="setDragHandle(view_model)"
          class="no-wrap border-placeholder"
          :class="`${view_model === 'kanban' && $q.screen.gt.xs ? 'row gap-sm' : 'column'} ${
            uiStore.activeReel ? 'border-top q-py-sm' : 'fit'
          }`"
          @sort="dragColumn_done(kanban_id)"
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
          <template v-if="useAuths('create', [authBase.collection]) && !uiStore.activeReel && !isShared">
            <div :class="`${view_model !== 'kanban' ? 'row' : ''} ${
                view_model === 'segment' ? 'flex-center' : ''
              }`"
              style="min-width: 322px"
            >
              <div v-if="new_column_ing" class="q-pa-xs q-mb-xl radius-xs border">
                <q-input v-model="new_column_name"
                  :placeholder="`${columnLabel} ${$t('title')}`"
                  dense square filled autofocus type="text"
                  @keyup.enter="createColumnFn"
                  @keyup.esc="new_column_ing = false"
                >
                  <template v-slot:append>
                    <q-btn v-if="new_column_name" dense flat size="sm" round icon="add"
                      @click="createColumnFn"
                    />
                    <q-btn v-else dense flat size="sm" round icon="close"
                      @click="new_column_ing = false"
                    />
                  </template>
                </q-input>
              </div>
              <q-btn v-else-if="kanban.columns.length === 0"
                dense align="left" color="primary" icon="add"
                :class="view_model === 'list' ? '' : 'full-width'"
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
import {ref, toRefs, watch, watchEffect, computed, provide, nextTick} from "vue";
import { VueDraggable } from 'vue-draggable-plus'
import { kanbanUpdate, createColumn } from "src/api/strapi/project.js";
import ColumnContainer from "./ColumnContainer.vue";
import QuadrantModebl from "./QuadrantModebl.vue";
import { attachExpand } from 'src/pages/team/hooks/useKanban.js'
import {
  getKanbanCache,
  getKanban,
  putKanbanCache,
} from "src/hooks/project/useProcess.js";
import LoadingBlock from "../../../components/VIewComponents/LoadingBlock.vue";
import { userStore,  teamStore, uiStore } from "src/hooks/global/useStore.js";
import ReelContainer from "./ReelContainer.vue";
import SegmentPage from "../card/SegmentPage.vue";
import { i18n } from 'src/boot/i18n.js';
import { useQuasar } from "quasar";
import { findCard } from "src/api/strapi/project.js";

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
  belong: {
    type: String,
    default: "project_kanban",
  },
});
const { project_id, kanban_id, view_model, belong } = toRefs(props);
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

const syncKanbanStore = (_attachExpand) => {
  if (belong.value === 'project_kanban') {
    teamStore.kanban = _attachExpand;
  }
  if(belong.value === 'project_dropKanban'){
    teamStore.dropKanban = _attachExpand;
  }
  if(belong.value === 'project_cardKanban') {
    teamStore.cardKanban = _attachExpand;
  }
}
const init = async (res) => {
  // 附加卡片的折叠状态数据
  // console.log('res', res)
  const _attachExpand = await attachExpand(res);
  if (_attachExpand) {
    kanban.value = _attachExpand;
    _kanbanSource.value = kanban.value;
    syncKanbanStore(_attachExpand)
  }
};
const initKanban = async (kid) => {
  if (loading.value) return;
  loading.value = true;
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
    await initKanban(kanban_id.value);
  }
},{immediate: true,deep:false})

const kanbanHeight = computed(() => uiStore.mainWindowSize?.height - 2);
const reelHeight = computed( () =>
  (uiStore.mainWindowSize?.height - 48) / _kanbanSource.value?.columns?.length - 64 || 240
);
watch(reelHeight, () => {
  uiStore.reelHeight = !uiStore.activeReel ? reelHeight.value : 160;
  uiStore.reelHeight_SC = reelHeight.value;
});

const scrollAreaRef = ref(null);
const handleScroll = (event) => {
  if (!uiStore.scrollX_byWheel || uiStore.dragging || !$q.screen.lt.sm) return;
  uiStore.dragging = true;
  event.preventDefault();
  const scroolPosition = scrollAreaRef.value?.getScrollPosition();
  let x = scroolPosition.left;
  // 根据滚轮动作计算滚动距离
  const deltaY = event.deltaY || event.detail || event.wheelDelta;
  const moveAmount = -deltaY; // 正负号取决于你希望的滚动方向
  scrollAreaRef.value?.setScrollPosition("horizontal", x + moveAmount, 0);
  uiStore.dragging = false;
};
watch(
  [project_id, kanban_id],
  () => {
    if (project_id.value && kanban_id.value) {
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

const oldColumns = computed(() => kanban.value?.columns?.length > 0 ? [...kanban.value?.columns] : []); // 获取一个浅拷贝，在更新时辅助：1.判断是否需要重新fetch数据；2.作为排序赋值的数据源
const __dragging_column = ref(false);
const dragColumn_done = async (_kanban_id) => {
  await nextTick();
  const _order = columns.value?.map((i) => i.id)
  let params = {
    data: {
      columns: _order,
    },
    __props:{
      order: _order
    }
  }
  // console.log('columns params', params)
  let res = await kanbanUpdate(_kanban_id, params);
  if (res.data) {
    __dragging_column.value = false;
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
    new_column_ing.value = false;
    new_column_name.value = "";
  }
};

const cardChange = (val) => {
  kanban.value.columns = kanban.value.columns.map(c => ({
      ...c,
      cards: c.cards.map(card => card.id === val.id ? val : card)
  }))
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

const syncStoreByKanban = async () => {
  if(teamStore.card){
    teamStore.cardKanban = kanban.value;
  } else if(!teamStore.dropKanbanID) {
    teamStore.kanban = kanban.value;
  }
  await putKanbanCache(kanban.value);
}

const dragscrollstart = () => {
  
};
const draging = () => {
  
};
const dragscrollend = () => {
  
};

const kanbanCards = computed(() => teamStore.kanban?.columns?.map(i => i.cards).flat(2) || []);
const dropKanbanCards = computed(() => teamStore.dropKanban?.columns.map(i => i.cards).flat(2) || []);
const allCards = computed(() => [...kanbanCards.value, ...dropKanbanCards.value])
const val = computed(() => teamStore.income);
watch(val, async(newVal, oldVal) => {
  if(!newVal || newVal === oldVal) return;
  const { team_id, column_id, card_id, kanban_id, data, order } = val.value.data;
  if(teamStore.team?.id === Number(team_id)){

    if(val.value.event === 'kanban:updated' && order && kanban.value?.id === Number(data.id)) {
      if(order?.length > 0){
        /**
         * @description: 从所有已打开的看板以及当前看板的分栏浅拷贝中获取所有分栏数据，
         * @description: 当前用户拥有完整的数据，因此只需要根据排序索引排序即可
         * @description: 其它用户接收到ws数据后，如果有新分栏被拖入，可能没有该分栏的数据，因此需要重新获取数据
         */
        let _columns = [...oldColumns.value];
        if(teamStore.dropKanban?.columns?.length > 0){
          _columns = [..._columns, ...teamStore.dropKanban.columns];
        }
        if(teamStore.cardKanban?.columns?.length > 0){
          _columns = [..._columns, ...teamStore.cardKanban.columns];
        }

        const oldColums_ids = _columns.map(i => i.id);
        const havaAddColumn = order?.filter(i => !oldColums_ids.includes(i))?.length > 0;
        const orderColumns = (columns) => {
          return order.map(i => columns.find(j => j.id === Number(i)))
        }
        if(havaAddColumn){
          const fetch = await getKanban(kanban.value?.id);
          if (fetch) {
            const _attachExpand = await attachExpand(fetch);
            kanban.value.columns = orderColumns(_attachExpand.columns)
          }
        } else {
          kanban.value.columns = orderColumns(_columns)
        }
      } else {
        kanban.value.columns = []
      }
      syncKanbanStore(kanban.value);
    }
    if(val.value.event === 'kanban:deleted' && kanban.value?.id === Number(data.removed_kanban)) {
      kanban.value = null;
    }
    
    if(val.value.event === 'card:created'){
      // classroom 新建时不会发布，因此后端在新建classroom卡片后不会发ws，这里直接处理即可，不需要处理classroom的情况
      const column = kanban.value?.columns?.find(i => i.id === column_id);
      if(column) {
        if(column.cards?.length > 0){
          if(kanban.value.type === 'kanban' || kanban.value.type === 'classroom'){
            column.cards.unshift(data);
          } else {
            column.cards = [...column.cards, data];
          }
        } else {
          column.cards = [data];
        }
      }
    }
    if(val.value.event === 'card:deleted'){
      const syncRemove = () => {
        const column = kanban.value?.columns?.find(i => i.cards?.map(j => j.id).includes(Number(card_id)));
        if(column) {
          const isInColumn = column.cards.find(i => i.id === Number(card_id));
          if(isInColumn){
            kanban.value.columns.find(i => i.id === column.id).cards = column.cards.filter(i => i.id !== Number(card_id));
          }
        }
      }
      if(teamStore.card?.id === Number(card_id)){
        $q.notify({
          progress: true,
          color: 'negative',
          message: '卡片已删除',
          position: 'top',
          timeout: 0,
          actions: [
            { label: $t('confirm'), color: 'white', handler: () => {
              syncRemove();
              teamStore.card = null;
            } }
          ]
        })
      } else {
        syncRemove();
      }
    }
    if(val.value.event === 'card:updated'){
      // console.log('card:updated start');
      if(!kanban.value?.columns) return;
      const _column = kanban.value?.columns?.find(i => i.id === Number(column_id));

      
      /**
       * ws收到数据：
       * {
            team_id: ctx.default_team?.id, // 团队ID
            card_id: card_id, // card ID
            updator: user_id, // 更新卡片的用户的ID
            column_id: belongedInfo.belonged_column?.id, // 卡片所在分栏的ID
            data: { // 重构的卡片数据
                id: card_id,
                cards: belongedInfo.belonged_column?.cards?.map(i => i.id), // 卡片所在分栏的所有卡片ID，用来根据此内容重建分栏内卡片、排序
                message: 'refetch card datam please' // 提示消息
            }
        }
       * @param cardData 根据后端返回的数据获取到card的数据，因为ws不能根据角色推送不同的内容，因此只会推送card的id，前端再去获取
       * 
       */
      const applyCardData = (cardData) => {
        if(_column?.cards){ // 正常的修改
          const cardIndex = _column.cards.findIndex(i => i.id === cardData.id);
          if(cardIndex !== -1){
            Object.keys(cardData).forEach(key => {
              if(cardData[key] !== undefined){
                _column.cards[cardIndex][key] = cardData[key];
              }
            });
          } else { // 如果是未发布的内容改为了发布 - 根据返回的card排序重构数据
            _column.cards = data.cards.map(i => {
              return _column.cards.find(j => j.id === i) || cardData
            })
          }
        } else { // 可能新发布的卡片所在的分栏内原来是空的，这里直接添加
          _column.cards = [cardData]
        }
      }
      if(_column){
        let res
        // 重新上架
        const {column_cards, updator} = val.value.data;
        if(data.unpulled_card_id){
          if(updator !== teamStore.init?.id){
            res = await findCard(data.unpulled_card_id);
            if(res?.data){
              _column.cards = column_cards.map(i => _column.cards.find(j => j.id === i) || res.data)
            }
          } else {
            const index = _column.cards.findIndex(i => i.id === data.unpulled_card_id)
            if(index !== -1){
              _column.cards[index].pulled = false
            }
          }
          if(teamStore.card?.id == data.unpulled_card_id){
            teamStore.card.pulled = false
          }
          return
        }
        // 下架
        if(data.pulled_card_id){
          if(updator !== teamStore.init?.id){
            _column.cards = _column.cards.filter(i => i.id !== data.pulled_card_id)
          } else {
            const index = _column.cards.findIndex(i => i.id === data.pulled_card_id)
            if(index !== -1){
              _column.cards[index].pulled = true
            }
          }
          if(teamStore.card && teamStore.card.id == data.pulled_card_id){
            teamStore.card.pulled = true
          }
          return
        }
        // 其它状态
        res = await findCard(data.id);
        if(res?.data){
          console.log('card:updated findCard');
          applyCardData(res.data)
        }
        if(teamStore.card?.id === Number(card_id)){
          teamStore.card = res.data;
          if(teamStore.card.pulled && teamStore.card.creator.id !== teamStore.init?.id){
            $q.notify({
              message: $t('is_pulled'),
              actions: [
                { label: $t('confirm'), color: 'white', handler: () => {
                  teamStore.card = null;
                } }
              ]
            })
          }
        }
      }
    }

    if(val.value.event === 'column:created' && kanban.value?.id === Number(kanban_id)){
      if (kanban.value.columns?.length > 0) {
        kanban.value.columns.push(data);
      } else {
        kanban.value.columns = [data];
      }
      syncKanbanStore(kanban.value);
    }

    if(val.value.event === 'column:updated'){
      // 如果是当前用户执行的修改，直接用返回的数据赋值
      const { updator } = val.value.data;
      if(updator === teamStore.init.id) return

      //如果接收到ws的更新数据，按方法执行
      const index = kanban.value.columns?.findIndex(i => i.id === Number(data.id));
      if(index > -1){
        updateColumn(index, data)
        syncKanbanStore(kanban.value);
      }
    }

    if(val.value.event === 'column:deleted'){
      const index = kanban.value.columns?.findIndex(i => i.id === Number(data.removed_column_id));
      if(index > -1){
        kanban.value.columns.splice(index, 1);
        syncKanbanStore(kanban.value);
      }
    }
  }
},{immediate: true, deep: true})

// 更新kanban的列
const updateColumn = async (index, data) => {
    const existingColumn = kanban.value.columns[index];
    
    // 自身字段使用ws返回的数据直接更新
    for (const key in data) {
        if (existingColumn.hasOwnProperty(key)) {
            existingColumn[key] = data[key];
        }
    }
    // ws只会推送card id的数组，card内容使用当前已存在的card组装，如果有不存在的card，向后端获取后再组装
    if(data.cardSort?.length > 0){
      const allCardIds = allCards.value.map(card => card.id);
      const missingSortedCards = data.cardSort.filter(sortedCardId => !allCardIds.includes(sortedCardId));
      if (missingSortedCards.length > 0) {
        const fetchMissingCards = await Promise.all(missingSortedCards.map(async (cardId) => {
          const res = await findCard(cardId);
          return res?.data;
        }));
        allCards.value.push(...fetchMissingCards);
      }
      kanban.value.columns[index].cards = data.cardSort.map(i => allCards.value.find(card => card.id === i))
    }
    
    kanban.value.columns[index] = existingColumn;
};

</script>
<style scoped></style>
