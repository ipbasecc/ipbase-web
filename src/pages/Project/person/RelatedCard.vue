<template>
    <div class="absolute-full" ref="quadrantChartRef">
        <!-- {{ kanban_id }} -->
        <!-- {{ initRef }} -->
        <QuadrantBackgroud />
        <q-resize-observer @resize="onResize" />
        <!-- {{ axisData }} -->
        <QuadrantChart :axisData="axisData" :taskContainerSIze="taskContainerSIze" />
    </div>
</template>

<script setup>
import { ref, toRef, watchEffect } from 'vue';

import QuadrantBackgroud from 'src/pages/Project/Card/components/QuadrantBackgroud.vue'
import QuadrantChart from 'src/pages/Project/Card/components/QuadrantChart.vue'
import { useQuasar } from "quasar";

import { calcCoordinate } from 'src/hooks/utilits.js'

const $q = useQuasar();

const props = defineProps({
    init: {
        type: Object,
        default() {
            return {}
        }
    }
});
const initRef = toRef(props,'init');

let axisData = ref();
const related_cards = ref([]);
watchEffect(() => {
    let followedCards = initRef.value?.followed_cards || [];
    let executorColumnCards = initRef.value?.executor_of_columns.map(c => c.cards || []).flat(2) || [];
    related_cards.value = [...followedCards,...executorColumnCards]
    axisData.value = related_cards.value.length > 0 && calcCoordinate(related_cards.value) || [];
})



const taskContainerSIze = ref();
const quadrantChartRef = ref();
const onResize = (size) => {
    taskContainerSIze.value = size;
}

</script>

<style lang="scss" scoped>


</style>