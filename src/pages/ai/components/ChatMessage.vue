<template>
  <q-item :class="{ 'q-pb-lg': !isUser }">
    <q-item-section top avatar>
      <q-avatar :square="!isUser" :color="isUser ? 'primary' : void 0" text-color="white" size="40px">
        <template v-if="isUser">
          <q-img v-if="UserAvatar"
            :src="UserAvatar"
            :ratio="1"
            spinner-color="primary"
            spinner-size="22px"
          />
          <span v-else>{{ UsernameFirstChar || 'U' }}</span>
        </template>
        <q-icon name="auto_awesome" size="32px" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label caption lines="1">{{ new Date(message.timestamp).toLocaleString() }}</q-item-label>
      <q-item-label>
        <div v-if="!isUser && message.content?.length < 1 && message.reasoning_content?.length < 3" class="waiting-indicator q-mt-sm">
          <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
          正在思考...
        </div>
        
        <template v-else-if="message.reasoning_content?.length > 2">
          <q-expansion-item
            v-model="thing_expanded"
            dense dense-toggle
            class="border radius-xs overflow-hidden q-mt-sm full-width"
            :class="message.content && !thing_expanded ? 'op-5' : ''"
            expand-icon-class="q-pr-none"
            :header-class="`${thing_expanded ? 'border-bottom' : ''} font-medium font-bold-600`"
          >
            <template #header>
              <div class="row items-center q-space gap-sm">
                <q-spinner-orbit
                  v-if="!message.content"
                  color="primary"
                  size="1rem"
                  :thickness="5"
                />
                <span>{{ message.content ? '思考过程：' : '正在思考...' }}</span>
              </div>
            </template>
            <div class="op-6 q-pa-md" v-html="formattedReasoning" />
          </q-expansion-item>
          <div v-if="message.content" class="message-text q-mt-lg tiptap" v-html="formattedContent" />
        </template>
        <div v-else class="message-text q-mt-sm" :class="{ 'text-primary font-bold-600 font-larger radius-xs': isUser }" v-html="formattedContent" />
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import {teamStore} from "src/hooks/global/useStore.js";

const thing_expanded = ref(false);

const { message } = defineProps(['message'])
const isUser = computed(() => message.role === 'user')
const UserAvatar = computed(() => teamStore.init?.profile?.avatar?.url || teamStore.init?.wechat_profile?.avatar)
const UsernameFirstChar = computed(() => teamStore.init.username.charAt(0))

const formattedContent = computed(() => {
  return marked(message.content || '')
})

const formattedReasoning = computed(() => {
  return marked(message.reasoning_content || '')
})

watch(() => message, () => {
  if (message.reasoning_content && !message.content) {
    thing_expanded.value = true;
  }
  if (message.reasoning_content && message.content) {
    thing_expanded.value = false;
  }
}, { immediate: true })


</script>

<style scoped>
</style>
