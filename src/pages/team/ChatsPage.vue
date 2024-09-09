<template>
  <NavigatorContainer>
    <template v-if="!$q.screen.gt.xs">
      <ChatNavigation />
    </template>
    <RouterView v-if="channel_id" />
  </NavigatorContainer>
</template>
  
<script setup>
import {computed} from 'vue';
import NavigatorContainer from './NavigatorContainer.vue'
import {teamStore} from 'src/hooks/global/useStore';
import ChatNavigation from "pages/team/chat/components/ChatNavigation.vue";

const channel_id = computed(() => {
  return teamStore.mm_channel?.id;
});
</script>
  
<style scoped></style>
  