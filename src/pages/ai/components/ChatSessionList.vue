<template>
    <q-list class="column gap-xs">
        <template v-for="(group, index) in groupedSessions" :key="group.id">
            <template v-if="group.sessions.length > 0">
                <q-item-label v-if="index !== 0" class="q-mb-xs op-5">{{ group.title }}</q-item-label>
                <template v-if="group.sessions.length > 0">
                    <ChatSessionItem 
                        v-for="session in group.sessions" 
                        :key="session.id" 
                        :session="session" 
                        :currentSessionId="currentSessionId" 
                        @select="emit('select', session)"
                        @save-title="saveSessionTitle"
                        @delete="deleteSession"
                    />
                </template>
            </template>
        </template>
    </q-list>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAIStore } from '../../../stores/ai'
import ChatSessionItem from './ChatSessionItem.vue'
import { uid } from 'quasar'

const { sessions, currentSessionId } = defineProps({
    sessions: {
        type: Array,
        default: [],
        required: true
    },
    currentSessionId: {
        type: String,
        default: null
    }
})
const aiStore = useAIStore()
const sessionTitle = ref('')
const menuModels = reactive({}) // 使用对象来存储每个会话的菜单状态

// 保存会话标题
const saveSessionTitle = (session) => {
    if (!sessionTitle.value.trim() || sessionTitle.value === session.title) return
    
    // 直接更新会话标题
    const sessionIndex = aiStore.chatSessions.findIndex(s => s.id === session.id)
    if (sessionIndex > -1) {
        // 更新会话列表中的标题
        aiStore.chatSessions[sessionIndex].title = sessionTitle.value
        aiStore.chatSessions[sessionIndex].updatedAt = Date.now()
        
        // 如果是当前会话，也更新当前会话的标题
        if (aiStore.currentSession?.id === session.id) {
            aiStore.currentSession.title = sessionTitle.value
        }
    }
    
    // 关闭菜单
    menuModels[session.id] = false
}

// 删除会话
const deleteSession = (session) => {
    // 触发delete事件，由父组件处理删除逻辑
    emit('delete', session)
    
    // 关闭菜单
    menuModels[session.id] = false
}

// 分组会话
const groupedSessions = computed(() => {
    const now = Date.now();
    const recentSessions = {
        id: uid(),
        sessions: [],
        title: '最近'
    };
    const weekAgoSessions = {
        id: uid(),
        sessions: [],
        title: '7天前'
    };
    const monthAgoSessions = {
        id: uid(),
        sessions: [],
        title: '30天前'
    }
    sessions.forEach(session => {
        const createdAt = new Date(session.createdAt);
        const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            recentSessions.sessions.push(session);
        } else if (diffDays <= 30) {
            weekAgoSessions.sessions.push(session);
        } else {
            monthAgoSessions.sessions.push(session);
        }
    });

    return [
        recentSessions,
        weekAgoSessions,
        monthAgoSessions
    ];
});


const emit = defineEmits(['select', 'delete'])
</script>