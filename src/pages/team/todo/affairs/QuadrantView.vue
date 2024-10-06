<template>
    <div class="absolute-full op-5">
        <QuadrantBackgroud />
    </div>
    <QuadrantChart
        v-if="mainArea"
        v-bind="$attrs"
        :id="teamStore.init?.id"
        :axisData
        :card
        :taskContainerSIze="mainArea"
        :auth
        splitLineColor="#aaaaaa25"
        by="todo"
        @itemChanged="itemChanged"
    />
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import { todogroups, useChartData } from './useAffairs';
import { teamStore, uiStore } from 'src/hooks/global/useStore';
import {updateTodo} from "src/api/strapi/project.js";
import { authCollections } from "./useAffairs.js";
import { useAuths } from 'src/pages/team/hooks/useAuths.js';

const { mainArea, card } = defineProps({
    mainArea: Object,
    card: Object
})

const auth = computed(() => {
    let auth = {}
    if(uiStore.app === 'affairs'){
        auth = {
            read: true,
            modify: true,
            delete: true,
        }
    } else {
        auth = {
            read: useAuths('read', ['card_todo']),
            modify: useAuths('modify', ['card_todo']),
            delete: useAuths('delete', ['card_todo']),
        }
    }
    return auth
})

const axisData = ref();
watchEffect(() => {
    axisData.value = useChartData(card.todogroups || todogroups.value)
})

const updateQuery = ref([]);
const itemChanged = (todo_id, params) => {
    updateQuery.value.push({ todo_id, params });
}

const updateTodoFn = async (item) => {
  if(card){

  }
  let res = await updateTodo(item.todo_id, item.params);

  if (res?.data) {
    todogroups.value = todogroups.value.map(group => {
      return {
        ...group,
        todos: group.todos?.map(todo => {
            if (todo.id === res.data.id) {
                return res.data;
            }
            return todo;
      })
    }});
  }
};

watchEffect(() => {
    if(updateQuery.value.length > 0) {
        updateQuery.value.map(async(item) => {
            await updateTodoFn(item);
            const index = updateQuery.value.findIndex(i => i.id === item.id);
            if(index > -1){
                updateQuery.value.splice(index, 1);
            }
        })
    }
})
</script>

<style scoped>
</style>