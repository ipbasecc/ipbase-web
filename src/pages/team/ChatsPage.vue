<template>
  <NavigatorContainer>
    <RouterView v-if="channel_id" />
  </NavigatorContainer>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import NavigatorContainer from './NavigatorContainer.vue'
import { teamStore } from 'src/hooks/global/useStore';

const channel_id = computed(() => {
  return teamStore.mm_channel?.id;
});
</script>
  
<style scoped></style>
  