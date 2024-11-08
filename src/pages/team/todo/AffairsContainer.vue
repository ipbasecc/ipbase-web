<template>
  <div class="column no-wrap">
    <q-bar v-if="!hideToolbar && todogroups?.length > 0" class="transparent border-bottom q-px-xs" style="height: 36px">
      <q-btn-group flat class="border">
        <q-btn v-for="i in viewModels" :key="i.val"
          dense padding="4px 10px"
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
    <slot name="header" />
    <div class="q-space relative-position">
        <q-resize-observer @resize="onResize" />
        <template v-if="viewModel === 'kanban'">
            <ScrollBody v-if="layout === 'row'">
                <AffairsBody v-if="_for === 'personal'" :mainArea :layout :_for />
                <CardAffairs v-else :mainArea :data="todogroups" :card :_for :layout :displayType :dense :uiOptions />
            </ScrollBody>
            <template v-else>
                <CardAffairs :mainArea :data="todogroups" :card :_for :layout :displayType :dense :uiOptions />
            </template>
        </template>
        <QuadrantView v-if="viewModel === 'quadrant'" :mainArea :card />
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onBeforeUnmount } from "vue";
import ScrollBody from './affairs/ScrollBody.vue'
import CardAffairs from './affairs/CardAffairs.vue'
import AffairsBody from './affairs/AffairsBody.vue'
import QuadrantView from './affairs/QuadrantView.vue';
import { teamStore, uiStore } from "src/hooks/global/useStore";

const { todogroups, _for = 'personal', card, hideToolbar, layout = 'row', displayType = 'todo', dense = false } = defineProps({
    todogroups: Array,
    _for: String,
    card: Object,
    hideToolbar: Boolean,
    layout: String,
    displayType: String,
    dense: Boolean,
    uiOptions: Object
})

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
const navigatorDrawerState = ref()
onBeforeMount(() => {
  if(teamStore.init?.todogroups?.length === 0){
    navigatorDrawerState.value = uiStore.navigatorDrawer
    uiStore.navigatorDrawer = false
  }
})
onBeforeUnmount(() => {
  uiStore.navigatorDrawer = navigatorDrawerState.value
})
</script>

<style scoped></style>
