<template>
  <NavigatorContainer>
    <TodoPage
      v-if="teamStore?.init"
      :layout="$q.screen.gt.xs ? 'row' : 'column'"
      class="absolute-full"
      _for="user_todos"
    />
  </NavigatorContainer>
</template>

<script setup>
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import NavigatorContainer from './NavigatorContainer.vue'
import {teamStore} from 'src/hooks/global/useStore';
</script>

<style scoped></style>
