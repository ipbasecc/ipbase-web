<template>
  <div
    v-if="columnRef && calc_auth('column', 'read', authBase.of)"
    class="column no-wrap gap-xs q-px-sm items-center"
  >
    <div
      class="full-width row no-wrap items-center q-px-xs q-pt-xs gap-xs font-medium op-5"
    >
      <q-icon name="mdi-server-network" />
      <span
        class="q-space"
        :class="calc_auth('column', 'order', authBase.of) ? 'dragBar' : ''"
      >
        {{ columnRef.name }}
      </span>
      <q-btn
        v-if="calc_auth('card', 'create', authBase.of)"
        dense
        size="sm"
        icon="add"
        flat
        round
        @click="CreateCardFn(columnRef.id)"
      />
      <q-btn
        v-if="calc_auth('column', 'name', 'all')"
        dense
        size="sm"
        flat
        round
        icon="more_vert"
      >
        <q-menu class="border shadow-24">
          <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
            <q-item
              v-if="calc_auth('column', 'name', authBase.of)"
              class="no-padding"
            >
              <q-item-section>
                <q-input
                  v-model="params.data.name"
                  type="text"
                  placeholder="文件集名称"
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
            <template v-if="calc_auth('column', 'delete', authBase.of)">
              <q-separator spaced />
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="deleteColumnFn()"
              >
                <q-item-section>删除文件集</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="full-width" :id="columnRef.id">
      <CreateCard
        v-if="
          createCard_in === columnRef.id &&
          calc_auth('card', 'create', authBase.of)
        "
        :project_id="projectStore.project.id"
        :kanban_id="kanban_idRef"
        :column_id="columnRef.id"
        :name_only="true"
        @cardCreated="cardCreated"
        @createCannel="createCannel"
      />
      <draggable
        :list="columnRef.cards"
        animation="300"
        :delay="30"
        :fallbackTolerance="2"
        :force-fallback="true"
        :fallbackOnBody="true"
        :item-key="(key) => key"
        :sort="true"
        :touchStartThreshold="2"
        :scroll="true"
        ghost-class="ghostColumn"
        chosen-class="chosenGroupClass"
        drag-class="dragClass"
        group="tasks"
        handle=".dragBar"
        filter=".undrag"
        class="q-py-xs radius-sm column gap-sm no-warp forbid"
        :class="projectStore.cardDragging ? 'q-space' : ''"
        @change="dragCard_sort()"
        @start="dragStart()"
        @end="dragEnd()"
      >
        <template #item="{ element }">
          <StorageCard
            :card="element"
            @cardChange="cardChange"
            @cardDelete="cardDelete"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { inject, ref, toRef, watch, watchEffect } from "vue";
import draggable from "vuedraggable";
import StorageCard from "src/pages/Project/kanban/container/StorageCard.vue";
import CreateCard from "src/pages/Project/Card/CreateCard.vue";
import { useQuasar } from "quasar";
import { updateColumn, deleteColumn } from "src/api/strapi/project.js";

import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import { filterCardsByString } from "src/hooks/utilits.js";

import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const $q = useQuasar();
const route = useRoute();
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
    type: String,
    default: "",
  },
});
const columnRef = toRef(props, "column");
const kanban_idRef = toRef(props, "kanban_id");
const authBase = inject("authBase");

const deleteColumnFn = () => {
  const deleteFn = async () => {
    let res;
    if (projectStore.card?.id) {
      const card_id = projectStore.card?.id;
      res = await deleteColumn(
        projectStore.project.id,
        columnRef.value.id,
        card_id
      );
    } else {
      res = await deleteColumn(projectStore.project.id, columnRef.value.id);
    }
    if (res) {
      let chat_Msg = {
        body: `${userStore.me.username}删除了看板"${projectStore.kanban.title}"内分栏${columnRef.value.name}`,
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
      send_chat_Msg(chat_Msg);
    }
  };
  if (columnRef.value.cards.length > 0) {
    $q.dialog({
      title: "注意！",
      message: "分栏内包含有卡片，如果删除分栏，卡片也会被清理，是否继续？",
      cancel: "取消",
      ok: "确定",
      class: "shadow-24",
    })
      .onOk(() => {
        deleteFn();
      })
      .onCancel(() => {
        return;
      });
  } else {
    deleteFn();
  }
};
const params = ref({
  project_id: projectStore.project?.id,
  kanban_id: kanban_idRef.value,
  data: {
    name: "",
  },
});
const updateColumnFn = async () => {
  let res = await updateColumn(columnRef.value.id, params.value);
  if (res) {
    if (params.value.data.name) {
      let chat_Msg = {
        body: `${userStore.me.username}将看板"${projectStore.kanban.title}"内分栏${columnRef.value.name}的名称修改为${res.data.name}`,
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
        body: `${userStore.me.username}将看板"${projectStore.kanban.title}"内分栏${columnRef.value.name}的状态修改为${res.data.status}`,
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
    function isSameId(element) {
      return element.id === columnRef.value.id;
    }
    if (projectStore.showCards) {
      const index = projectStore.card.card_kanban.columns.findIndex(isSameId);
      if (index !== -1) {
        projectStore.card.card_kanban.columns.splice(index, 1, res.data);
      }
    } else {
      const index = projectStore.kanban.columns.findIndex(isSameId);
      if (index !== -1) {
        projectStore.kanban.columns.splice(index, 1, res.data);
      }
    }
    delete params.value.data.status;
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

const dragCard_sort = async () => {
  let params = {
    project_id: projectStore.project.id,
    kanban_id: kanban_idRef.value,
    data: {
      cards: columnRef.value.cards.map((i) => i.id),
    },
  };
  console.log("column changed", params);

  let res = await updateColumn(columnRef.value.id, params);
  if (res) {
    // todo 此处要复查
    let chat_Msg = {
      message: `${userStore.me.username}调整了看板"${projectStore.kanban.title}"内分栏${columnRef.value.name}内卡片的排序`,
    };
    send_chat_Msg(chat_Msg);
    return;
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};
//卡片部分
const createCard_in = ref(null);
const CreateCardFn = (column_id) => {
  createCard_in.value = createCard_in.value ? null : column_id;
};
const emit = defineEmits(["cardCreated", "cardChange", "cardDelete"]);
const cardCreated = (val) => {
  createCard_in.value = null;
  emit("cardCreated", val, columnRef.value.id);
};
const createCannel = () => {
  createCard_in.value = null;
};
const cardChange = (val) => {
  emit("cardChange", val);
};
const cardDelete = (card_id) => {
  emit("cardDelete", card_id);
};
const dragStart = () => {
  projectStore.cardDragging = true;
};
const dragEnd = () => {
  projectStore.cardDragging = false;
};

let filter_txt = ref();
let filteredCards = ref();
let cards = ref();
let column_name = ref();
let column_unread_count = ref();
let column_status = ref();
let column_type = ref();
let column_executor = ref();
watchEffect(() => {
  filter_txt.value = projectStore.filter_txt;
});
watch(
  columnRef,
  () => {
    filteredCards.value = columnRef.value?.cards;
    cards.value = columnRef.value?.cards;
    column_name.value = columnRef.value?.name;
    column_unread_count.value = columnRef.value?.unread_count;
    column_status.value = columnRef.value?.status;
    column_type.value = columnRef.value?.type;
    column_executor.value = columnRef.value?.executor;
  },
  { immediate: true, deep: true }
);
// 使用ref函数或shallowRef函数来创建cards变量
// 使用ref函数或shallowRef函数来创建filteredCards变量
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

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.column_id === columnRef.value.id &&
          strapi.data.action === "cardCreated"
        ) {
          emit("cardCreated", strapi.data.body, columnRef.value.id);
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.column_id === columnRef.value.id &&
          strapi.data.action === "columnUpdated"
        ) {
          let body = strapi.data.body;
          column_name.value = body.name;
          column_status.value = body.status;
          column_unread_count.value = body.unread_count;
          column_type.value = body.type;
          column_executor.value = body.executor;
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.column_id === columnRef.value.id &&
          strapi.data.action === "orderCard"
        ) {
          // console.log('orderCard');
          // cards.value = strapi.data.body.order.map(i => projectStore.all_cards.find(card => card.id === i))
          // filteredCards.value = cards.value
          emit("orderCard", columnRef.value.id, strapi.data.body.order);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.flex-content .q-scrollarea__content {
  display: flex;
  flex-direction: column;
}
</style>
