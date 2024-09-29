<template>
    <QuadrantBackgroud />
    <QuadrantChart
        v-if="mainArea"
        v-bind="$attrs"
        :id="teamStore.init?.id"
        :axisData
        :taskContainerSIze="mainArea"
        :auth="{
            read: true,
            modify: true,
            delete: true,
        }"
        by="todo"
        @itemChanged="itemChanged"
    />
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import { todogroups, useChartData } from './useAffairs';
import { teamStore } from 'src/hooks/global/useStore';
import {updateTodo} from "src/api/strapi/project.js";

const { mainArea } = defineProps(['mainArea']);

const axisData = ref();
watchEffect(() => {
    axisData.value = useChartData(todogroups.value)
})

const updateQuery = ref([]);
const itemChanged = (todo_id, params) => {
    updateQuery.value.push({ todo_id, params });
}

const updateTodoFn = async (item) => {
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
        updateQuery.value.map(item => {
            updateTodoFn(item)
        })
    }
})
</script>

<style scoped>
</style>