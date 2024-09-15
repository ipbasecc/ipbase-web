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
      <div class="row no-wrap">
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
        </VueDraggable>
        <CreateColumn @todogroupCreated=todogroupCreated />
      </div>
    </q-scroll-area>
    <template v-if="$q.screen.gt.xs">
      <q-dialog v-model="uiStore.topPannel" seamless position="top" full-width>
        <div class="q-pt-xs overflow-show">
          <q-card bordered @mouseenter="setTip" @mouseleave="showDeleteTip = false" class="radius-sm shadow-24">
              <q-card-section style="height: 3rem;width: 50vw" class="border full-width">
                <VueDraggable v-model="_dropItems"
                              :group="uiStore.dropGroup"
                              ref="draggableRef"
                              class="fit flex flex-center overflow-hidden op-1"
                              @end="showDeleteTip = false"
                >
                </VueDraggable>
                <div class="absolute-full flex flex-center">
                  <div class="absolute-full q-pa-xs">
                    <div class="radius-sm" :class="showDeleteTip ? 'bg-negative op-1 fit' : ''" />
                  </div>
                  <q-avatar v-if="!showDeleteTip" size="md" color="red" text-color="white" icon="mdi-delete-forever" />
                  <q-chip
                      v-else
                      color="negative"
                      size="md"
                      text-color="white"
                      icon="mdi-delete-forever"
                      :label="$t('delete_card_warning')"
                  />
                </div>
              </q-card-section>
          </q-card>
        </div>
        
      </q-dialog>
    </template>
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
import {deleteTodo, deleteTodogroup} from "src/api/strapi/project.js";

const todogroups = ref();
onMounted(() => {
  todogroups.value = teamStore?.init?.todogroups || [];
})

const mainArea = ref(null);
const onResize = (size) => {
  mainArea.value = size;
}
const _dropItems = ref([]);
const showDeleteTip = ref(false)
const setTip = () => {
  if(uiStore.dropGroup) {
    showDeleteTip.value = true
  }
}
watchEffect(async () => {
  if (_dropItems.value?.length > 0) {
    if(uiStore.dropGroup === 'todo'){
        await Promise.all(_dropItems.value.map((todo) => deleteTodo(todo.id)));
        _dropItems.value = [];
    }
    if(uiStore.dropGroup === 'todogroup'){
        await Promise.all(_dropItems.value.map((group) => deleteTodogroup(group.id)));
        _dropItems.value = [];
    }
    uiStore.dropGroup = void 0;
  }
});

const createdGroup = ref();
watchEffect(() => {
  if(userStore.affairsFilterIDs?.length > 0){
    if(createdGroup.value){
      userStore.affairsFilterIDs.push(createdGroup.value?.id);
      if(!teamStore.init?.todogroups?.map(i => i.id).includes(createdGroup.value?.id)){
        teamStore.init.todogroups.push(createdGroup.value);
      }
    }
    const _all_ids = teamStore.init.todogroups.map(i => i.id);
    userStore.affairsFilterIDs = userStore.affairsFilterIDs.filter(i => _all_ids.includes(i))
    todogroups.value = userStore.affairsFilterIDs.map(i => teamStore.init.todogroups.find(j => j.id === i)).filter(k => k !== null)
    createdGroup.value = null;
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
    uiStore.topPannel = true
    uiStore.dropGroup = 'todogroup'
    uiStore.dragKanbanScrollEnable = false
}

const dragEnd = () => {
    setTimeout(() => {
        uiStore.topPannel = false
    }, 300);
    uiStore.dragKanbanScrollEnable = true
}
const todogroupCreated = (val) => {
  createdGroup.value = val;
  if(userStore.affairsFilterIDs?.length > 0){
    userStore.affairsFilterIDs.push(val.id);
  }
  todogroups.value.push(val);
}
const todogroupDeleted = (_id) => {  
  const index = todogroups.value.findIndex((i) => i.id === _id);
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
