<template>
    <NavigatorContainer v-if="!pannelMode">
        <template #left_drawer>
            <!-- 左侧会话列表 - 在大屏幕显示 -->
            <div class="full-height column">
                <div class="row no-wrap items-center gap-xs q-pa-sm">
                    <q-btn flat rounded dense no-caps
                        @click="aiStore.listToggler = 'assistants'" padding="xs sm"
                        :class="aiStore.listToggler === 'assistants' ? 'border' : 'border-placeholder'"
                    >
                        <q-icon name="auto_awesome" size="xs" />
                        <span class="q-ml-sm">{{ $t('ai_assistant') }}</span>
                    </q-btn>
                    <q-btn flat rounded dense no-caps
                        @click="aiStore.listToggler = 'topics'" padding="xs sm"
                        :class="aiStore.listToggler === 'topics' ? 'border' : 'border-placeholder'"
                    >
                        <q-icon name="chat" size="xs" />
                        <span class="q-ml-sm">{{ $t('ai_topics') }}</span>
                    </q-btn>
                    <q-space />
                    <q-btn flat rounded dense icon="mdi-plus-circle-outline"
                        :color="$q.dark.mode ? 'grey-5' : 'blue-1'"
                        @click="createNewChat(aiStore.selectedAssistant)"
                    />
                </div>
                <q-separator spaced inset class="op-5" />
                <q-scroll-area class="q-space q-px-md q-py-sm">
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
            <div class="row no-wrap items-center gap-xs q-pa-sm">
                <q-btn flat round dense icon="close" @click="showDrawer = false" class="q-mx-md" />
                <q-btn flat rounded dense no-caps
                    @click="aiStore.listToggler = 'assistants'" padding="sm md"
                    :class="aiStore.listToggler === 'assistants' ? 'border' : 'border-placeholder'"
                >
                    <q-icon name="auto_awesome" />
                    <span class="q-ml-sm">{{ $t('ai_assistant') }}</span>
                </q-btn>
                <q-btn flat rounded dense no-caps
                    @click="aiStore.listToggler = 'topics'" padding="sm md"
                    :class="aiStore.listToggler === 'topics' ? 'border' : 'border-placeholder'"
                >
                    <q-icon name="chat" />
                    <span class="q-ml-sm">{{ $t('ai_topics') }}</span>
                </q-btn>
                <q-space />
                <q-btn flat rounded dense icon="mdi-plus-circle-outline"
                    :color="$q.dark.mode ? 'grey-5' : 'blue-1'"
                    @click="createNewChat(aiStore.selectedAssistant)"
                />
            </div>
            <q-separator spaced inset class="op-5" />
            <q-scroll-area class="q-space q-px-md q-py-sm">
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
    </div>

    <!-- 配置弹框 -->
    <q-dialog v-model="aiStore.showConfig" persistent :maximized="!$q.screen.gt.xs">
        <api-config />
    </q-dialog>
</template>

<script setup>
import { computed, onBeforeMount, watch, nextTick, ref } from 'vue'
import ApiConfig from './components/ApiConfig.vue'
import ChatSessionList from './components/ChatSessionList.vue'
import ChatBody from './components/ChatBody.vue'
import { useChat } from './composables/useChat'
import { useAIStore } from '../../stores/ai'
import { useQuasar } from 'quasar'
import NavigatorContainer from '../team/NavigatorContainer.vue'
import AssistantSelector from './components/AssistantSelector.vue'
import { uiStore } from "src/hooks/global/useStore";

const { pannelMode } = defineProps({
    pannelMode: {
        type: Boolean,
        default: false
    }
})
const $q = useQuasar()
const aiStore = useAIStore()
const { currentSession, createNewChat, loadSession, deleteSession } = useChat();

const sessions = computed(() => aiStore.getSessionsForCurrentAssistant());

// 移动端抽屉显示状态
const showDrawer = ref(false)
const showConfig = ref(false)
// 移动端选择会话的处理函数
const onMobileSessionSelect = (session) => {
    loadSession(session)
    showDrawer.value = false
}
onBeforeMount(() => {
    if(!pannelMode) {
        uiStore.app = 'aichat'
    }
})
</script>