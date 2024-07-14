<template>
  <div class="absolute-full">
    <template v-if="calc_auth(authBase.collection, 'read', authBase.of)">
      <div
        v-if="kanban?.type === 'kanban' && kanban"
        class="fit q-pa-sm scroll-x"
        v-dragscroll:nochilddrag
      >
        <QuadrantModebl
          v-if="view_modelRef === 'quadrant'"
          :kanban_data="kanban"
          :isCreator_kanban="isCreator"
        />
        <draggable
          v-else
          :key="kanban.id"
          :list="kanban.columns"
          :fallback-class="true"
          :item-key="(key) => key"
          :fallbackTolerance="2"
          :force-fallback="true"
          :fallbackOnBody="true"
          :scroll="true"
          :touchStartThreshold="2"
          :delay="100"
          animation="200"
          chosen-class="chosenGroupClass"
          filter=".card"
          ghost-class="ghostColumn"
          group="columns"
          handle=".dragBar"
          class="fit no-wrap gap-sm border-placeholder"
          :class="view_modelRef === 'kanban' ? 'row' : 'column'"
          @change="dragColumn_done(kanban.id)"
        >
          <template #item="{ element }">
            <ColumnContainer
              v-if="kanban.type === 'kanban'"
              :isCreator_kanban="isCreator"
              :view_model="view_modelRef"
              :column="element"
              :kanban_id="kanban.id"
              :__dragging_column="__dragging_column"
              @cardCreated="cardCreated"
              @cardChange="cardChange"
              @cardDelete="cardDelete"
              @orderCard="orderCard"
            />
          </template>
          <template
            v-if="calc_auth(authBase.collection, 'create', authBase.of)"
            #footer
          >
            <div
              :class="view_model === 'list' ? 'row' : ''"
              style="min-width: 322px"
            >
              <div v-if="new_column_ing" class="q-pa-xs radius-xs border">
                <q-input
                  v-model="new_column_name"
                  type="text"
                  placeholder="分栏名称"
                  dense
                  square
                  filled
                  autofocus
                  @keyup.enter="createColumnFn"
                  @keyup.esc="new_column_ing = false"
                >
                  <template v-slot:append>
                    <q-btn
                      dense
                      flat
                      size="sm"
                      round
                      icon="add"
                      @click="createColumnFn"
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
                label="添加新分栏"
                @click="new_column_ing = true"
              />
              <div
                v-else
                :class="view_model === 'list' ? '' : 'full-width'"
                class="q-pa-xs cursor-pointer transition font-medium add-column-txt"
                @click="new_column_ing = true"
              >
                新建分栏
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </template>
    <div v-else class="fit flex flex-center">
      <span class="op-5">您没有查看该内容的权限</span>
    </div>
    <LoadingBlock v-if="loading" />
  </div>
</template>

<script setup>
import { ref, toRef, watch, computed, provide } from "vue";
import draggable from "vuedraggable";
import { kanbanUpdate, createColumn } from "src/api/strapi/project.js";
import ColumnContainer from "src/pages/Project/kanban/ColumnContainer.vue";
import QuadrantModebl from "src/pages/Project/kanban/QuadrantModebl.vue";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import useUserStore from "src/stores/user.js";
import { send_MattersMsg, send_CardMsg } from "src/hooks/utilits/useSendmsg.js";
import {
  getKanbanCache,
  getKanban,
  putKanbanCache,
} from "src/hooks/project/useProcess.js";
import { toRefs } from "vue";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
import LoadingBlock from "../../../components/VIewComponents/LoadingBlock.vue";
const { userId } = useMatedate;
const projectStore = useProjectStore();
const mm_wsStore = useMmws();
const userStore = useUserStore();

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
const view_modelRef = toRef(props, "view_model");

const authBase = computed(() => {
  let res;
  let isInCard;
  if (projectStore.card) {
    const members = projectStore.card.card_members.map((i) => i.by_user.id);
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
const initKanban = async (pid, kid) => {
  if (loading.value) return;
  loading.value = true;
  const init = (res) => {
    kanban.value = res;
    projectStore.kanban = res; // 其他页面可能需要此判断
    projectStore.kanban_type = res.type; // 其他页面可能需要此判断
    let all_cards = res?.columns?.map((i) => i.cards).flat(2);
    if (!projectStore.card) {
      projectStore.all_cards = all_cards;
    } else {
      projectStore.all_cards = [...projectStore.all_cards, all_cards];
    }
    loading.value = false;
  };
  let cache = await getKanbanCache(kid);
  if (cache) {
    init(cache);
  }
  const fetch = await getKanban(pid, kid);
  if (fetch) {
    init(fetch);
  }
};
// onBeforeMount(() => {
//   // console.log('fetch kanban',kanban_id.value);
//   initKanban();
// });
watch(
  [project_id, kanban_id],
  () => {
    if (project_id.value && kanban_id.value) {
      // console.log("fetch kanban", kanban_id.value);
      projectStore.kanban_id = kanban_id.value;
      initKanban(project_id.value, kanban_id.value);
    }
  },
  { immediate: true, deep: true }
);

// Card详情对话框开启时收到来自ws的刷新看板数据时，不会立刻刷新，
watch(
  projectStore,
  () => {
    if (projectStore.need_refecth_kanban && !projectStore.card) {
      projectStore.need_refecth_kanban = false;
      initKanban(project_id.value, kanban_id.value);
    }
  },
  { immediate: false, deep: false }
);

watch(
  kanban,
  async () => {
    if (kanban.value) {
      await putKanbanCache(kanban.value);
    }
  },
  { immediate: false, deep: true }
);

const __dragging_column = ref(false);

const params = ref({
  project_id: projectStore.project?.id,
  kanban_id: kanban.value?.id,
  data: {
    columns: [],
  },
});

const dragColumn_done = async (kanban_id) => {
  params.value.data.columns = projectStore.kanban.columns.map((i) => i.id);
  if (projectStore.card?.id) {
    params.value.card_id = projectStore.card.id;
  }
  let res = await kanbanUpdate(kanban_id, params.value);
  if (res.data) {
    __dragging_column.value = false;
    let chat_Msg = {
      body: `${userStore.me.username}将调整了看板 - ${projectStore.kanban.title}内分栏的排序`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: projectStore.kanban.id,
            action: "orderColumn",
            body: {
              order: res.data.columns.map((i) => i.id),
            },
          },
          relation_action: "refetch_kanban",
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const new_column_name = ref();
const createColumnFn = async () => {
  let params = {
    project_id: projectStore.project.id,
    kanban_id: projectStore.kanban.id,
    data: {
      name: new_column_name.value,
    },
  };
  if (projectStore.card?.id) {
    params.card_id = projectStore.card.id;
  }
  let res = await createColumn(params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}在看板 - ${projectStore.kanban.title}内新建了分栏 ${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: projectStore.kanban.id,
            action: "columnCreated",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    if (projectStore.card?.chat_service?.chatService_postId) {
      delete chat_Msg.props;
      send_CardMsg(chat_Msg);
    }
    new_column_ing.value = false;
    new_column_name.value = "";
  }
};

const cardCreated = (card, column_id) => {
  // kanban.value.columns = kanban.value.columns.map(c => ({
  //     ...c,
  //     cards: c.id === column_id && ((!c.cards || c.cards.length === 0) && [card] || [card,...c.cards]) || c.cards
  // }))
};
const orderCard = () => {
  let order = kanban.value.columns.map((i) => ({
    ...i,
    cards: i.cards.map((c) => c.id),
  }));
  let chat_Msg = {
    body: `${userStore.me?.username}拖拽了看板"${projectStore.kanban.title}"内卡片的位置`,
    props: {
      strapi: {
        data: {
          is: "kanban",
          by_user: userStore.userId,
          kanban_id: kanban.value.id,
          action: "orderCard",
          order: order,
        },
      },
    },
  };
  // console.log(order.map(i => i.cards));
  send_chat_Msg(chat_Msg);
  return;
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

const cardChange = (val) => {
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
};

const new_column_ing = ref(false);
const splitterModel = ref(320);

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "columnCreated"
        ) {
          console.log("columnCreated");
          kanban.value.columns.push(strapi.data.body);
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "columnDeleted"
        ) {
          function isSameId(element) {
            return element.id === strapi.data.column_id;
          }
          if (projectStore.showCards) {
            const index =
              projectStore.card.card_kanban.columns.findIndex(isSameId);
            if (index !== -1) {
              projectStore.card.card_kanban.columns.splice(index, 1);
            }
          } else {
            const index = kanban.value.columns.findIndex(isSameId);
            if (index !== -1) {
              kanban.value.columns.splice(index, 1);
            }
          }
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "orderColumn"
        ) {
          // console.log('orderColumn',kanban.value.columns);
          kanban.value.columns = strapi.data.body.order.map((i) =>
            kanban.value.columns.find((c) => c.id === i)
          );
        }
        if (
          strapi.data?.is === "kanban" &&
          strapi.data.kanban_id === kanban.value.id &&
          strapi.data.action === "orderCard"
        ) {
          let order = strapi.data.order;
          let cards_tree = kanban.value.columns.map((c) =>
            c.cards.map((i) => i.id)
          );
          // if(strapi.data.by_user != userStore.userId) {
          // 如果是当前用户，那么卡片变化会在拖拽时就完成，不需要再次赋值
          // 但如果用户在两个浏览器窗口中开着同一个看板，那么该判断会导致非直接操作的窗口数据不更新
          // 因此此处不能使用此判断来确认是否要跟随ws的数据来更新数据和UI
          // }
          // 判断ws的order数据与当前看板的卡片order数据是否一致，如果一致则跳过赋值，不必更新数据和UI
          // 如果是当前用户操作拖拽了卡片，那么当前用户的数据和UI不必重复更新，以免UI闪烁
          if (order.map((i) => i.cards).flat(2) === cards_tree.flat(2)) return;

          let all_cards = kanban.value.columns.map((c) => c.cards).flat(2);
          kanban.value.columns = order.map((i) => ({
            ...i,
            cards: i.cards.map((index) =>
              all_cards.find((c) => c.id === index)
            ),
          }));
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.kanban_id === kanban.value?.id &&
          strapi.data.action === "QuadrantChange"
        ) {
          console.log("QuadrantChange ws", strapi.data);
          kanban.value.columns = kanban.value.columns.map((column) => ({
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
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
<style scoped>
.add-column-txt {
  color: white;
  opacity: 0.5;
}
.add-column-txt:hover {
  color: rgb(110 202 255);
  opacity: 1;
}
</style>
src/hooks/project/use.js
