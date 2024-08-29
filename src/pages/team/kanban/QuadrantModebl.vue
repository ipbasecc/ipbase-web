<template>
  <div class="absolute-full" ref="quadrantChartRef">
    <q-resize-observer @resize="onResize" />
    <QuadrantBackgroud />
    <QuadrantChart
      v-if="kanban?.id && taskContainerSIze"
      :id="kanban.id"
      :axisData="axisData"
      :taskContainerSIze="taskContainerSIze"
      :auth="{
        read: useAuths('read', ['card']),
        modify: (useAuths('importance', ['card']) && useAuths('urgency', ['card'])),
        delete: useAuths('delete', ['card']),
      }"
      @QuadrantChange="QuadrantChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, toRefs, computed } from "vue";
import { calcCoordinate } from "src/hooks/utilits.js";

import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import { filterCardsByString } from "src/hooks/utilits.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";

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
  filter_txt.value = teamStore.filter_txt;
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
  await send_MattersMsg(MsgContent);
};
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
