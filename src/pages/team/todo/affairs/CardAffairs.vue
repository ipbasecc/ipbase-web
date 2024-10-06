<template>
    <VueDraggable v-model="todogroups"
      :animation="300" :delay="50"
      :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
      handle=".dragBar" filter=".undrag" group="todogroup"
      chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
      class="gap-sm no-wrap"
      :class="`
        ${layout === 'row' ? 'row' : 'column'}
        ${dense ? 'q-pa-xs' : 'q-pa-sm'}
        ${todogroups?.length > 0 ? 'bordered' : 'flex-center'}
      `"
      :style="layout === 'row' ? `height: ${mainArea?.height}px;` : ''"
      @start="dragStart" @sort="dragTodogroup_sort" @end="dragEnd"
    >
      <template v-if="todogroups?.length > 0">
        <GroupContiner
          v-for="group in todogroups" :key="group.id"
          :group="group"
          :card
          :_for
          :layout
          :displayType
          :dense
          :uiOptions
          @todogroupDeleted="todogroupDeleted"
        />
      </template>
      <CreateColumn
        :card :_for :layout :dense
        :createStyle="todogroups?.length > 0 ? 'normal' : 'init_create'"
      />
    </VueDraggable>
</template>

<script setup>
import { ref, watchEffect, nextTick } from 'vue'
import {teamStore, uiStore, userStore} from 'src/hooks/global/useStore';
import {VueDraggable} from 'vue-draggable-plus'
import GroupContiner from './GroupContiner.vue'
import CreateColumn from './CreateColumn.vue'
import { updateCard } from "src/api/strapi/project.js";

const { data = [], mainArea, card, _for, layout, displayType, dense, uiOptions } = defineProps({
  data: Array,
  mainArea: Object,
  card: Object,
  _for: String,
  layout: String,
  displayType: String,
  dense: Boolean,
  uiOptions: Object
})
const todogroups = ref();
watchEffect(() => {
  todogroups.value = data;
})

const dragging = ref(false);
const newIndex = ref(null);
const target = ref(null);

const dragTodogroup_sort = async () => {
  await nextTick();
  dragging.value = false;
  const sort = todogroups.value.map((i) => i.id);
  let params = {
    data: {
      todogroups: sort,
    },
  };
  if (card) {
    params.project_id = teamStore.project?.id;
    let card_id = card.id;
    await updateCard(card_id, params);
  }
};
const todogroupDeleted = (_id) => {  
  const index = todogroups.value.findIndex((i) => i.id === _id);
  console.log('todogroupDeleted index', index);
  if(index > -1){
    todogroups.value.splice(index, 1);
  }
  teamStore.init.todogroups = teamStore.init.todogroups.filter(i => i.id !== _id);
  if(userStore.affairsFilterIDs?.length > 0){
    userStore.affairsFilterIDs = userStore.affairsFilterIDs.filter(i => i !== _id);
  }
}

const dragStart = (e) => {
    target.value = e.data    
    uiStore.dragKanbanScrollEnable = false;
}

const dragEnd = (e) => {
    newIndex.value = e.newIndex
    uiStore.dragKanbanScrollEnable = true;
}
</script>

<style scoped>
</style>