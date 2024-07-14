<template>
  <draggable
    v-if="projectStore.card?.card_kanban?.columns"
    :key="projectStore.card.card_kanban.id"
    :list="projectStore.card.card_kanban.columns"
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
    class="absolute-full row no-wrap gap-sm q-pa-sm"
    @change="dragColumn_done(projectStore.card.card_kanban.id)"
  >
    <template #item="{ element }">
      <ColumnContainer
        :key="element.id"
        :column="element"
        :kanban_id="projectStore.card.card_kanban.id"
        :__dragging_column="__dragging_column"
        @cardChange="cardChange"
        @cardDelete="cardDelete"
        @orderCard="orderCard"
      />
    </template>
    <template #footer>
      <div class="" style="min-width: 322px">
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
            @keyup.ctrl.enter="createColumnFn"
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
          v-else-if="projectStore.card.card_kanban.columns.length === 0"
          dense
          class="full-width"
          align="left"
          color="primary"
          icon="add"
          label="添加分栏"
          @click="new_column_ing = true"
        />
        <div
          v-else
          class="full-width q-pa-xs cursor-pointer transition font-medium add-column-txt"
          @click="new_column_ing = true"
        >
          新建分栏
        </div>
      </div>
    </template>
  </draggable>
  <div v-else class="absolute-full column flex-center op-3">
    <BgBrand />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect } from "vue";
import draggable from "vuedraggable";
import { kanbanUpdate, createColumn } from "src/api/strapi/project.js";
import ColumnContainer from "src/pages/Project/kanban/ColumnContainer.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useMmws from "src/stores/mmws.js";
import { isJSON } from "src/hooks/utilits.js";
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const props = defineProps({
  proj_id: {
    type: String,
    default: "",
  },
});

const belonged_project = ref();

watchEffect(() => {
  belonged_project.value =
    projectStore.project || projectStore.card.belonged_project;
});
const __dragging_column = ref(false);

const params = ref({
  project_id: belonged_project.value.id,
  kanban_id: projectStore.card.card_kanban.id,
  card_id: projectStore.card.id,
  data: {
    columns: [],
  },
});
const dragColumn_done = async (kanban_id) => {
  params.value.data.columns = projectStore.card.card_kanban.columns.map(
    (i) => i.id
  );
  let res = await kanbanUpdate(kanban_id, params.value);
  if (res.data) {
    __dragging_column.value = false;
    let chat_Msg = {
      body: `${userStore.me.username}将调整了卡片${projectStore.card.name}的看板 - ${projectStore.kanban.title}内分栏的排序`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: projectStore.card.card_kanban.id,
            action: "orderColumn",
            body: {
              order: res.data.columns.map((i) => i.id),
            },
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const new_column_name = ref();
const createColumnFn = async () => {
  let params = {
    project_id: belonged_project.value.id,
    card_id: projectStore.card.id,
    kanban_id: projectStore.card.card_kanban.id,
    data: {
      name: new_column_name.value,
    },
  };
  let res = await createColumn(params);
  if (res && res.data) {
    let chat_Msg = {
      body: `${userStore.me.username}在卡片${projectStore.card.name}的看板 - ${projectStore.kanban.title}内新建了分栏${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "column",
            by_user: userStore.userId,
            kanban_id: projectStore.card.card_kanban.id,
            action: "columnCreated",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    new_column_ing.value = false;
    new_column_name.value = "";
  }
};
const orderCard = (column_id, order) => {
  function isSameId(element) {
    return element.id == column_id;
  }
  var index = projectStore.card.card_kanban.columns.findIndex(isSameId);
  if (index != -1) {
    projectStore.card.card_kanban.columns[index].cards = order.map((i) =>
      projectStore.all_cards_of_card.find((card) => card.id === i)
    );
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

function replaceCard(val) {
  // 定义一个方法
  let newArr = projectStore.card.card_kanban.columns.map((item) => {
    // 遍历arr中的每个元素
    item.cards = item.cards.map((subitem) => {
      // 遍历subarr中的每个元素
      let found = subitem.id === val.id; // 判断是否与obj的id相同
      return found ? val : subitem; // 如果相同，就用obj替换，否则保持不变
    });
    return item; // 返回修改后的元素
  });
  return newArr; // 返回新的数组
}
function removeCard(card_id) {
  // 定义一个方法
  let newArr = projectStore.card.card_kanban.columns.map((item) => {
    // 遍历arr中的每个元素
    item.cards = item.cards.filter((subitem) => {
      // 遍历subarr中的每个元素，并过滤掉不需要的元素
      let found = subitem.id === card_id; // 判断是否与val的id相同
      return !found; // 如果相同，就返回false，删除该元素，否则返回true，保留该元素
    });
    return item; // 返回修改后的元素
  });
  return newArr; // 返回新的数组
}

const cardChange = (val) => {
  projectStore.card.card_kanban.columns = replaceCard(val);
};
const cardDelete = (card_id) => {
  projectStore.card.card_kanban.columns = removeCard(card_id);
};

const new_column_ing = ref(false);

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
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === projectStore.card.card_kanban.id &&
          strapi.data.action === "columnCreated"
        ) {
          projectStore.card.card_kanban.columns.push(strapi.data.body);
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === projectStore.card.card_kanban.id &&
          strapi.data.action === "columnDeleted"
        ) {
          function isSameId(element) {
            return element.id == strapi.data.column_id;
          }
          if (projectStore.showCards) {
            const index =
              projectStore.card.card_kanban.columns.findIndex(isSameId);
            if (index != -1) {
              projectStore.card.card_kanban.columns.splice(index, 1);
            }
          } else {
            const index = projectStore.kanban.columns.findIndex(isSameId);
            if (index != -1) {
              projectStore.kanban.columns.splice(index, 1);
            }
          }
        }
        if (
          strapi.data?.is === "column" &&
          strapi.data.kanban_id === projectStore.card.card_kanban.id &&
          strapi.data.action === "orderColumn"
        ) {
          // console.log(strapi.data.body.order);
          let all_columns = projectStore.card.card_kanban.columns;
          projectStore.card.card_kanban.columns = strapi.data.body.order.map(
            (i) => all_columns.find((c) => c.id === i)
          );
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
