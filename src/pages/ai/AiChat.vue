<template>
    <div :v-bind="$attrs" class="absolute-full column">
    <q-bar
      class="border-bottom"
      :class="`${
        $q.dark.mode ? 'bg-darker text-white' : 'bg-primary-dark text-grey-1'
      } ${$q.platform.is.electron ? 'q-electron-drag q-pr-none' : ''}`"
      style="height: 2.5rem"
    >
      <div
        class="row no-wrap gap-sm items-center cursor-pointer q-electron-drag--exception"
      >
        <AiStar :color="$q.dark.mode ? 'white' : 'black'" width="18" height="18" />
        AI 对话
      </div>
      <q-space />
      <!-- <q-btn icon="check" dense @click="$q.dark.toggle()" /> -->
      <template v-if="isElectron">
        <section class="full-height row no-wrap items-center" style="padding: 2px">
          <q-btn dense square size="sm" icon="mdi-window-minimize"
            class="full-height" padding="0 12px"
            @click="minimize()"
          />
          <q-btn dense square size="sm" class="full-height" padding="0 12px" @click="toggleMaximize()">
            <WindowToggle v-if="isMax" :color="$q.dark.mode ? 'white' : 'black'" />
            <q-icon v-else name="mdi-window-maximize" />
          </q-btn>
          <q-btn dense square size="sm" icon="close"
            class="full-height" padding="0 12px"
            @mouseenter="hoverClose = true"
            :class="hoverClose ? 'bg-negative' : ''"
            @mouseleave="hoverClose = false"
            @click="closeApp()"
          />
        </section>
      </template>
    </q-bar>
        <div class="row q-space">
            <!-- 左侧会话列表 - 在大屏幕显示 -->
            <div v-if="$q.screen.gt.xs && !pannelMode" class="full-height column border-right" style="flex: 0 0 260px;">
                <div class="q-pa-md row">
                    <q-item clickable @click="createNewChat" class="radius-sm bg-positive">
                        <q-item-section side>
                            <q-icon name="mdi-message-plus" />
                        </q-item-section>
                        <q-item-section>
                            新建对话
                        </q-item-section>
                    </q-item>
                </div>
                <q-scroll-area class="q-space q-pa-md">
                    <chat-session-list
                        :sessions="chatSessions"
                        :current-session-id="currentSession?.id"
                        @select="loadSession"
                        @delete="deleteSession"
                    />
                </q-scroll-area>
            </div>

            <!-- 右侧聊天区域 -->
            <div class="col column">
                <!-- 模型选择器和会话列表按钮 -->
                <div class="q-pa-md row items-center">
                    <q-btn
                        v-if="!$q.screen.gt.xs"
                        flat
                        round
                        dense
                        icon="menu"
                        @click="showDrawer = true"
                        class="q-mr-sm"
                    />
                    <chat-model-selector
                        v-model:selectedProvider="apiConfig.provider"
                        v-model:selectedModel="apiConfig.model"
                        :apiConfig="apiConfig"
                        @config="showConfig = true"
                    />
                </div>

                <!-- 消息列表 -->
                <div class="chat-container">
                    <q-scroll-area ref="messageContainer" class="col q-pa-md tiptap">
                        <chat-message v-for="msg in currentSession?.messages" 
                            :key="msg.id" 
                            :message="msg"
                        />
                    </q-scroll-area>
                    <!-- 停止按钮 -->
                    <div v-if="loading" class="stop-button-container z-fab">
                        <q-btn 
                            color="grey-7"
                            flat
                            round
                            icon="stop"
                            class="stop-button shadow-23"
                            @click="stopGenerating"
                        >
                            <q-tooltip>停止生成</q-tooltip>
                        </q-btn>
                    </div>
                </div>

                <!-- 输入区域 -->
                <div class="q-pa-md">
                    <chat-input 
                    v-model="inputMessage" 
                    :loading="loading"
                    @send="sendMessage" />
                </div>
            </div>
        </div>
    </div>

    <!-- 移动端全屏会话列表 -->
    <div v-if="(!$q.screen.gt.xs || pannelMode) && showDrawer" class="absolute-full" :class="$q.dark.mode ? 'bg-grey-10' : 'bg-grey-3'">
        <div class="column full-height">
            <!-- 顶部操作栏 -->
            <div class="row items-center q-pa-md">
                <q-btn flat round dense icon="close" @click="showDrawer = false" class="q-mr-md" />
                <div class="text-subtitle1">会话列表</div>
            </div>
            
            <!-- 新建对话按钮 -->
            <div class="q-pa-md row">
                <q-item clickable @click="createNewChat" class="radius-sm bg-positive">
                    <q-item-section side>
                        <q-icon name="mdi-message-plus" />
                    </q-item-section>
                    <q-item-section>
                        新建对话
                    </q-item-section>
                </q-item>
            </div>

            <!-- 会话列表 -->
            <q-scroll-area class="q-space q-pa-md">
                <chat-session-list
                    :sessions="chatSessions"
                    :current-session-id="currentSession?.id"
                    @select="onMobileSessionSelect"
                    @delete="deleteSession"
                />
            </q-scroll-area>
        </div>
    </div>

    <!-- 配置弹框 -->
    <q-dialog v-model="showConfig" persistent :maximized="!$q.screen.gt.xs">
      <api-config 
        v-model="apiConfig"
        @save="onConfigSave"
      />
    </q-dialog>
</template>

<script setup>
import { computed, onMounted, watch, nextTick, ref } from 'vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import ApiConfig from './components/ApiConfig.vue'
import ChatModelSelector from './components/ChatModelSelector.vue'
import ChatSessionList from './components/ChatSessionList.vue'
import { useChat } from './composables/useChat'
import { defaultProviders } from './config/apiProviders'
import {useQuasar} from "quasar";
import AiStar from '../team/components/widgets/icons/AiStar.vue'
const $q = useQuasar();

const { pannelMode } = defineProps(['pannelMode'])

// 移动端抽屉显示状态
const showDrawer = ref(false)

// 移动端选择会话的处理函数
const onMobileSessionSelect = (session) => {
    loadSession(session)
    showDrawer.value = false
}

const {
    chatSessions,
    currentSession,
    inputMessage,
    loading,
    showConfig,
    messageContainer,
    apiConfig,
    createNewChat,
    loadSession,
    deleteSession,
    sendMessage,
    onConfigSave,
    loadConfig,
    stopGenerating
} = useChat()

// 滚动到底部的函数
const scrollToBottom = () => {
    nextTick(() => {
        setTimeout(() => {
            if (messageContainer.value) {
                const scrollArea = messageContainer.value
                const scrollSize = scrollArea.getScroll().verticalSize
                scrollArea.setScrollPosition('vertical', scrollSize)
            }
        }, 100) // 给一个小的延时确保内容已渲染
    })
}

// 监听消息变化
watch(
    () => currentSession.value?.messages,
    (newMessages) => {
        if (newMessages?.length > 0) {
            scrollToBottom()
        }
    },
    { deep: true }
)

// 监听会话切换
watch(
    () => currentSession.value?.id,
    (newId, oldId) => {
        if (newId !== oldId && currentSession.value?.messages?.length > 0) {
            scrollToBottom()
        }
    }
)

// 获取可用的供应商列表
const availableProviders = computed(() => {
    return defaultProviders.filter(provider => {
        const config = apiConfig.value[provider.id]
        return config && config.active
    })
})

// 当前选中的供应商
const selectedProvider = computed({
    get: () => {
        return defaultProviders.find(p => p.id === apiConfig.value.provider)
    },
    set: (provider) => {
        if (provider) {
            const config = apiConfig.value[provider.id]
            apiConfig.value = {
                ...apiConfig.value,
                provider: provider.id,
                endpoint: config.endpoint,
                apiKey: config.apiKey,
                model: config.models[0]
            }
        }
    }
})

// 当前供应商可用的模型列表
const availableModels = computed(() => {
    if (!selectedProvider.value) return []
    const config = apiConfig.value[selectedProvider.value.id]
    return defaultProviders
        .find(p => p.id === selectedProvider.value.id)
        ?.models.filter(m => config.models.includes(m.id)) || []
})

// 当前选中的模型
const selectedModel = computed({
    get: () => apiConfig.value.model,
    set: (modelId) => {
        if (modelId) {
            apiConfig.value.model = modelId
        }
    }
})

onMounted(() => {
    loadConfig()
})

const isElectron = computed(() => $q.platform.is.electron);
const isMax = ref(false);
onMounted(async () => {
  await nextTick();
  if (isElectron.value) {
    isMax.value = window.windowAPI?.isMaximized();
  }
});
function minimize() {
  if (isElectron.value) {
    window.windowAPI?.minimize();
  }
}

function toggleMaximize() {
  if (isElectron.value) {
    window.windowAPI?.toggleMaximize(isMax.value);
    isMax.value = !isMax.value;
  }
}

const hoverClose = ref(false);
function closeApp() {
  if (isElectron.value) {
    window.windowAPI?.close();
  }
}
</script>

<style scoped>
.q-page {
  max-height: 100vh;
  overflow: hidden;
}

.chat-container {
  position: relative;
  flex: 1;
  display: flex;
}

.stop-button-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
}

.stop-button {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>