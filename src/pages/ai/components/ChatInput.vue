<template>
  <q-item>
    <q-item-section avatar />
    <q-item-section class="border q-pa-sm radius-sm">
      <div class="column no-wrap gap-xs">
        <q-input
          v-model="localMessage"
          type="text"
          autogrow
          dense
          borderless
          :disable="loading"
          placeholder="输入消息..."
          :rows="3"
          input-class="q-px-sm"
          @keypress.enter.prevent="onEnter"
          hide-bottom-space
        />
        <div class="row no-wrap items-center gap-sm">
          <q-btn flat dense round icon="mdi-plus-circle" @click="aiStore.createNewChat()">
            <q-tooltip class="no-padding shadow-24">
              <q-card bordered>
                <q-card-section class="q-pa-sm font-medium">
                  新建会话
                </q-card-section>
              </q-card>
            </q-tooltip>
          </q-btn>
          <q-btn flat dense round
            icon="mdi-message-bulleted-off"
            @click="clearChat"
          >
            <q-tooltip class="no-padding shadow-24">
              <q-card bordered>
                <q-card-section class="q-pa-sm font-medium">
                  清空对话
                </q-card-section>
              </q-card>
            </q-tooltip>
          </q-btn>
          <q-btn flat dense round
            icon="remove_road"
            @click="archiveChat"
          >
            <q-tooltip class="no-padding shadow-24">
              <q-card bordered>
                <q-card-section class="q-pa-sm font-medium">
                  清空上下文（归档当前消息）
                </q-card-section>
              </q-card>
            </q-tooltip>
          </q-btn>
          <q-space />
          <q-btn flat padding="xs" round
            :icon="searchEnabled ? 'search' : 'search_off'"
            :color="searchEnabled ? 'primary' : void 0"
            @click="toggleSearch"
          >
            <q-tooltip class="no-padding shadow-24">
              <q-card bordered>
                <q-card-section class="q-pa-sm font-medium">
                  {{ searchEnabled ? '已启用网络搜索' : '点击启用网络搜索' }}
                </q-card-section>
              </q-card>
            </q-tooltip>
          </q-btn>
          <q-btn flat icon="send" class="border" padding="xs md"
            :color="localMessage.trim() ? 'positive' : void 0"
            :loading="loading"
            :disable="!localMessage.trim()"
            @click="onSend"
          />
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAIStore } from 'src/stores/ai'
import { useQuasar } from 'quasar'

const { modelValue, loading, sessionId } = defineProps(['modelValue', 'loading', 'sessionId'])
const emit = defineEmits(['update:modelValue', 'send'])
const aiStore = useAIStore()
const $q = useQuasar()
const localMessage = ref(modelValue)

// 从当前会话中获取搜索状态
const currentSession = computed(() => {
  if (sessionId) {
    return aiStore.chatSessions.find(s => s.id === sessionId) || null
  }
  return aiStore.currentSession
})

// 使用计算属性获取和设置搜索状态
const searchEnabled = computed({
  get: () => currentSession.value?.searchEnabled || false,
  set: (value) => {
    if (currentSession.value?.id) {
      aiStore.updateSessionSearchEnabled(currentSession.value.id, value)
    }
  }
})

// 清空当前对话
const clearChat = () => {
  if (!currentSession.value?.id) return
  
  $q.dialog({
    title: '确认清空',
    message: '确定要清空当前对话内容吗？这将删除所有消息，但保留对话标题。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    aiStore.clearSessionMessages(currentSession.value.id)
  })
}

// 归档当前对话（清空上下文）
const archiveChat = () => {
  if (!currentSession.value?.id) return
  if (!currentSession.value?.messages?.length) {
    $q.notify({
      message: '当前没有消息可归档',
      color: 'warning',
      icon: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }
  
  $q.dialog({
    title: '确认清空上下文',
    message: '确定要清空当前上下文吗？这将归档当前所有消息，并开始一个新的对话上下文，但保留对话标题。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    aiStore.archiveSessionMessages(currentSession.value.id)
  })
}

watch(() => modelValue, (newVal) => {
  localMessage.value = newVal
})

const toggleSearch = () => {
  // 检查是否配置了Tavily API
  if (!searchEnabled.value && !aiStore.searchProvider.tavily.active) {
    $q.notify({
      message: '请先在设置中配置Tavily搜索API',
      color: 'warning',
      icon: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }
  
  if (!searchEnabled.value && !aiStore.searchProvider.tavily.apiKey) {
    $q.notify({
      message: '请先在设置中配置Tavily API密钥',
      color: 'warning',
      icon: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }
  
  // 更新搜索状态
  searchEnabled.value = !searchEnabled.value
}

const onSend = () => {
  if (localMessage.value.trim() && !loading) {
    emit('send', { useSearch: searchEnabled.value })
    // 不再自动关闭搜索功能，保持用户的选择
  }
}

const onEnter = (e) => {
  if (e.shiftKey) {
    return
  }
  onSend()
}

watch(localMessage, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>