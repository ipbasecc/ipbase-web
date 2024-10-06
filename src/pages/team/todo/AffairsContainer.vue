<template>
  <div class="absolute-full column no-wrap">
    <q-bar class="transparent border-bottom q-px-xs" style="height: 36px">
      <q-btn-group flat class="border">
        <q-btn
          v-for="i in viewModels"
          :key="i.val"
          dense
          padding="4px 10px"
          :label="$t(i.label)"
          :icon="i.icon"
          :color="viewModel === i.val ? 'primary' : ''"
          :class="
            viewModel === i.val
              ? 'text-white'
              : $q.dark.mode
              ? 'text-grey-3'
              : 'text-grey-10'
          "
          @click="setViewModel(i.val)"
        />
      </q-btn-group>
    </q-bar>
    <div class="q-space relative-position">
      <q-resize-observer @resize="onResize" />
      <ScrollBody v-if="viewModel === 'kanban'">
        <CardAffairs v-if="_for === 'card'" :mainArea :data="todogroups" :card :_for />
      </ScrollBody>
      <QuadrantView v-if="viewModel === 'quadrant'" :mainArea :card />
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from "vue";
import ScrollBody from './affairs/ScrollBody.vue'
import AffairsBody from './affairs/AffairsBody.vue'
import CardAffairs from './affairs/CardAffairs.vue'
import QuadrantView from './affairs/QuadrantView.vue';

const { todogroups, _for = 'personal', card } = defineProps({
    todogroups: Array,
    _for: String,
    card: Object
})
// const props = defineProps({
//     todogroups: Array,
//     _for: String
// })
// const { todogroups, _for } = toRefs(props)

const mainArea = ref(null);
const onResize = (size) => {
    mainArea.value = size;
}

const viewModels = [
    { val: "kanban", label: "kanban", icon: "view_kanban" },
    { val: "quadrant", label: "quadrant", icon: "border_inner" },
];

const viewModel = ref('kanban');
const setViewModel = (model) => {
    viewModel.value = model;
}
</script>

<style scoped></style>
