import { ref, nextTick, computed, watch } from 'vue'
import { uid } from 'quasar'
import { useAIStore } from '../../../stores/ai'
import localforage from 'localforage';

// Debounce function to limit how often a function can be called
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

export function useChat() {
    const inputMessage = ref('')
    const loading = ref(false)
    const messageContainer = ref(null)
    let abortController = null
    const aiStore = useAIStore()

    // Initialize the debounce function for saving scroll position
    const saveScrollPosition = debounce(async () => {
        if (currentSession.value) {
            const position = messageContainer.value.getScroll().verticalPosition; // Get the current scroll position
            aiStore.scrollPosition[currentSession.value.id] = position; // Save to Pinia
            // console.log('saveScrollPosition', aiStore.scrollPosition);
        }
    }, 100); // Adjust the delay as needed

    // 初始化时加载配置
    aiStore.initChatSessions()

    // 计算属性：从store获取会话列表和当前会话
    const chatSessions = computed(() => aiStore.chatSessions)
    const currentSession = computed(() => aiStore.currentSession)

    // 创建新会话
    const createNewChat = () => {
        aiStore.createNewChat()
    }

    // 加载会话
    const loadSession = async (session) => {
        await aiStore.loadSession(session)
        // Restore scroll position
        nextTick(() => {
            const savedPosition = aiStore.scrollPosition[session.id]; // Get from Pinia
            if (savedPosition !== undefined) {
                messageContainer.value.setScrollPosition('vertical', savedPosition, 300);
            } else {
                messageContainer.value.setScrollPosition('vertical', messageContainer.value.getScroll().verticalSize);
            }
        })
    }

    // 删除会话
    const deleteSession = (session) => {
        aiStore.deleteSession(session)
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

        // 添加用户消息到当前会话
        aiStore.addMessageToCurrentSession(userMessage)
        
        // 如果是第一条消息，使用前10个字符作为会话标题
        if (currentSession.value.messages.length === 1) {
            const session = aiStore.chatSessions.find(s => s.id === currentSession.value.id)
            if (session) {
                // 提取用户输入的前10个字符作为会话标题
                currentSession.value.title = inputMessage.value.slice(0, 10)
                session.title = currentSession.value.title
                aiStore.saveChatSessions()
            }
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
                    break;
                case 'anthropic':
                    headers['x-api-key'] = providerConfig.apiKey;
                    requestBody = {
                        model: aiStore.currentModel.id,
                        messages: currentSession.value.messages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })).slice(-20), // Anthropic模型限制上下文数量
                        stream: true
                    };
                    break;
                default:
                    // OpenAI, DeepSeek等
                    headers['Authorization'] = 'Bearer ' + providerConfig.apiKey;
                    const contextLimit = 4096; // 默认上下文长度限制
                    let totalLength = 0;
                    const messages = [];
                    
                    // 从最新的消息开始，累计计算token长度（这里用字符长度简单估算）
                    for (let i = currentSession.value.messages.length - 1; i >= 0; i--) {
                        const msg = currentSession.value.messages[i];
                        const estimatedTokens = (msg.content.length + msg.reasoning_content?.length || 0) / 4;
                        if (totalLength + estimatedTokens > contextLimit) {
                            break;
                        }
                        totalLength += estimatedTokens;
                        messages.unshift({
                            role: msg.role,
                            content: msg.content
                        });
                    }
                    
                    requestBody = {
                        model: aiStore.currentModel.id,
                        messages: messages,
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

            // 添加AI消息到当前会话
            aiStore.addMessageToCurrentSession(assistantMessage)
            
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
                                const updatedMessages = [...currentSession.value.messages]
                                updatedMessages[updatedMessages.length - 1] = { ...assistantMessage }
                                aiStore.updateSessionMessages(currentSession.value.id, updatedMessages)
                                
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
                                
                                // 更新消息
                                const updatedMessages = [...currentSession.value.messages]
                                updatedMessages[updatedMessages.length - 1] = { ...assistantMessage }
                                aiStore.updateSessionMessages(currentSession.value.id, updatedMessages)
                                
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
            
            aiStore.saveChatSessions()
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
        stopGenerating,
        saveScrollPosition // Expose the saveScrollPosition method
    }
} 