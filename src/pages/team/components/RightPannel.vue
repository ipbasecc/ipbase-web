<template>
    <q-drawer
      v-model="uiStore.projectRightDrawer"
      v-if="uiStore.projectRightDrawer && uiStore.projectRightDrawerContent"
      side="right"
      :width="uiStore.rightDrawerWidth"
      class="border-left"
    >
      <AffairsContainer 
        v-if="
          uiStore.projectRightDrawerContent === 'person_todos' &&
          uiStore.app !== 'affairs'
        "
        :todogroups="teamStore.init?.todogroups"
        :hideToolbar="true"
        _for="personal"
        layout="column"
        class="fit"
      />
      <FlagsContainder
        v-if="uiStore.projectRightDrawerContent === 'flaggeds'"
        :headerless="true"
        class="absolute-full"
      />
      <TalkerContainer
        v-if="uiStore.projectRightDrawerContent === 'talkers'"
        :headerless="true"
        class="absolute-full"
      />
      <AiChat
        v-if="uiStore.projectRightDrawerContent === 'aichat'"
        :pannelMode="true"
        class="absolute-full"
      />
    </q-drawer>
</template>

<script setup>
import { ref } from 'vue'
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
import FlagsContainder from "src/pages/team/chat/FlagsContainder.vue";
import TalkerContainer from 'src/pages/deliver/components/TalkerContainer.vue'
import AiChat from 'src/pages/ai/AiChat.vue'
</script>

<style scoped>
</style>