<template>
  <VueDraggable v-model="modelValue.todos" v-bind="$attrs"
    data-no-dragscroll
    :animation="300" :delay="50"
    :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
    handle=".dragBar" filter=".undrag" group="todo"
    chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
    class="column no-wrap gap-sm q-py-xs"
    @start="dragStart" @sort="todo_sort" @end="dragEnd"
    @mouseenter="uiStore.dragKanbanScrollEnable = false"
    @mouseleave="uiStore.dragKanbanScrollEnable = true"
  >
    <template v-for="todo in modelValue.todos" :key="todo.id">
      <div v-if="hidecompletedTodo(todo)" class="relative-position hovered-item column no-wrap">
        <TodoItem
          :todo="todo"
          :card
          :group="modelValue"
          :displayType
          :dense
          class="todoItem"
          @todoDeleted="todoDeleted"
        />
        <div v-if="!openCreatetodo && !uiStore.dragging" class="absolute-bottom row q-px-md undrag hover-show transition bg-primary overflow-show" style="height: 1px;">
            <q-space />
            <q-btn color="primary" icon="mdi-plus" round size="0.4rem" style="transform: translateY(-50%);"
              @click="toggleCreatetodo(todo)"
            />
        </div>
      </div>
      <CreateTodo v-if="openCreatetodo && after?.id === todo.id"
          class="undrag"
          :group="modelValue"
          :card
          :after
          @created="created"
          @cancelCreate="cancelCreatetodo"
      />
    </template>
    <CreateTodo v-if="openCreatetodo && !after"
        class="undrag"
        :group="modelValue"
        :card
        @created="created"
        @cancelCreate="cancelCreatetodo"
    />
    <div v-if="!teamStore.cardDragging && $q.screen.gt.sm"
        data-dragscroll
        class="q-space op-0 undrag"
        style="order: 9999;"
        @mouseenter="uiStore.dragKanbanScrollEnable = true"
        @dblclick="toggleCreatetodo()"
        @keydown.esc="toggleCreatetodo()"
    >
    </div>
  </VueDraggable>
</template>

<script setup>
import { ref, toRefs, nextTick, useTemplateRef, computed } from 'vue'
import {teamStore, uiStore} from 'src/hooks/global/useStore';
import TodoItem from './TodoItem.vue'
import CreateTodo from './CreateTodo.vue'
import {VueDraggable} from 'vue-draggable-plus'
import { updateTodogroup } from "src/api/strapi/project.js";
import { useQuasar } from 'quasar';

const { card, displayType, dense, uiOptions } = defineProps({
  card: Object,
  displayType: String,
  dense: Boolean,
  uiOptions: Object
})

const $q = useQuasar();
const modelValue = defineModel();

const hidecompletedTodo = (i) => {
  if(teamStore?.card){
    return (modelValue.value.hideCompleted && !i.status) || !modelValue.value.hideCompleted
  } else {
    const pfrs = uiOptions?.find((item) => item.val === "hidecompletedTodo");
    const _hideCompletedTodo = pfrs?.enable;
  
    return !i.status || !_hideCompletedTodo
  }
};

const dragStart = () => {
  uiStore.dragKanbanScrollEnable = false;
  uiStore.dragging = true;
}
const dragEnd = () => {
  uiStore.dragKanbanScrollEnable = true;
  uiStore.dragging = false;
}
const todo_sort = async () => {
  await nextTick();
  let sort = modelValue.value.todos.map((i) => i.id);
  let params = {
    data: {
      todos: sort,
    },
  };
  if (card) {
    params.props = {
      card_id: card.id,
    };
  }
  let res = await updateTodogroup(modelValue.value.id, params);
  if (res?.data && card) {    
    setTimeout(() => {
        Object.assign(modelValue.value, res.data);        
    }, 500);
  }
}

const openCreatetodo = ref(false);
const after = ref(null);
const toggleCreatetodo = (todo) => {
  if(todo){
    after.value = after.value ? null : todo;
  }
  openCreatetodo.value = !openCreatetodo.value;
}
defineExpose({
    toggleCreatetodo,
})
const cancelCreatetodo = () => {
    openCreatetodo.value = false;
}
const created = (todo) => {
    openCreatetodo.value = false;
    if(!card){
      modelValue.value.todos.push(todo);
    }
}
const todoDeleted = (id) => {
    modelValue.value.todos = modelValue.value.todos.filter((i) => i.id !== id);
}
</script>

<style scoped>
</style>