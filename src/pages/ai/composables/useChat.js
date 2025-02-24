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
                        model: aiStore.currentModel.id,
                        messages: currentSession.value.messages.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        stream: true,
                        options: {
                            temperature: 0.7
                        }
                    };
                    console.log('Ollama request body:', JSON.stringify(requestBody, null, 2));
                    break;
                case 'anthropic':
                    headers['x-api-key'] = providerConfig.apiKey;
                    requestBody = {
                        model: aiStore.currentModel.id,
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
                        model: aiStore.currentModel.id,
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

            console.log('Sending request to:', endpoint);
            console.log('Request body:', requestBody);

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
                reasoning_content: '',
                timestamp: Date.now()
            }

            currentSession.value.messages.push(assistantMessage)
            
            await nextTick()
            messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
            
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            
            try {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    
                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n').filter(line => line.trim() !== '')
                    
                    for (const line of lines) {
                        try {
                            // 对于Ollama，直接解析NDJSON
                            if (provider === 'ollama') {
                                if (!line.trim()) continue
                                console.log('Raw Ollama response line:', line);
                                const json = JSON.parse(line)
                                console.log('Parsed Ollama JSON:', json);
                                
                                // 获取当前chunk的内容
                                let currentChunk = '';
                                if (json.message?.content) {
                                    currentChunk = json.message.content;
                                } else if (json.response) {
                                    currentChunk = json.response;
                                }
                                
                                // 如果内容为空，跳过
                                if (!currentChunk) continue;

                                // 静态变量用于跟踪think标签状态
                                if (!assistantMessage.thinkMode) {
                                    assistantMessage.thinkMode = false;
                                }

                                // 检查当前chunk中是否包含<think>开始标签
                                if (currentChunk.includes('<think>') && !assistantMessage.thinkMode) {
                                    assistantMessage.thinkMode = true;
                                    const startIndex = currentChunk.indexOf('<think>') + 7;
                                    const thinkContent = currentChunk.slice(startIndex);
                                    if (thinkContent) {
                                        assistantMessage.reasoning_content += thinkContent;
                                    }
                                    console.log('Started think mode, reasoning:', assistantMessage.reasoning_content);
                                    continue;
                                }

                                // 检查当前chunk中是否包含</think>结束标签
                                if (currentChunk.includes('</think>') && assistantMessage.thinkMode) {
                                    const endIndex = currentChunk.indexOf('</think>');
                                    // 添加结束标签前的内容到reasoning_content
                                    const thinkContent = currentChunk.slice(0, endIndex);
                                    if (thinkContent) {
                                        assistantMessage.reasoning_content += thinkContent;
                                    }
                                    assistantMessage.thinkMode = false;
                                    
                                    // 处理结束标签后的内容
                                    const remainingContent = currentChunk.slice(endIndex + 8).trim();
                                    if (remainingContent) {
                                        assistantMessage.content += remainingContent;
                                    }
                                    console.log('Ended think mode, reasoning:', assistantMessage.reasoning_content);
                                    console.log('Remaining content:', remainingContent);
                                }
                                // 如果在think模式中
                                else if (assistantMessage.thinkMode) {
                                    assistantMessage.reasoning_content += currentChunk;
                                    console.log('Added to reasoning:', currentChunk);
                                }
                                // 如果不在think模式中，直接添加到content
                                else {
                                    assistantMessage.content += currentChunk;
                                    console.log('Added to content:', currentChunk);
                                }

                                // 更新消息
                                currentSession.value.messages[currentSession.value.messages.length - 1] = { ...assistantMessage }
                                console.log('Updated assistant message:', {
                                    content: assistantMessage.content,
                                    reasoning_content: assistantMessage.reasoning_content,
                                    thinkMode: assistantMessage.thinkMode
                                });
                                
                                await nextTick()
                                messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
                                continue
                            }
                            
                            // 对于其他供应商，处理SSE格式
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6)
                                if (data === '[DONE]') continue
                                
                                const json = JSON.parse(data)
                                let content = '';
                                let reasoningContent = '';

                                switch (provider) {
                                    case 'anthropic':
                                        content = json.delta?.text || '';
                                        break;
                                    default:
                                        // OpenAI, DeepSeek等
                                        content = json.choices[0]?.delta?.content || '';
                                        reasoningContent = json.choices[0]?.delta?.reasoning_content || '';
                                }
                                
                                if (reasoningContent) {
                                    assistantMessage.reasoning_content += reasoningContent
                                }
                                if (content) {
                                    assistantMessage.content += content
                                }
                                
                                currentSession.value.messages[currentSession.value.messages.length - 1] = { ...assistantMessage }
                                await nextTick()
                                messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
                            }
                        } catch (e) {
                            console.error('Error parsing message:', e, 'Line:', line)
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Request aborted')
                } else {
                    throw error
                }
            } finally {
                reader.releaseLock()
            }
            
            currentSession.value.updatedAt = Date.now()
            saveToStorage()
        } catch (error) {
            console.error('Error:', error)
            // 这里可以添加错误提示
        } finally {
            loading.value = false
            abortController = null
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