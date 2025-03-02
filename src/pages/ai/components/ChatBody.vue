<template>
    <div class="absolute-full column chat_body" :class="!currentModel ? 'flex-center' : ''">
        <!-- 模型选择器和会话列表按钮 -->
        <div class="q-pa-md row items-center">
            <q-btn
                v-if="!$q.screen.gt.xs || pannelMode"
                flat
                round
                dense
                icon="menu"
                @click="$emit('toggle-drawer')"
                class="q-mr-sm"
            />
            <chat-model-selector />
        </div>

        <template v-if="currentModel">
            <!-- 消息列表 -->
            <div v-if="currentSession?.messages?.length > 0" class="chat-container">
                <q-scroll-area ref="messageContainer" class="col q-pa-md tiptap" @scroll="saveScrollPosition">
                    <q-list class="column items-center">
                        <!-- 所有消息，根据archived属性应用不同样式 -->
                        <chat-message v-for="msg in currentSession?.messages" 
                            :key="msg.id" 
                            :message="msg"
                            :loading="loading"
                            :session="currentSession"
                            style="width: 100%; max-width: 960px;"
                            :class="{ 'op-5': msg.archived }"
                        />
                    </q-list>
                </q-scroll-area>
            </div>

            <!-- 输入区域 -->
            <div class="q-px-md q-pb-md column" :class="currentSession?.messages?.length > 0 ? 'items-center' : 'q-space flex-center'">
                <chat-input 
                    v-model="inputMessage" 
                    :loading="loading"
                    :session-id="currentSession?.id"
                    style="width: 100%; max-width: 960px;"
                    @cancel="cancelResponse"
                    @send="handleSendMessage"
                />
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import ChatModelSelector from './ChatModelSelector.vue'
import { useChat } from '../composables/useChat'
import localforage from 'localforage'

import { aiStore } from "src/hooks/global/useStore";

defineProps({
    pannelMode: {
        type: Boolean,
        default: false
    }
})

defineEmits(['toggle-drawer', 'config'])
const availableProviders = computed(() => aiStore.availableProviders)
const availableModels = computed(() => aiStore.availableModels)
const currentProvider = computed(() => aiStore.currentProvider)
const currentModel = computed(() => aiStore.currentModel)

const $q = useQuasar()

const cache = ref()
const getCache = async () => {
    cache.value = await localforage.getItem('ai')
}
const {
    currentSession,
    inputMessage,
    loading,
    messageContainer,
    sendMessage,
    cancelResponse,
    saveScrollPosition,
    loadSession
} = useChat()

// 处理发送消息，支持搜索参数
const handleSendMessage = (options) => {
    sendMessage(options)
}

// Add debugging information to check if loadSession is called
onMounted(async() => {
    if (currentSession.value) {
        // console.log('Current session on mount:', currentSession.value);
        loadSession(currentSession.value);
    } else {
        console.log('No current session to load.');
    }
    await getCache()
});
</script>

<style scoped>
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