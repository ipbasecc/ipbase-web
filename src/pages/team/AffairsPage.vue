<template>
  <NavigatorContainer>
    <q-resize-observer @resize="onResize" />
    <q-scroll-area v-if="todogroups"
      v-dragscroll="{
        target: '.q-scrollarea__container',
        active: uiStore.dragKanbanScrollEnable
      }"
      v-dragscroll:nochilddrag
      v-dragscroll.x="$q.screen.gt.xs"
      v-dragscroll.y="false"
      v-on:dragscrollstart="dragscrollstart"
      v-on:dragscrollmove="draging"
      v-on:dragscrollend="dragscrollend"
      class="absolute-full"
      :class="`${$q.dark.mode ? 'bg-darker' : 'bg-grey-3'} ${uiStore.draging && 'cursor-grab'}`"
    >
      <VueDraggable v-model="todogroups"
        :animation="300" :delay="50"
        :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" filter=".undrag" group="todogroup"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="gap-sm no-wrap q-pa-sm row"
        :style="`height: ${mainArea?.height}px;`"
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
    </q-scroll-area>
  </NavigatorContainer>
</template>

<script setup>
import { ref, onMounted, nextTick, watchEffect } from "vue";
import NavigatorContainer from './NavigatorContainer.vue'
import {teamStore, uiStore, userStore} from 'src/hooks/global/useStore';
import {VueDraggable} from 'vue-draggable-plus'
import GroupContiner from './todo/affairs/GroupContiner.vue'
import {updateUserTodogroups} from "src/api/strapi.js";
import CreateColumn from './todo/affairs/CreateColumn.vue'

const todogroups = ref();
onMounted(() => {
  todogroups.value = teamStore?.init?.todogroups || [];
})

const mainArea = ref(null);
const onResize = (size) => {
  mainArea.value = size;
}

watchEffect(() => {
  if(userStore.affairsFilterIDs?.length > 0){
    todogroups.value = userStore.affairsFilterIDs.map(i => teamStore.init.todogroups.find(j => j.id === i))
  } else {
    todogroups.value = teamStore.init.todogroups
  }
})

const dragging = ref(false);
const dragTodogroup_sort = async () => {
  await nextTick();
  dragging.value = false;
  const sort = todogroups.value.map((i) => i.id);
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

const dragStart = () => {
  
}

const dragEnd = () => {

}
const todogroupCreated = (val) => {
  todogroups.value.push(val);
}
const todogroupDeleted = (_id) => {
  console.log('todogroupDeleted', _id);
  
  const index = todogroups.value.findIndex((i) => i.id === _id);
  console.log('todogroupDeleted index', index);
  if(index > -1){
    todogroups.value.splice(index, 1);
  }
}
const dragscrollstart = () => {
  uiStore.draging = true;
};
const draging = () => {
  // uiStore.draging = true
};
const dragscrollend = () => {
  uiStore.draging = false;
};

</script>

<style scoped></style>
