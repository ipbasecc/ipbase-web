<template>
  <div class="absolute-full column no-wrap">
    <q-bar
      v-if="!hiddenToolbar"
      class="transparent border-bottom overflow-hidden no-padding"
      style="height: 2.3rem"
    >
      <q-space />
      <q-btn-group flat class="border">
        <q-btn
          dense
          padding="4px 10px"
          :label="$t('kanban')"
          icon="view_kanban"
          @click="view_modelRef = 'kanban'"
          :color="view_modelRef === 'kanban' ? 'primary' : ''"
          :class="
            view_modelRef === 'kanban'
              ? 'text-white'
              : $q.dark.mode
              ? 'text-grey-3'
              : 'text-grey-10'
          "
        />
        <q-btn
          dense
          padding="4px 10px"
          :label="$t('list')"
          icon="format_list_bulleted"
          @click="view_modelRef = 'list'"
          :color="view_modelRef === 'list' ? 'primary' : ''"
          :class="
            view_modelRef === 'list'
              ? 'text-white'
              : $q.dark.mode
              ? 'text-grey-3'
              : 'text-grey-10'
          "
        />
        <q-btn
          dense
          padding="4px 10px"
          :label="$t('quadrant')"
          icon="border_inner"
          @click="view_modelRef = 'quadrant'"
          :color="view_modelRef === 'quadrant' ? 'primary' : ''"
          :class="
            view_modelRef === 'quadrant'
              ? 'text-white'
              : $q.dark.mode
              ? 'text-grey-3'
              : 'text-grey-10'
          "
        />
      </q-btn-group>
      <q-input
        v-model="teamStore.filter_txt"
        type="text"
        flat
        dense
        filled
        square
        class="no-padding q-ml-sm"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-bar>
    <div class="q-space relative-position">
      <q-resize-observer @resize="onResize" />
      <KanbanModel
        :project_id="project_id"
        :kanban_id="kanban_id"
        :view_model="view_modelRef"
        belong="project_cardKanban"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, onBeforeUnmount } from "vue";

import KanbanModel from "src/pages/team/kanban/KanbanModel.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  project_id: {
    type: Number,
    default: NaN,
  },
  kanban_id: {
    type: Number,
    default: NaN,
  },
  hiddenToolbar: {
    type: Boolean,
    default: false,
  },
});
const view_modelRef = ref("kanban");
const { project_id, kanban_id, hiddenToolbar } = toRefs(props);
const onResize = (size) => {  
  console.log('onResize card', size);
  uiStore.mainWindowSize = size;
};
const project_mainWindowSize = uiStore.mainWindowSize;
onBeforeUnmount(() => {
  uiStore.mainWindowSize = project_mainWindowSize
});
</script>
