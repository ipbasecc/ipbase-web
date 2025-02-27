<template>
    <NavigatorContainer v-if="!pannelMode">
        <template #left_drawer>
            <!-- 左侧会话列表 - 在大屏幕显示 -->
            <div class="full-height column">
                <div class="row no-wrap items-center gap-xs q-py-sm q-px-xs">
                    <q-btn flat rounded dense icon="mdi-star" :label="$t('ai_assistant')" no-caps
                        @click="aiStore.listToggler = 'assistants'" padding="xs md" :class="aiStore.listToggler === 'assistants' ? 'border' : 'border-placeholder'"
                    />
                    <q-btn flat rounded dense icon="mdi-message-text-outline" :label="$t('ai_topics')" no-caps
                        @click="aiStore.listToggler = 'topics'" padding="xs md" :class="aiStore.listToggler === 'topics' ? 'border' : 'border-placeholder'"
                    />
                    <q-space />
                    <q-btn flat rounded dense icon="mdi-plus-circle-outline"
                        @click="createNewChat(aiStore.selectedAssistant)"
                    />
                </div>
                <q-scroll-area class="q-space q-pa-md">
                    <chat-session-list
                        v-if="aiStore.listToggler === 'topics'"
                        :sessions="sessions"
                        :current-session-id="currentSession?.id"
                        @select="loadSession"
                        @delete="deleteSession"
                    />
                    <assistant-selector v-if="aiStore.listToggler === 'assistants'" />
                </q-scroll-area>
            </div>
        </template>
        <ChatBody :pannelMode="pannelMode" @toggle-drawer="showDrawer = true" @config="showConfig = true" />
    </NavigatorContainer>
    <ChatBody v-else v-bind="$attrs" :pannelMode="pannelMode" @toggle-drawer="showDrawer = true" @config="showConfig = true" />

    <!-- 移动端全屏会话列表 -->
    <div v-if="showDrawer" class="absolute-full" :class="$q.dark.mode ? 'bg-grey-10' : 'bg-grey-3'">
        <div class="column full-height">
            <!-- 顶部操作栏 -->
            <div class="row items-center q-pa-md">
                <q-btn flat round dense icon="close" @click="showDrawer = false" class="q-mr-md" />
            </div>
            
            <!-- 新建对话按钮 -->
            <div class="q-pa-md row">
                <q-item clickable @click="createNewChat(aiStore.selectedAssistant)" class="radius-sm bg-positive">
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
                    :sessions="aiStore.getSessionsForCurrentAssistant()"
                    :current-session-id="currentSession?.id"
                    @select="onMobileSessionSelect"
                    @delete="deleteSession"
                />
            </q-scroll-area>
        </div>
    </div>

    <!-- 配置弹框 -->
    <q-dialog v-model="aiStore.showConfig" persistent :maximized="!$q.screen.gt.xs">
        <api-config />
    </q-dialog>
</template>

<script setup>
import { computed, onMounted, watch, nextTick, ref } from 'vue'
import ApiConfig from './components/ApiConfig.vue'
import ChatSessionList from './components/ChatSessionList.vue'
import ChatBody from './components/ChatBody.vue'
import { useChat } from './composables/useChat'
import { useAIStore } from '../../stores/ai'
import { useQuasar } from 'quasar'
import NavigatorContainer from '../team/NavigatorContainer.vue'
import AssistantSelector from './components/AssistantSelector.vue'

const $q = useQuasar()
const aiStore = useAIStore()
const sessions = computed(() => aiStore.getSessionsForCurrentAssistant())

const { pannelMode } = defineProps(['pannelMode'])

// 移动端抽屉显示状态
const showDrawer = ref(false)
const showConfig = ref(false)
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
    messageContainer,
    createNewChat,
    loadSession,
    deleteSession,
    sendMessage,
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
</script>

<style scoped>
</style>