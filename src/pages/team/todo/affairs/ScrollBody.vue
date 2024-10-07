<template>
  <q-scroll-area
    v-dragscroll="{
      target: '.q-scrollarea__container',
      active: uiStore.dragKanbanScrollEnable && $q.screen.gt.sm
    }"
    v-dragscroll:nochilddrag
    v-dragscroll.x="$q.screen.gt.sm"
    v-dragscroll.y="false"
    v-on:dragscrollstart="dragscrollstart"
    v-on:dragscrollmove="draging"
    v-on:dragscrollend="dragscrollend"
    class="absolute-full"
    :class="`${$q.dark.mode ? 'bg-darker' : 'bg-grey-3'} ${uiStore.dragging && 'cursor-grab'}`"
  >
    <slot />
  </q-scroll-area>
</template>

<script setup>
import { ref } from 'vue'
import {teamStore, uiStore, userStore} from 'src/hooks/global/useStore';
const dragscrollstart = () => {
  uiStore.dragging = true;
};
const draging = () => {
  // uiStore.dragging = true
};
const dragscrollend = () => {
  uiStore.dragging = false;
};
</script>

<style scoped>
</style>