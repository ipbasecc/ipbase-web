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
    />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, toRefs, computed } from "vue";
import { calcCoordinate } from "src/hooks/utilits.js";

import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import { filterCardsByString } from "src/hooks/utilits.js";
import { teamStore } from "src/hooks/global/useStore.js";

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
