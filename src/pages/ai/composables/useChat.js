import { ref, nextTick } from 'vue'
import { uid } from 'quasar'
import { useAIStore } from '../../../stores/ai'

export function useChat() {
    const chatSessions = ref([])
    const currentSession = ref(null)
    const inputMessage = ref('')
    const loading = ref(false)
    const messageContainer = ref(null)
    let abortController = null
    const aiStore = useAIStore()

    // 从localStorage加载配置
    const loadConfig = () => {
        const savedSessions = localStorage.getItem('aiChatSessions')
        if (savedSessions) {
            chatSessions.value = JSON.parse(savedSessions)
            if (chatSessions.value.length > 0) {
                currentSession.value = chatSessions.value[0]
            }
        }
    }

    // 初始化时加载配置
    loadConfig()

    // 保存配置和会话到localStorage
    const saveToStorage = () => {
        localStorage.setItem('aiChatSessions', JSON.stringify(chatSessions.value))
    }

    // 创建新会话
    const createNewChat = () => {
        const newSession = {
            id: uid(),
            title: '新对话',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        chatSessions.value.unshift(newSession)
        currentSession.value = newSession
        saveToStorage()
    }

    // 加载会话
    const loadSession = (session) => {
        currentSession.value = session
    }

    // 删除会话
    const deleteSession = (session) => {
        const index = chatSessions.value.findIndex(s => s.id === session.id)
        if (index > -1) {
            chatSessions.value.splice(index, 1)
            if (currentSession.value?.id === session.id) {
                currentSession.value = chatSessions.value[0] || null
            }
            saveToStorage()
        }
    }

    // 停止生成
    const stopGenerating = () => {
        if (abortController) {
            abortController.abort()
            abortController = null
            loading.value = false
        }
    }

    // 发送消息
    const sendMessage = async () => {
        if (!inputMessage.value.trim() || loading.value) return
        
        if (!currentSession.value) {
            createNewChat()
        }

        const userMessage = {
            id: uid(),
            role: 'user',
            content: inputMessage.value,
            timestamp: Date.now()
        }

        currentSession.value.messages.push(userMessage)
        currentSession.value.updatedAt = Date.now()
        
        if (currentSession.value.messages.length === 1) {
            currentSession.value.title = inputMessage.value.slice(0, 12) + '...'
        }

        inputMessage.value = ''
        loading.value = true

        try {
            const provider = aiStore.provider
            if (!provider) {
                throw new Error('No provider selected')
            }

            const providerConfig = aiStore.providers[provider]
            if (!providerConfig || !providerConfig.endpoint) {
                throw new Error('Provider not configured')
            }

            // 创建新的 AbortController
            abortController = new AbortController()

            let requestBody;
            let headers = {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            };

            // 根据不同的供应商构建不同的请求
            switch (provider) {
                case 'ollama':
                    headers = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/x-ndjson'
                    };
                    requestBody = {
                        model: aiStore.model,
                        messages: currentSession.value.messages.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        stream: true,
                        options: {
                            temperature: 0.7
                        }
                    };
                    break;
                case 'anthropic':
                    headers['x-api-key'] = providerConfig.apiKey;
                    requestBody = {
                        model: aiStore.model,
                        messages: currentSession.value.messages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        stream: true
                    };
                    break;
                default:
                    headers['Authorization'] = 'Bearer ' + providerConfig.apiKey;
                    requestBody = {
                        model: aiStore.model,
                        messages: currentSession.value.messages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        stream: true
                    };
            }

            const endpoint = provider === 'ollama' 
                ? `${providerConfig.endpoint.replace(/\/$/, '')}/api/chat`
                : providerConfig.endpoint;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: abortController.signal
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const assistantMessage = {
                id: uid(),
                role: 'assistant',
                content: '',
                timestamp: Date.now()
            }

            currentSession.value.messages.push(assistantMessage)
            
            await nextTick()
            messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
            
            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const text = decoder.decode(value)
                const lines = text.split('\n')

                for (const line of lines) {
                    if (!line.trim()) continue

                    try {
                        const data = JSON.parse(line)
                        if (data.done) continue

                        // 处理不同供应商的响应格式
                        switch (provider) {
                            case 'ollama':
                                if (data.message?.content) {
                                    assistantMessage.content = data.message.content
                                }
                                break;
                            case 'anthropic':
                                if (data.delta?.text) {
                                    assistantMessage.content += data.delta.text
                                }
                                break;
                            default:
                                if (data.choices?.[0]?.delta?.content) {
                                    assistantMessage.content += data.choices[0].delta.content
                                }
                        }

                        await nextTick()
                        messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
                    } catch (e) {
                        console.error('Error parsing line:', e)
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error)
            // 这里可以添加错误提示
        } finally {
            loading.value = false
            abortController = null
            saveToStorage()
        }
    }

    return {
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
    }
} 