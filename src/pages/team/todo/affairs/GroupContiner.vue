<template>
  <div class="column no-wrap gap-xs radius-xs" :style="`flex: 0 0 ${uiStore.columnWidth}px;width: ${uiStore.columnWidth}px`">
    <div data-no-dragscroll class="column-header row no-wrap items-center q-pt-xs q-px-sm">
        <span class="undrag">{{ group.name }}</span>
        <q-space class="full-height dragBar" />
        <q-btn flat dense size="sm" round icon="mdi-dots-vertical" class="undrag">
            <q-menu class="radius-sm shadow-24" ref="todogroupMenuRef">
                <GroupMenu
                    :group
                    @cancelUpdate="cancelUpdate"
                    @todogroupDeleted="todogroupDeleted"
                />
            </q-menu>
        </q-btn>
    </div>
    <div data-no-dragscroll class="column-footer row no-wrap items-center q-px-xs undrag">
        <q-btn dense flat icon="mdi-plus" size="sm" class="border full-width" @click="toggleCreatetodo()" />
    </div>
    <q-scroll-area class="q-space q-px-xs scroll-container flex-content">
      <VueDraggable v-model="group.todos"
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
        <template v-for="todo in group.todos" :key="todo.id">
          <TodoItem
            v-show="
                (group.hideCompleted && !todo.status) || !group.hideCompleted
            "
            :todo="todo"
            :group="group"
            @todoDeleted="todoDeleted"
          />
        </template>
        <CreateTodo v-if="openCreatetodo"
            class="undrag"
            :group="group"
            @created="created"
            @cancelCreate="cancelCreatetodo"
        />
      </VueDraggable>
        <div v-if="!teamStore.cardDragging"
          data-dragscroll
          class="q-space op-0"
          style="order: 9999;"
          @mouseenter="uiStore.dragKanbanScrollEnable = true"
        >
        </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref, toRefs, nextTick, useTemplateRef } from 'vue'
import {teamStore, uiStore} from 'src/hooks/global/useStore';
import TodoItem from './TodoItem.vue'
import {VueDraggable} from 'vue-draggable-plus'
import CreateTodo from './CreateTodo.vue'
import {
  createTodo,
  createTodogroup,
  deleteTodogroup,
  findCardFeedback,
  findCardFeedbackByShare,
  updateCard,
  updateTodo,
  updateTodogroup,
} from "src/api/strapi/project.js";
import GroupMenu from './GroupMenu.vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['todogroupDeleted']);
const { group } = toRefs(props);
const openCreatetodo = ref(false);
const toggleCreatetodo = () => {
    openCreatetodo.value = !openCreatetodo.value;
}
const cancelCreatetodo = () => {
    openCreatetodo.value = false;
}
const created = (todo) => {
    openCreatetodo.value = false;
    group.value.todos.push(todo);
}

const todo_sort = async () => {
  await nextTick();
  let sort = group.value.todos.map((i) => i.id);
  let params = {
    data: {
      todos: sort,
    },
  };
  let res = await updateTodogroup(group.value.id, params);
  if (res?.data) {
    console.log('set todo sort', res.data);
    
    setTimeout(() => {
        Object.assign(group.value, res.data);
        console.log('group', group.value);
        
    }, 500);

    // teamStore.init.todogroups.find(i => i.id === group.value.id).todos = res.data.todos;
    // group.value.todos = res.data.todos;
    // await nextTick();
    // Object.assign(group.value, res.data);
  }
}

const todogroupMenuRef = useTemplateRef('todogroupMenuRef');
const update_params = ref({
    data: {
        name: null,
    }
});
const updateTodogroupFn = async () => {
  if (!update_params.value.data.name) return;
  let { data } = await updateTodogroup(group.value?.id, update_params.value);
  if (data) {
    Object.assign(group.value, data);
  }
};
const cancelUpdate = () => {
    update_params.value = {
        data: {
            name: null,
        }
    };
    todogroupMenuRef.value?.hide();
}
const todogroupDeleted = async (_id) => {
    emit('todogroupDeleted', _id);
    cancelUpdate();
}

const todoDeleted = (id) => {
    group.value.todos = group.value.todos.filter((i) => i.id !== id);
}

const dragStart = () => {
    uiStore.topPannel = false
    uiStore.dropGroup = 'todo'
    uiStore.dragKanbanScrollEnable = true
}

const dragEnd = () => {
    setTimeout(() => {
        uiStore.topPannel = false
    }, 300);
    uiStore.dragKanbanScrollEnable = true
}
</script>

<style scoped>
</style>