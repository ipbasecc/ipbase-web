<template>
  <NavigatorContainer>
    <div class="absolute-full column no-wrap">
      <q-bar class="transparent border-bottom q-px-xs" style="height: 36px;">
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
          <AffairsBody :mainArea />
        </ScrollBody>
        <QuadrantView v-if="viewModel === 'quadrant'" :mainArea />
      </div>
    </div>
  </NavigatorContainer>
</template>

<script setup>
import { ref } from "vue";
import NavigatorContainer from './NavigatorContainer.vue'
import ScrollBody from './todo/affairs/ScrollBody.vue'
import AffairsBody from './todo/affairs/AffairsBody.vue'
import QuadrantView from './todo/affairs/QuadrantView.vue'

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
