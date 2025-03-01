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
            icon="cleaning_services"
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
            icon="language"
            :color="localSearchEnabled ? 'primary' : void 0"
            @click="toggleSearch"
          >
            <q-tooltip class="no-padding shadow-24">
              <q-card bordered>
                <q-card-section class="q-pa-sm font-medium">
                  {{ localSearchEnabled ? '已启用网络搜索' : '点击启用网络搜索' }}
                </q-card-section>
              </q-card>
            </q-tooltip>
          </q-btn>
          <q-btn v-if="!loading" flat icon="send" class="border" padding="xs md"
            :color="localMessage.trim() ? 'positive' : void 0"
            :disable="!localMessage.trim()"
            @click="onSend"
          />
          <q-btn v-else flat icon="pause" class="border" padding="xs"
            color="negative"
            @click="onCancel"
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
// 本地搜索状态，用于在没有当前会话时控制搜索状态
const localSearchEnabled = ref(false)

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

// 监听当前会话变化，同步搜索状态
watch(currentSession, (newSession) => {
  if (newSession) {
    // 如果有新会话，将本地搜索状态同步为会话的搜索状态
    localSearchEnabled.value = newSession.searchEnabled || false
  }
}, { immediate: true })

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
  if (!localSearchEnabled.value && !aiStore.searchProvider.tavily.active) {
    $q.notify({
      message: '请先在设置中配置Tavily搜索API',
      color: 'warning',
      icon: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }
  
  if (!localSearchEnabled.value && !aiStore.searchProvider.tavily.apiKey) {
    $q.notify({
      message: '请先在设置中配置Tavily API密钥',
      color: 'warning',
      icon: 'warning',
      position: 'top',
      timeout: 3000
    })
    return
  }
  
  // 检查是否配置了搜索关键词提取模型
  if (!localSearchEnabled.value && !aiStore.searchKeywordModel) {
    $q.notify({
      message: '建议在设置中配置搜索关键词提取模型，以提高搜索结果的相关性',
      color: 'info',
      icon: 'info',
      position: 'top',
      timeout: 5000
    })
  }
  
  // 更新搜索状态
  localSearchEnabled.value = !localSearchEnabled.value
  
  // 如果当前有会话，同时更新会话的搜索状态
  if (currentSession.value?.id) {
    searchEnabled.value = localSearchEnabled.value
  }
}

const onSend = () => {
  if (localMessage.value.trim() && !loading) {
    emit('send', { useSearch: localSearchEnabled.value })
    // 不再自动关闭搜索功能，保持用户的选择
  }
}
const onCancel = () => {
  emit('cancel')
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