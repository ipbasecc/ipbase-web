<template>
  <q-item :class="{ 'q-pb-lg': !isUser }">
    <!-- 上下文分隔符 -->
    <template v-if="message.isContextDivider">
      <q-item-section class="text-center q-my-md">
        <q-separator>
          <div class="row items-center justify-center q-px-sm">
            <q-icon name="archive" size="xs" class="q-mr-xs" />
            <span class="text-caption">上下文已清空</span>
          </div>
        </q-separator>
      </q-item-section>
    </template>
    
    <!-- 普通消息 -->
    <template v-else>
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
          <!-- 用户消息 -->
          <div v-if="isUser" class="message-text q-mt-sm text-primary font-bold-600 font-larger radius-xs" v-html="formattedContent"></div>
          
          <div class="" v-if="message.status === 'keyword generating'">
            <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
            正在生成关键词...
          </div>
          <div class="" v-if="message.status === 'searching'">
            <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
            {{ message.search.feedback }}
          </div>
          <div class="" v-if="message.status === 'thinking'">
            <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
            正在思考...
          </div>          
          <!-- 搜索结果显示 -->
          <div v-if="message.search" class="q-mt-sm">
            <div v-if="message.search.error" class="text-negative q-mb-md">
              <q-icon name="error" class="q-mr-xs" />
              {{ message.search.error }}
            </div>
            <q-expansion-item v-else-if="message.search.results?.length > 0"
              v-model="searching_expanded"
              dense dense-toggle
              class="border radius-xs overflow-hidden q-mt-sm full-width"
              :class="message.content && !searching_expanded ? 'op-5' : ''"
              expand-icon-class="q-pr-none"
              :header-class="`${searching_expanded ? 'border-bottom' : ''} font-medium font-bold-600`"
            >
              <template #header>
                <div class="row items-center q-space gap-sm">
                  <q-icon name="search" size="1rem" />
                  <span>搜索结果</span>
                  <q-space />
                  <q-chip v-if="message.search.keyword" dense outline color="primary" class="q-ml-sm">
                    {{ message.search.keyword }}
                  </q-chip>
                </div>
              </template>
              <div class="q-pa-md">
                <q-expansion-item
                  v-for="(result, index) in message.search.results"
                  :key="index"
                  :label="index + 1 + '. ' + result.title"
                  header-class="cursor-pointer"
                  dense dense-toggle
                  class="radius-xs overflow-hidden q-mb-xs"
                >
                  <q-card>
                    <q-card-section>
                      <div class="text-body2">{{ result.content }}</div>
                      <div class="text-caption q-mt-sm">
                        <a :href="result.url" target="_blank" @click.stop>{{ result.url }}</a>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </q-expansion-item>
          </div>
          <!-- AI消息 - 等待状态 -->
          <div v-if="!session.searchEnabled && !message.content && message.reasoning_content?.length < 3" class="waiting-indicator q-mt-sm">
            <q-spinner-dots color="primary" size="1em" class="q-mr-sm" />
            正在思考...
          </div>
          
          <!-- 思考过程显示 -->
          <q-expansion-item
            v-if="message.reasoning_content && message.reasoning_content.length > 2"
            v-model="thing_expanded"
            dense dense-toggle
            class="border radius-xs overflow-hidden q-mt-sm full-width"
            :class="message.content && !thing_expanded ? 'op-5' : ''"
            expand-icon-class="q-pr-none"
            icon="psychology"
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
                <q-icon v-else name="psychology" size="1rem" />
                <span>{{ message.content ? '思考过程：' : '正在思考...' }}</span>
              </div>
            </template>
            <div class="op-6 q-pa-md" v-html="formattedReasoning" />
          </q-expansion-item>
          
          <!-- AI回复内容 -->
          <div v-if="message.content" class="message-text q-mt-lg tiptap" v-html="formattedContent" />
        </q-item-label>
      </q-item-section>
    </template>
  </q-item>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import {teamStore} from "src/hooks/global/useStore.js";

const thing_expanded = ref(false);
const searching_expanded = ref(false);

const { message, session } = defineProps(['message', 'session'])
const isUser = computed(() => message.role === 'user')
const UserAvatar = computed(() => teamStore.init?.profile?.avatar?.url || teamStore.init?.wechat_profile?.avatar)
const UsernameFirstChar = computed(() => teamStore.init.username.charAt(0))

const formattedContent = computed(() => {
  let content = message.content || ''
  
  // 移除关键词行
  content = content.replace(/^关键词:\s*.+?\n\n/s, '')
  
  return marked(content)
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
  if(!message.reasoning_content && !message.content && message.search.results?.length > 0) {
    searching_expanded.value = true;
  }
  if(message.reasoning_content || message.content) {
    searching_expanded.value = false;
  }
}, { immediate: true })
</script>

<style scoped>
</style>
