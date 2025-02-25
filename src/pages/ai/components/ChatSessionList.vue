<template>
    <q-list class="column gap-xs">
        <q-item v-for="session in sessions" 
                :key="session.id" 
                clickable 
                @click="emit('select', session)"
                v-ripple
                class="hovered-item radius-xs"
                :class="currentSessionId === session.id ? 'active-listitem border' : 'border-placeholder'">
            <q-item-section>
                <q-item-label lines="1">{{ session.title }}</q-item-label>
            </q-item-section>
            <q-item-section side class="hover-show">
                <q-btn dense flat round size="sm" icon="more_vert">
                    <q-menu v-model="menuModels[session.id]" class="no-padding radius-sm shaodw-24" @show="onMenuShow(session)">
                        <q-list bordered dense class="q-pa-xs radius-sm column gap-xs">
                            <q-item class="no-padding radius-xs overflow-hidden">
                                <q-input v-model="sessionTitle" dense filled square type="text" @keyup.enter="saveSessionTitle(session)">
                                    <template #append>
                                        <q-btn dense round flat size="sm" icon="check"
                                            :disable="!sessionTitle.trim() || sessionTitle === session.title"
                                            @click="saveSessionTitle(session)" />
                                    </template>
                                </q-input>
                            </q-item>
                            <q-item clickable @click="deleteSession(session)" class="radius-xs">
                                <q-item-section>
                                    <q-item-label>删除</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAIStore } from '../../../stores/ai'

const aiStore = useAIStore()
const sessionTitle = ref('')
const menuModels = reactive({}) // 使用对象来存储每个会话的菜单状态

// 菜单显示时的处理函数
const onMenuShow = (session) => {
    sessionTitle.value = session.title
}

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
        
        // 保存更新后的会话
        aiStore.saveChatSessions()
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

defineProps({
    sessions: {
        type: Array,
        required: true
    },
    currentSessionId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select', 'delete'])
</script>