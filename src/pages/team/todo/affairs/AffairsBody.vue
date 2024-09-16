<template>
    <VueDraggable v-model="todogroups"
      :animation="300" :delay="50"
      :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
      handle=".dragBar" filter=".undrag" group="todogroup"
      chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
      class="gap-sm no-wrap q-pa-sm"
      :class="$q.platform.is.mobile && !$q.screen.gt.sm ? 'column' : 'row'"
      :style="$q.screen.gt.sm ? `height: ${mainArea?.height}px;` : ''"
      @start="dragStart" @sort="dragTodogroup_sort" @end="dragEnd"
    >
      <template v-for="group in todogroups" :key="group.id">
        <GroupContiner
          :group="group"
          @todogroupDeleted="todogroupDeleted"
        />
      </template>
      <CreateColumn @todogroupCreated=todogroupCreated />
    </VueDraggable>
</template>

<script setup>
import { ref, toRefs, nextTick } from 'vue'
import {teamStore, uiStore, userStore} from 'src/hooks/global/useStore';
import {VueDraggable} from 'vue-draggable-plus'
import {updateUserTodogroups} from "src/api/strapi.js";
import GroupContiner from './GroupContiner.vue'
import CreateColumn from './CreateColumn.vue'
import { todogroups } from './useAffairs';
import { reorderArrayABasedOnArrayB } from 'src/hooks/utilits.js';

const props = defineProps(['mainArea']);
const { mainArea } = toRefs(props);

const dragging = ref(false);
const newIndex = ref(null);
const target = ref(null);
const dragTodogroup_sort = async () => {
  await nextTick();
  userStore.affairsFilterIDs = userStore.affairsFilterIDs?.length > 0 && todogroups.value.map((i) => i.id) || [];
  teamStore.init.todogroups = reorderArrayABasedOnArrayB(teamStore.init.todogroups, todogroups.value, target.value, newIndex.value);
  dragging.value = false;
  const sort = teamStore.init.todogroups.map((i) => i.id);
//   console.log('sort', sort);
  
  let params = {
    data: {
      todogroups: sort,
    },
  };
  const _update = await updateUserTodogroups(params);
  if(_update?.data){
    teamStore.init.todogroups = _update.data
    todogroups.value = _update.data
  }
}
const todogroupCreated = (val) => {
  todogroups.value.push(val);
  teamStore.init.todogroups.push(val);
  if(userStore.affairsFilterIDs?.length > 0){
    userStore.affairsFilterIDs.push(val.id);
  }
}
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