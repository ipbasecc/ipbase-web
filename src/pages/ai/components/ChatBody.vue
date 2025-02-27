<template>
    <div class="absolute-full column chat_body">
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

        <!-- 消息列表 -->
        <div class="chat-container">
            <q-scroll-area ref="messageContainer" class="col q-pa-md tiptap" @scroll="saveScrollPosition">
                <q-list class="column items-center">
                    <chat-message v-for="msg in currentSession?.messages" 
                        :key="msg.id" 
                        :message="msg"
                        style="width: 100%; max-width: 960px;"
                    />
                </q-list>
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
        <div class="q-pa-md column items-center">
            <chat-input 
                v-model="inputMessage" 
                :loading="loading"
                style="width: 100%; max-width: 960px;"
                @send="sendMessage" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import ChatModelSelector from './ChatModelSelector.vue'
import { useChat } from '../composables/useChat'
import { useAIStore } from '../../../stores/ai'
import localforage from 'localforage'
defineProps({
    pannelMode: {
        type: Boolean,
        default: false
    }
})

defineEmits(['toggle-drawer', 'config'])

const $q = useQuasar()
const aiStore = useAIStore()

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
    stopGenerating,
    saveScrollPosition,
    loadSession
} = useChat()

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