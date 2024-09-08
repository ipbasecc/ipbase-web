<template>
  <!-- 此处需要一个真实的根节点、否则拖拽插件不能正常工作 -->
  <div
    class="column no-wrap items-center border-placeholder"
    :class="`
      ${__dragging_column ? '' : 'full-height'}
      ${columnRef && view_modelRef === 'kanban' ? 'gap-xs ' : 'gap-md '}
    `"
  >
    <template v-if="columnRef && view_modelRef === 'kanban'">
      <div class="row no-wrap items-center q-px-xs q-pt-xs gap-xs radius-xs transparent font-medium columnDragBar"
        :style="$q.screen.gt.xs ? 'width: 322px' : 'width: 100%'"
      >
        <StatusMenu
          v-if="isKanban"
          :status="column_status"
          :modify="useAuths('status', ['column'])"
          :dense="true"
          class="flex undrag"
          @statusChange="statusChange"
        />
        <span
          class="q-space unselected"
          :class="useAuths('order', ['column']) ? 'dragBar' : ''"
          @mouseenter="uiStore.dragKanbanScrollEnable = false"
          @mouseleave="uiStore.dragKanbanScrollEnable = true"
          >{{ column_name === 'Initial_Column' ? $t(column_name) : column_name }}</span
        >
        <q-btn
          v-if="
            useAuths('name', ['column']) ||
            useAuths('delete', ['column']) ||
            isCreator
          "
          dense
          size="sm"
          flat
          round
          icon="more_vert"
          class="undrag"
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
                      :placeholder="$t('column_name')"
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
              </template>
              <template v-if="isKanban">
                <q-separator spaced />
                <q-item class="radius-xs" clickable>
                  <q-item-section>{{ $t('default_create') }}：</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu auto-close anchor="top end" self="top start">
                    <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                      <q-item
                        v-for="i in cardTypes"
                        :key="i.val"
                        dense
                        clickable
                        class="radius-xs"
                        :class="
                          i.val === DefaultCreateCardType ? 'bg-primary' : ''
                        "
                        @click="setDefaultCreateCardType(i.val)"
                      >
                        <q-item-section side
                          ><q-icon :name="i.icon" size="xs"
                        /></q-item-section>
                        <q-item-section
                          ><span class="q-pr-md">{{
                            $t(i.label)
                          }}</span></q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
                <q-item class="radius-xs" clickable>
                  <q-item-section>{{$t('display_settings')}}：</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu auto-close anchor="top end" self="top start">
                    <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                      <q-item
                        v-for="i in uiOptions"
                        :key="i.val"
                        dense
                        clickable
                        class="radius-xs"
                        @click="update_uiOptions(i)"
                      >
                        <q-item-section v-if="i.enable" side
                          ><q-icon :name="i.icon" color="green" size="xs"
                        /></q-item-section>
                        <q-item-section
                          ><span class="q-pr-md">{{
                            i.label
                          }}</span></q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
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
                  <q-item-section>{{$t('delete_column')}}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <q-btn-group
        v-if="useAuths('create', ['column'])"
        dense
        unelevated
        size="sm"
        class="full-width border"
        no-caps
      >
        <q-btn
          dense
          size="sm"
          icon="add"
          :color="$q.dark.mode ? 'grey-10 text-grey-2' : 'white text-grey-10'"
          @click="CreateCardFn(columnRef.id)"
          class="q-space"
        />
        <q-btn
          v-if="isKanban"
          dense
          size="sm"
          icon="arrow_drop_down"
          :color="$q.dark.mode ? 'grey-10 text-grey-2' : 'white text-grey-10'"
          class="border-left"
        >
          <q-menu class="radius-sm">
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item
                v-for="i in cardTypes"
                :key="i.val"
                dense
                clickable
                class="radius-xs"
                :class="
                  $q.dark.mode ? 'grey-10 text-grey-1' : 'white text-grey-10'
                "
                v-close-popup
                @click="CreateCardFn(columnRef.id, i.val)"
              >
                <q-item-section side
                  ><q-icon
                    :name="i.icon"
                    :color="DefaultCreateCardType === i.val ? 'orange' : ''"
                /></q-item-section>
                <q-item-section class="q-pr-md">{{ $t(i.label) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-btn-group>
      <CreateCard
        v-if="
          createCard_in === columnRef.id && useAuths('create', ['card'])
        "
        :column_id="columnRef.id"
        :DefaultCreateCardType="DefaultCreateCardType"
        @created="created"
        @createCannel="createCannel"
        @closeCreate="closeCreate"
      />
      <q-scroll-area
        v-if="$q.screen.gt.xs"
        class="full-width q-space scroll-container flex-content"
        :id="columnRef.id"
        ref="columnScrollRef"
        @mouseenter="setMouseWheelScroll"
      >
        <VueDraggable v-model="filteredCards"
          :animation="200" :forceFallback="true" :fallbackOnBody="true"
          handle=".dragBar" filter=".undrag" group="tasks"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="q-py-xs radius-sm column gap-sm no-wrap forbid"
          :class="teamStore.cardDragging ? 'q-space' : ''"
          @start="dragStart"
          @end="dragEnd"
          @sort="onSort"
          ref="draggableRef"
        >
          <template v-for="element in filteredCards" :key="element.id">
            <CardItem
              :card="element"
              :isCreator_column="isCreator"
              :viewType="'card'"
              :uiOptions="uiOptions"
              @cardChange="cardChange"
              @cardDelete="cardDelete"
              @mouseenter="dragHandler(false)"
              @mouseleave="dragHandler(true)"
            />
          </template>
        </VueDraggable>
        <div v-if="!teamStore.cardDragging"
          data-dragscroll
          class="q-space"
          style="order: 9999; opacity: 0"
          :class="setDragscroll && 'cursor-grab'"
          @mouseenter="uiStore.dragKanbanScrollEnable = true"
          @mousedown="setDragscroll = true"
          @mouseup="setDragscroll = false"
          @dblclick.stop="CreateCardFn(columnRef.id)"
        >
          <q-popup-proxy context-menu class="radius-sm shadow-12">
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item clickable v-ripple class="radius-xs">
                <q-item-section>{{ $t('create_card') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu anchor="top end" self="top start" class="radius-sm">
                  <q-list bordered dense class="q-pa-xs radius-sm">
                    <q-item
                      v-for="i in cardTypes"
                      :key="i.val"
                      dense
                      clickable
                      class="radius-xs"
                      v-close-popup
                      @click="CreateCardFn(columnRef.id, i.val)"
                    >
                      <q-item-section side
                        ><q-icon
                          :name="i.icon"
                          :color="
                            DefaultCreateCardType === i.val ? 'orange' : ''
                          "
                      /></q-item-section>
                      <q-item-section class="q-pr-md">{{
                        $t(i.label)
                      }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-item class="radius-xs" clickable>
                <q-item-section>{{ $t('display_settings') }}：</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu auto-close anchor="top end" self="top start">
                  <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                    <q-item
                      v-for="i in uiOptions"
                      :key="i.val"
                      dense
                      clickable
                      class="radius-xs"
                      @click="update_uiOptions(i)"
                    >
                      <q-item-section v-if="i.enable" side
                        ><q-icon :name="i.icon" color="green" size="xs"
                      /></q-item-section>
                      <q-item-section
                        ><span class="q-pr-md">{{
                          i.label
                        }}</span></q-item-section
                      >
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
            </q-list>
          </q-popup-proxy>
          <!-- 此div充满分栏剩余空间，作为拖拽横向滚动的抓手使用 -->
        </div>
      </q-scroll-area>
      <VueDraggable v-else v-model="filteredCards"
        :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" filter=".undrag" group="tasks"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="q-py-xs radius-sm column gap-sm no-wrap forbid"
        :class="`${teamStore.cardDragging ? 'q-space' : ''} ${$q.screen.gt.xs ? '' : 'full-width'}`"
        @sort="onSort"
        @start="dragStart"
        @end="dragEnd"
        ref="draggableRef"
      >
        <template v-for="element in filteredCards" :key="element.id">
          <CardItem
            :card="element"
            :isCreator_column="isCreator"
            :viewType="'card'"
            :uiOptions="uiOptions"
            @cardChange="cardChange"
            @cardDelete="cardDelete"
            @mouseenter="dragHandler(false)"
            @mouseleave="dragHandler(true)"
          />
        </template>
      </VueDraggable>
    </template>
    <template v-if="columnRef && view_modelRef === 'list'">
      <div class="full-width row no-wrap items-center q-px-xs q-pt-xs gap-xs radius-xs transparent font-medium hovered-item">
        <StatusMenu
          :status="columnRef.status"
          :modify="useAuths('status', ['column'])"
          :dense="true"
          @statusChange="statusChange"
        />
        <span class="q-space"
          :class=" useAuths('order', ['column'])
              ? 'dragBar listDragBar'
              : ''
          "
          >{{ columnRef.name }}</span
        >
        <q-space />
        <q-btn v-if="useAuths('create', ['card'])"
          dense
          flat
          round
          size="sm"
          icon="add"
          class="hover-show transition"
        >
          <q-menu>
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item
                v-for="i in cardTypes"
                :key="i.val"
                dense
                clickable
                class="radius-xs"
                v-close-popup
                @click="CreateCardFn(columnRef.id, i.val)"
              >
                <q-item-section side
                  ><q-icon
                    :name="i.icon"
                    :color="DefaultCreateCardType === i.val ? 'orange' : ''"
                /></q-item-section>
                <q-item-section class="q-pr-md text-no-wrap">{{
                  $t(i.label)
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <span v-if="columnRef.unread_count > 0"
          class="bg-primary radius-full"
          style="width: 5px; height: 5px"
        />
        <q-btn v-if=" useAuths('name', ['column']) || useAuths('delete', ['column']) || isCreator"
          dense size="sm" flat round icon="more_vert"
        >
          <q-menu class="border shadow-24">
            <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
              <template v-if="useAuths('name', ['column'])">
                <q-item class="no-padding">
                  <q-item-section>
                    <q-input v-model="params.data.name"
                      type="text"
                      :placeholder="$t('column_name')"
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
              </template>
              <template v-if="useAuths('delete', ['column'])">
                <q-separator spaced />
                <q-item @click="deleteColumnFn()"
                  clickable
                  v-close-popup
                  class="radius-xs"
                >
                  <q-item-section>{{$t('delete_column')}}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <VueDraggable v-model="filteredCards" target=".taskItems"
        :animation="300" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" filter=".undrag" group="tasks"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="full-width forbid"
        :class="teamStore.cardDragging ? 'q-space' : ''"
        @sort="onSort"
        @start="dragStart"
        @end="dragEnd"
      >
        <q-markup-table dense flat bordered class="full-width q-space table-view">
          <thead>
            <tr>
              <th v-if="!teamStore.shareInfo" class="text-left"></th>
              <th class="text-left status">{{$t('status')}}</th>
              <th class="text-left thumbnial">{{$t('thumbnial')}}</th>
              <th class="text-left name">{{$t('title')}}</th>
              <th class="text-left content">{{$t('content')}}</th>
              <th class="text-left todos">{{$t('todo')}}</th>
              <th class="text-left score">{{$t('score')}}</th>
              <th class="text-left progress">{{$t('progress')}}</th>
              <th v-if="!teamStore.shareInfo" class="text-left follow">{{$t('follower')}}</th>
              <th v-if="!teamStore.shareInfo" class="text-left more">{{$t('more_actions')}}</th>
            </tr>
          </thead>
          <div v-if=" createCard_in === columnRef.id && useAuths('create', ['card'])" class="q-pa-sm">
            <CreateCard
              :column_id="columnRef.id"
              :DefaultCreateCardType="DefaultCreateCardType"
              @createCannel="createCannel"
            />
          </div>
          <tbody class="taskItems">
            <RowCardItem v-for="(element, index) in filteredCards" :key="element.id"
              :card="element"
              :index="index"
              :isCreator_column="isCreator"
              :viewType="'list'"
              :uiOptions="uiOptions"
              @cardChange="cardChange"
              @cardDelete="cardDelete"
            />
          </tbody>
        </q-markup-table>
      </VueDraggable>
    </template>
  </div>
</template>

<script setup>
import {
  ref,
  toRef,
  watch,
  watchEffect,
  computed,
  onBeforeMount,
  onMounted,
  nextTick
} from "vue";
import { VueDraggable } from 'vue-draggable-plus'
import CardItem from "src/pages/team/card/CardItem.vue";
import RowCardItem from "src/pages/team/card/RowCardItem.vue";
import CreateCard from "src/pages/team/card/components/CreateCard.vue";
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";

import { useQuasar } from "quasar";
import {
  updateColumn,
  deleteColumn,
  findCard,
} from "src/api/strapi/project.js";
import localforage from "localforage";

import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { filterCardsByString } from "src/hooks/utilits.js";
import { board_type } from "src/pages/team/kanban/BoradsList.js";

import {
  userStore,
  teamStore,
  mm_wsStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import { useMagicKeys } from "@vueuse/core";
import { i18n } from 'src/boot/i18n.js';
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
const isCreator = computed(
  () =>
    columnRef.value.creator?.id === userStore.userId || props.isCreator_kanban
);
const kanban_idRef = toRef(props, "kanban_id");
const view_modelRef = toRef(props, "view_model");
const isKanban = computed(() => board_type.value === "kanban");

let filter_txt = ref();
let filteredCards = ref();
let cards = ref();
let column_name = ref();
let column_unread_count = ref();
let column_status = ref();
let column_type = ref();
let column_executor = ref();
watchEffect(() => {
  filter_txt.value = teamStore.filter_txt;
});
watch(
  columnRef,
  () => {
    cards.value = columnRef.value?.cards;
    filteredCards.value = cards.value;
    column_name.value = columnRef.value?.name;
    column_unread_count.value = columnRef.value?.unread_count;
    column_status.value = columnRef.value?.status;
    column_type.value = columnRef.value?.type;
    column_executor.value = columnRef.value?.executor;
  },
  { immediate: true, deep: true }
);

const deleteColumnFn = () => {
  const deleteFn = async () => {
    let res;
    if (teamStore.card?.id) {
      const card_id = teamStore.card?.id;
      res = await deleteColumn(
        teamStore.project.id,
        columnRef.value.id,
        card_id
      );
    } else {
      res = await deleteColumn(teamStore.project.id, columnRef.value.id);
    }
    if (res) {
      let chat_Msg = {
        body: `${userStore.me?.username}删除了看板"${teamStore.kanban?.title}"内分栏${columnRef.value.name}`,
        props: {
          strapi: {
            data: {
              is: "column",
              by_user: userStore.userId,
              kanban_id: kanban_idRef.value,
              action: "columnDeleted",
              column_id: res.data.id,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  };
  if (columnRef.value.cards.length > 0) {
    $q.dialog({
      title: $t('attention'),
      message: $t('delete_column_include_cards_tip'),
      cancel: $t('cancel'),
      ok: $t('confirm'),
      class: "shadow-24",
    }).onOk(() => {
      deleteFn();
    });
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
    if (params.value.data.name) {
      let chat_Msg = {
        body: `${userStore.me.username}将看板"${teamStore.kanban?.title}"内分栏${columnRef.value.name}的名称修改为${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "column",
              by_user: userStore.userId,
              column_id: columnRef.value.id,
              action: "columnNameUpdated",
              name: res.data.name,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
    if (params.value.data.status) {
      let chat_Msg = {
        body: `${userStore.me.username}将看板"${teamStore.kanban?.title}"内分栏${columnRef.value.name}的状态修改为${res.data.status}`,
        props: {
          strapi: {
            data: {
              is: "column",
              by_user: userStore.userId,
              column_id: columnRef.value.id,
              action: "columnStatusUpdated",
              status: res.data.status,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
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

  let res = await updateColumn(columnRef.value.id, params);
  if (res?.data) {
    let chat_Msg = {
      body: `${userStore.me.username}拖拽了看板"${teamStore.kanban?.title}"内卡片的位置`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            column_id: columnRef.value?.id,
            action: "orderCard",
            order: params.data.cards,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const onSort = async () => {
  await dragCard_sort()
}

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

//卡片部分
const createCard_in = ref(null);
const DefaultCreateCardType = ref();
let DefaultCreateCardType_key = `___DefaultCreateCardType_key__${columnRef.value?.id}`;
const CreateCardFn = (column_id, createCardType) => {
  if (!uiStore.draging) {
    createCard_in.value = createCard_in.value ? null : column_id;
    if (createCardType) {
      DefaultCreateCardType.value = createCardType;
    }
  }
};
const closeCreate = () => {
  createCard_in.value = null;
  showCreater.value = false;
};
const showCreater = ref(false);
const created = (val) => {
  if(!mm_wsStore.online){
    pushCard(val);
  }
}
const createCannel = () => {
  createCard_in.value = null;
  showCreater.value = false;
};
const cardChange = (val) => {
  emit("cardChange", val);
};
const cardDelete = (card_id) => {
  emit("cardDelete", card_id);
};
const dragStart = (event) => {  
  teamStore.cardDragging = true;
  uiStore.draging = true;
};
const dragEnd = () => {
  // console.log('dragEnd');
  setTimeout(() => {
    teamStore.cardDragging = false;
    uiStore.draging = false;
  }, 500);
};
const setDragscroll = ref(false);

const getDefaultCreateCardType = async () => {
  try {
    // 使用await等待localforage.getItem的结果
    const res = await localforage.getItem(DefaultCreateCardType_key);
    // 如果获取到值，就设置为该值，否则设置为’note’
    DefaultCreateCardType.value = res || "note";
  } catch (e) {
    console.log(e);
  }
};
getDefaultCreateCardType();
const cardTypes = ref([
  { val: "task", label: "task", icon: "task_alt" },
  { val: "note", label: "note", icon: "event_note" },
  { val: "todo", label: "todo", icon: "checklist" },
]);
const setDefaultCreateCardType = async (val) => {
  try {
    const res = await localforage.setItem(DefaultCreateCardType_key, val);
    DefaultCreateCardType.value = res || "note";
  } catch (e) {
    console.log(e);
  }
};

watch(
  filter_txt,
  () => {
    if (cards.value) {
      if (filter_txt.value) {
        // 对filteredCards进行筛选，而不是columnRef.value.cards
        filteredCards.value = filterCardsByString(
          filter_txt.value,
          cards.value
        );
      }
      if (!filter_txt.value) {
        // 将filteredCards恢复为原始的数据，而不是columnRef.value.cards
        filteredCards.value = cards.value;
      }
    }
  },
  { immediate: true, deep: false }
);

const { current } = useMagicKeys();
const keys = computed(() => Array.from(current));
watch(
  keys,
  () => {
    if (keys.value) {
      if (
        keys.value?.includes("escape") &&
        createCard_in.value === columnRef.value?.id
      ) {
        createCard_in.value = void 0;
      }
    }
  },
  { immediate: false, deep: false }
);

// 有竖向滚动条，当鼠标进入分栏后，禁用滚轮横向滚动
const hasScrollBar = ref();
const columnScrollRef = ref(null);
const setMouseWheelScroll = () => {
  if(!columnScrollRef.value) return
  const {verticalSize, verticalContainerSize} = columnScrollRef.value.getScroll();
  hasScrollBar.value = verticalSize > verticalContainerSize;
}
const dragHandler = (val) => {
  if (uiStore.draging || $q.screen.lt.sm) return;
  uiStore.scrollX_byWheel = hasScrollBar.value ? val : true;

  // 鼠标进入卡片范围后，禁用拖拽横向滚动
  uiStore.dragKanbanScrollEnable = val;
};

const pushCard = (_card) => {
  if (teamStore.kanban?.type === "kanban") {
    columnRef.value.cards = [_card, ...columnRef.value?.cards];
  } else {
    columnRef.value.cards = [...columnRef.value?.cards, _card];
  }
}
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
          strapi.data?.column_id === columnRef.value?.id &&
          strapi.data?.action === "columnNameUpdated"
        ) {
          // console.log(strapi);
          columnRef.value.name = strapi.data?.name;
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data?.column_id === columnRef.value?.id &&
          strapi.data?.action === "columnStatusUpdated"
        ) {
          columnRef.value.status = strapi.data?.status;
        }
        // todo 接收到卡片被设置为私有后，检查当前用户是否包含在该卡片用户成员中，如果不在，删除此卡片
        if (
          strapi.data?.is === "card" &&
          strapi.data.action === "card_privateChanged"
        ) {
          if (
            filteredCards.value.map((i) => i.id).includes(strapi.data.card_id)
          ) {
            let card = filteredCards.value.find(
              (i) => i.id === strapi.data.card_id
            );
            let card_members = card.card_members;
            const card_users_ids = card_members.map((i) => i.by_user.id);
            if (!card_users_ids?.includes(userStore.userId)) {
              filteredCards.value = filteredCards.value.filter(
                (i) => i.id !== strapi.data.card_id
              );
              cards.value = cards.value.filter(
                (i) => i.id !== strapi.data.card_id
              );
              // 如果当前用户正在弹框内查看该卡片详情，关闭并发出提醒
              if (teamStore.card.id === strapi.data.card_id) {
                teamStore.card = null;
                $q.notify($t('cant_view_private_card_tip'));
              }
            }
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.column_id === columnRef.value?.id &&
          strapi.data.action === "cardCreated"
        ) {
          const _card_ids = columnRef.value.cards.map(i => i.id);
          if(!_card_ids.includes(strapi.data.body.id)){
            let res = await findCard(strapi.data.body.id);
            if (res?.data) {
              pushCard(res.data);
            }
          }
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.column_id === columnRef.value?.id &&
          strapi.data.action === "orderCard"
        ) {
          await nextTick();
          const order = strapi.data.order;
          let _all_cards = teamStore.kanban.columns?.map(column => column.cards).flat();

          // 如果 从 分栏 a 中移动卡片到 分栏 b,
          // a 的移出行为将导致 store 中 card 被移出
          // b 重新获取 all_cards时将不会得到被移出的卡片
          // 所以 将a中被移出的卡片添加到流浪卡片中
          // b 在获取all_cards后检查流浪卡片是否存在，如果存在则添加到all_cards中
          const _notExit_cards_inOrder = columnRef.value.cards.filter(i => !order.includes(i.id));
          if(_notExit_cards_inOrder.length > 0){
            teamStore.kanban.wandringCards = _notExit_cards_inOrder;
          }
          if(teamStore.kanban.wandringCards){
            _all_cards = [..._all_cards, ...teamStore.kanban.wandringCards];
          }
          const syncCards = async (_order) => {
            const targetIds = _order;
            // 创建一个包含所有异步操作的promise数组
            const cardPromises = targetIds.map(async (id) => {
              const card = _all_cards.find(i => i.id === id);
              if (!card) {
                const res = await findCard(id);
                if (res?.data) {
                  return res.data;
                } else {
                  return {
                    id: -1,
                    error: 'card_fetch_error'
                  };
                }
              }
              return card;
            });

            // 使用Promise.all等待所有异步操作完成
            const cards = await Promise.allSettled(cardPromises);
            console.log(cards);
            

            // 更新卡片数组
            columnRef.value.cards = cards.map(i => i.status === "fulfilled" && i.value);
          }
          await syncCards(order);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
const uiOptions = ref([
  {
    val: "hidecompletedTodo",
    label: $t('hide_completed_todo'),
    enable: true,
    icon: "mdi-checkbox-marked-circle",
  },
]);
onBeforeMount(() => {
  sync_uiOptions();
});
const update_uiOptions = async (i) => {
  i.enable = !i.enable;
  uiOptions.value = uiOptions.value.map((ui) => (ui.val === i.val && i) || ui);
  let res = JSON.stringify(uiOptions.value);
  await localforage
    .setItem(`___column_${columnRef.value.id}_uiOptions`, res)
    .catch(function (err) {
      console.log(err);
    });
};
const sync_uiOptions = async () => {
  let res = await localforage.getItem(
    `___column_${columnRef.value.id}_uiOptions`
  );
  if (res) {
    uiOptions.value = JSON.parse(res);
  }
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
.table-view .dragBar {
  width: 4rem;
}
.table-view .status {
  width: 8rem;
}
.table-view .thumbnial {
  width: 14rem;
}
.table-view .name {
  width: 16rem;
}
.table-view .content {
  width: auto;
  min-width: 18rem;
  text-wrap: wrap;
}
.table-view .todos {
  width: 8rem;
}
.table-view .score {
  width: 8rem;
}
.table-view .progress {
  width: 6rem;
}
.table-view .follow {
  width: 12rem;
}
.table-view .more {
  width: 4rem;
}
</style>
