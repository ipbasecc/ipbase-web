<template>
  <div class="absolute-full" ref="quadrantChartRef">
    <q-resize-observer @resize="onResize" />
    <QuadrantBackgroud />
    <QuadrantChart
      v-if="kanban?.id && taskContainerSIze"
      :id="kanban.id"
      :axisData="axisData"
      :taskContainerSIze="taskContainerSIze"
      @QuadrantChange="QuadrantChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, toRefs, computed } from "vue";
import { calcCoordinate } from "src/hooks/utilits.js";

import QuadrantChart from "src/pages/Project/Card/components/QuadrantChart.vue";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";

import QuadrantBackgroud from "src/pages/Project/Card/components/QuadrantBackgroud.vue";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import useUserStore from "src/stores/user.js";
import { filterCardsByString } from "src/hooks/utilits.js";

const projectStore = useProjectStore();
const mm_wsStore = useMmws();
const userStore = useUserStore();

const props = defineProps({
  kanban_data: {
    type: Object,
    default() {
      return {};
    },
  },
});

const { kanban_data: kanban } = toRefs(props);
const taskContainerSIze = ref();
const quadrantChartRef = ref();
const onResize = (size) => {
  taskContainerSIze.value = size;
};

let cards = computed(() =>
  kanban.value?.columns?.map((column) => column.cards).flat(2)
);
let filteredCards = ref();
let axisData = ref();
let filter_txt = ref();
watchEffect(() => {
  filter_txt.value = projectStore.filter_txt;
  filteredCards.value = cards.value;
  axisData.value =
    (filteredCards.value?.length > 0 && calcCoordinate(filteredCards.value)) ||
    [];
});
watch(
  filter_txt,
  () => {
    if (cards.value) {
      if (filter_txt.value) {
        filteredCards.value = filterCardsByString(
          filter_txt.value,
          cards.value
        );
      }
      if (!filter_txt.value) {
        filteredCards.value = cards.value;
      }
    }
  },
  { immediate: true, deep: false }
);

const QuadrantChange = (id, params) => {
  let card = kanban.value.columns
    .map((i) => i.cards)
    .flat(2)
    .find((card) => card.id === id);
  let chat_Msg = {
    body: `${userStore.me.username}调整了卡片"${card.name}"在四象限中的位置`,
    props: {
      strapi: {
        data: {
          is: "card",
          by_user: userStore.userId,
          kanban_id: kanban.value.id,
          card_id: id,
          action: "QuadrantChange",
          quadrant: params.data,
        },
      },
    },
  };
  send_chat_Msg(chat_Msg);
};
const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        // if(strapi.data?.is === 'card' && strapi.data.kanban_id === kanban.value?.id && strapi.data.by_user != userStore.userId && strapi.data.action === 'QuadrantChange') {
        //     console.log(strapi.data);
        //     kanban.value.columns = kanban.value.columns.map(column => ({
        //         ...column,
        //         cards: column.cards.map(card => ({
        //             ...card,
        //             importance: card.id === strapi.data.card_id && strapi.data.quadrant.importance || card.importance,
        //             urgency: card.id === strapi.data.card_id && strapi.data.quadrant.urgency || card.urgency,
        //         }))
        //     }))
        // }
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
