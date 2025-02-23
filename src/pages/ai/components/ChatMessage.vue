<template>
  <div class="chat-message q-mb-md" :class="{ 'user-message': isUser }">
    <div class="row no-wrap items-start">
      <q-avatar :color="isUser ? 'primary' : 'secondary'" text-color="white" size="40px">
        {{ isUser ? 'U' : 'AI' }}
      </q-avatar>
      
      <div class="message-content q-ml-md">
        <div class="text-caption text-grey">
          {{ new Date(message.timestamp).toLocaleString() }}
        </div>
        <div v-if="!isUser && !message.content && !message.reasoning_content" class="waiting-indicator q-mt-sm">
          <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
          正在思考...
        </div>
        <template v-else-if="message.reasoning_content">
          <q-expansion-item
            v-model="thing_expanded"
            label="思考过程："
            dense dense-toggle
            expand-icon-toggle
            switch-toggle-side
            class="border-left"
            :class="thing_expanded ? 'full-width' : ''"
          >
            <div class="op-6 q-pa-md" v-html="formattedReasoning"></div>
          </q-expansion-item>
          <div v-if="message.content" class="message-text q-mt-lg tiptap" v-html="formattedContent"></div>
        </template>
        <div v-else class="message-text q-mt-sm" :class="{ 'text-primary font-bold-600 font-larger radius-xs': isUser }" v-html="formattedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'

const thing_expanded = ref(true);

const { message } = defineProps(['message'])
const isUser = computed(() => message.role === 'user')

const formattedContent = computed(() => {
  return marked(message.content || '')
})

const formattedReasoning = computed(() => {
  return marked(message.reasoning_content || '')
})

</script>

<style scoped>
</style>
