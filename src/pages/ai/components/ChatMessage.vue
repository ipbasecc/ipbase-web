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
        <AiStar v-else :width="36" :height="36" :color="$q.dark.mode ? '#EEE' : '#333'" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label caption lines="1">{{ new Date(message.timestamp).toLocaleString() }}</q-item-label>
      <q-item-label>
        <div v-if="!isUser && !message.content && !message.reasoning_content" class="waiting-indicator q-mt-sm">
          <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
          正在思考...
        </div>
        
        <template v-else-if="message.reasoning_content?.length > 2">
          <q-expansion-item
            v-model="thing_expanded"
            label="思考过程："
            dense dense-toggle
            class="border radius-xs overflow-hidden q-mt-sm full-width"
            :header-class="`${thing_expanded ? 'border-bottom' : ''} font-medium font-bold-600`"
          >
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
import AiStar from 'src/pages/team/components/widgets/icons/AiStar.vue'

const thing_expanded = ref(true);

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

// Watch for changes in message content
// When reasoning content exists and formal content appears, collapse the expansion item
watch(() => message.content, (newContent) => {
  if (message.reasoning_content && newContent) {
    thing_expanded.value = false;
  }
}, { immediate: true })

// When a new message with reasoning content arrives, initially expand it
watch(() => message.reasoning_content, (newReasoningContent) => {
  if (newReasoningContent) {
    thing_expanded.value = true;
  }
}, { immediate: true })
console.log('message.reasoning_content', message.reasoning_content);

</script>

<style scoped>
</style>
