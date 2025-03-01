import { ref, nextTick, computed, watch } from 'vue'
import { uid } from 'quasar'
import { useAIStore } from '../../../stores/ai'

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
    let searchAbortController = null // 添加搜索请求的 AbortController
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
    aiStore.initChatSessions();

    // 计算属性：从store获取会话列表和当前会话
    const chatSessions = computed(() => aiStore.chatSessions)
    const currentSession = computed(() => aiStore.currentSession)

    const signalSession = ref()

    // 创建新会话
    const createNewChat = () => {
        aiStore.createNewChat()
    }

    // 加载会话
    const loadSession = async (session) => {
        aiStore.loadSession(session)
        aiStore.setSelectedAssistant(session.assistantId)
        // Restore scroll position
        nextTick(() => {
            const savedPosition = aiStore.scrollPosition[session.id]; // Get from Pinia
            if (savedPosition !== undefined) {
                messageContainer.value?.setScrollPosition('vertical', savedPosition, 300);
            } else {
                messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize);
            }
        })
    }

    // 删除会话
    const deleteSession = (session) => {
        aiStore.deleteSession(session)
    }

    // 停止生成
    const abort = () => {
        // 中断搜索请求
        if (searchAbortController) {
            try {
                searchAbortController.abort()
            } catch (error) {
                // 忽略中断错误
            }
            searchAbortController = null
        }
        
        // 中断模型请求
        if (abortController) {
            try {
                abortController.abort()
            } catch (error) {
                // 忽略中断错误
            }
            abortController = null
            loading.value = false
        }
            
        // 获取当前活动会话
        const activeSession = signalSession.value || currentSession.value
        if (activeSession?.messages?.length > 0) {
            // 查找最后一条消息
            const lastMessage = activeSession.messages[activeSession.messages.length - 1]
            
            // 直接标记最后一条消息为中断状态，无需判断消息类型
            lastMessage.wasInterrupted = true
        }
    }

    // 取消响应
    const cancelResponse = () => {
        // 停止生成
        abort()
        
        // 获取当前活动会话
        const activeSession = signalSession.value || currentSession.value
        if (!activeSession || !activeSession.messages || activeSession.messages.length === 0) return
        
        // 查找最后一条消息
        let lastMessage = activeSession.messages[activeSession.messages.length - 1]

        const MessagesPop = () => {
            activeSession.messages.pop()                
            // 更新会话
            if (signalSession.value) {
                // 单会话模式
                signalSession.value.messages = [...activeSession.messages]
            } else {
                // 多会话模式
                aiStore.updateSessionMessages(activeSession.id, [...activeSession.messages])
            }
        }
        
        // 如果最后一条消息是助手消息，删除它
        if (lastMessage.role === 'assistant') {
            MessagesPop()
            lastMessage = activeSession.messages[activeSession.messages.length - 1]
        }
        
        // 如果找到用户消息，将其内容恢复到输入框
        if (lastMessage && lastMessage.role === 'user') {
            inputMessage.value = lastMessage.content
            MessagesPop()
        }
        
        // 确保 loading 状态被重置
        loading.value = false
    }

    // 发送消息
    const sendMessage = async (options = {}) => {
        const { chatMode = 'sessions', useSearch = false } = typeof options === 'object' ? options : { chatMode: options };
        const singleMode = chatMode === 'single'
        if (!inputMessage.value.trim() || loading.value) return
        
        if (!currentSession.value && !singleMode) {
            createNewChat()
        }
        if (singleMode) {
            signalSession.value = aiStore.createSingleChat()
        }
        const activeSession = singleMode ? signalSession.value : currentSession.value

        // 更新会话的搜索状态
        if (!singleMode && activeSession.id) {
            aiStore.updateSessionSearchEnabled(activeSession.id, useSearch)
        } else if (singleMode) {
            signalSession.value.searchEnabled = useSearch
        }

        const userMessage = {
            id: uid(),
            role: 'user',
            content: inputMessage.value,
            timestamp: Date.now()
        }

        // 添加用户消息到当前会话
        if(!singleMode) {
            aiStore.addMessageToCurrentSession(userMessage)
        } else {
            signalSession.value.messages.push(userMessage)
        }
        
        // 如果是第一条消息，使用前10个字符作为会话标题
        if (activeSession.messages.length === 1) {
            const session = aiStore.chatSessions.find(s => s.id === activeSession.id)
            if (session) {
                // 提取用户输入的前10个字符作为会话标题
                activeSession.title = inputMessage.value.slice(0, 10)
                session.title = activeSession.title
            }
        }

        inputMessage.value = ''
        loading.value = true

        // 如果启用了搜索功能，先进行搜索
        let searchResults = null
        if (useSearch && aiStore.searchProvider.tavily.active && aiStore.searchProvider.tavily.apiKey) {
            try {
                // 创建一个临时消息，显示正在搜索
                const searchingMessage = {
                    id: uid(),
                    role: 'assistant',
                    content: '正在搜索互联网获取最新信息...',
                    isTemporary: true,
                    timestamp: Date.now()
                }
                
                if(!singleMode) {
                    aiStore.addMessageToCurrentSession(searchingMessage)
                } else {
                    signalSession.value.messages.push(searchingMessage)
                }
                
                // 创建新的 AbortController 用于搜索请求
                searchAbortController = new AbortController()
                
                // 调用Tavily API进行搜索
                const searchResponse = await fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${aiStore.searchProvider.tavily.apiKey}`
                    },
                    body: JSON.stringify({
                        query: userMessage.content,
                        search_depth: 'advanced',
                        include_domains: [],
                        exclude_domains: [],
                        max_results: 5
                    }),
                    signal: searchAbortController.signal
                })
                
                // 搜索完成后，将 searchAbortController 设置为 null
                searchAbortController = null
                
                if (!searchResponse.ok) {
                    throw new Error(`搜索请求失败: ${searchResponse.status}`)
                }
                
                searchResults = await searchResponse.json()
                
                // 移除临时消息
                if(!singleMode) {
                    const tempIndex = activeSession.messages.findIndex(m => m.id === searchingMessage.id)
                    if (tempIndex > -1) {
                        activeSession.messages.splice(tempIndex, 1)
                    }
                } else {
                    const tempIndex = signalSession.value.messages.findIndex(m => m.id === searchingMessage.id)
                    if (tempIndex > -1) {
                        signalSession.value.messages.splice(tempIndex, 1)
                    }
                }
                
                // 保存搜索结果，不进行格式化
                searchResults = {
                    raw: searchResults
                }
                
                // 检查是否在搜索过程中被中断
                // 检查活动会话中是否有任何消息被标记为中断
                const wasInterrupted = activeSession.messages.some(msg => msg.wasInterrupted);
                
                if (wasInterrupted) {
                    // 如果搜索过程被中断，不继续发送模型请求
                    loading.value = false
                    return
                }
            } catch (error) {
                // 检查是否是中断错误
                if (error.name === 'AbortError') {
                    console.log('搜索请求被中断')
                    loading.value = false
                    return
                }
                
                console.error('搜索失败:', error)
                // 保存搜索错误信息
                searchResults = {
                    error: error.message
                }
            }
        }

        try {
            // 检查是否有任何消息被标记为中断
            const wasInterrupted = activeSession.messages.some(msg => msg.wasInterrupted);
            if (wasInterrupted) {
                // 如果有消息被标记为中断，不继续发送模型请求
                loading.value = false
                return
            }
            
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
                    
                    // 准备消息数组
                    let ollamaMessages = activeSession.messages.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    }));
                    
                    // 如果有搜索结果，添加到请求中
                    if (searchResults && searchResults.raw && searchResults.raw.results) {
                        const searchContent = searchResults.raw.results.map((result, index) => {
                            return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                        }).join('\n\n');
                        
                        ollamaMessages.unshift({
                            role: 'system',
                            content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                        });
                    }
                    
                    requestBody = {
                        model: aiStore.currentModel.id,
                        prompt: aiStore.currentAssistant.prompt,
                        messages: ollamaMessages,
                        stream: true,
                        options: {
                            temperature: 0.7
                        }
                    };
                    break;
                case 'anthropic':
                    headers['x-api-key'] = providerConfig.apiKey;
                    
                    // 准备消息数组
                    let anthropicMessages = activeSession.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })).slice(-20); // Anthropic模型限制上下文数量
                    
                    // 如果有搜索结果，添加到请求中
                    if (searchResults && searchResults.raw && searchResults.raw.results) {
                        const searchContent = searchResults.raw.results.map((result, index) => {
                            return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                        }).join('\n\n');
                        
                        // Anthropic使用system消息的方式可能不同，这里使用assistant消息
                        anthropicMessages.unshift({
                            role: 'assistant',
                            content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                        });
                    }
                    
                    requestBody = {
                        model: aiStore.currentModel.id,
                        prompt: aiStore.currentAssistant.prompt,
                        messages: anthropicMessages,
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
                    for (let i = activeSession.messages.length - 1; i >= 0; i--) {
                        const msg = activeSession.messages[i];
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
                    
                    // 如果有搜索结果，添加到请求中
                    if (searchResults && searchResults.raw && searchResults.raw.results) {
                        const searchContent = searchResults.raw.results.map((result, index) => {
                            return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                        }).join('\n\n');
                        
                        messages.unshift({
                            role: 'system',
                            content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                        });
                    }
                    
                    // 针对Deepseek模型的特殊处理
                    if (provider === 'deepseek') {
                        // Deepseek模型要求严格的一问一答交替形式
                        // 不能有连续的相同角色消息（如连续的用户问题或连续的AI回答）
                        
                        // 首先提取所有系统消息（如搜索结果），这些消息应该保留
                        const systemMessages = messages.filter(msg => msg.role === 'system');
                        
                        // 然后处理用户和助手消息，确保它们严格交替
                        const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
                        const processedMessages = [];
                        
                        // 从最后一条消息开始，确保交替模式
                        let lastRole = null;
                        
                        // 从后向前处理消息，确保最新的消息被保留
                        for (let i = userAssistantMessages.length - 1; i >= 0; i--) {
                            const currentMessage = userAssistantMessages[i];
                            
                            // 如果是第一条消息或者角色与上一条不同，则添加
                            if (lastRole === null || currentMessage.role !== lastRole) {
                                processedMessages.unshift(currentMessage);
                                lastRole = currentMessage.role;
                            }
                        }
                        
                        // 将系统消息添加到处理后的消息数组的开头
                        processedMessages.unshift(...systemMessages);
                        
                        // 确保最后一条消息是用户消息
                        const nonSystemMessages = processedMessages.filter(msg => msg.role !== 'system');
                        if (nonSystemMessages.length === 0 || nonSystemMessages[nonSystemMessages.length - 1].role !== 'user') {
                            // 如果没有非系统消息，或者最后一条非系统消息不是用户消息，则添加当前用户消息
                            // 这确保了Deepseek可以生成回复
                            processedMessages.push({
                                role: 'user',
                                content: userMessage.content // 使用当前用户发送的消息
                            });
                        }
                        
                        // 使用处理后的消息数组
                        messages.length = 0;
                        messages.push(...processedMessages);
                        
                        console.log('Deepseek processed messages:', processedMessages);
                    }
                    
                    requestBody = {
                        model: aiStore.currentModel.id,
                        prompt: aiStore.currentAssistant.prompt,
                        messages: messages,
                        stream: true
                    };
            }

            const endpoint = provider === 'ollama' 
                ? `${providerConfig.endpoint.replace(/\/$/, '')}/api/chat`
                : providerConfig.endpoint;

            // console.log('Sending request to:', endpoint);
            // console.log('Request body:', requestBody);

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

            // 如果有搜索结果，添加到searching字段
            if (searchResults) {
                if (searchResults.error) {
                    assistantMessage.searching = {
                        error: searchResults.error
                    };
                } else {
                    assistantMessage.searching = searchResults.raw;
                }
            }

            // 添加AI消息到当前会话
            if(!singleMode) {
                aiStore.addMessageToCurrentSession(assistantMessage)
            } else {
                signalSession.value.messages.push(assistantMessage)
            }
            
            await nextTick()
            if(chatMode === 'single') {
                messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
            }
            
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
                                // console.log('Raw Ollama response line:', line);
                                const json = JSON.parse(line)
                                // console.log('Parsed Ollama JSON:', json);
                                
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
                                    // console.log('Started think mode, reasoning:', assistantMessage.reasoning_content);
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
                                    // console.log('Ended think mode, reasoning:', assistantMessage.reasoning_content);
                                    // console.log('Remaining content:', remainingContent);
                                }
                                // 如果在think模式中
                                else if (assistantMessage.thinkMode) {
                                    assistantMessage.reasoning_content += currentChunk;
                                    // console.log('Added to reasoning:', currentChunk);
                                }
                                // 如果不在think模式中，直接添加到content
                                else {
                                    assistantMessage.content += currentChunk;
                                    // console.log('Added to content:', currentChunk);
                                }

                                // 更新消息
                                const updatedMessages = [...activeSession.messages]
                                updatedMessages[updatedMessages.length - 1] = { ...assistantMessage }
                                if(!singleMode) {
                                    aiStore.updateSessionMessages(activeSession.id, updatedMessages)
                                } else {
                                    signalSession.value.messages = updatedMessages
                                }
                                
                                await nextTick()
                                if(chatMode === 'single') {
                                    messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
                                }
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
                                const updatedMessages = [...activeSession.messages]
                                updatedMessages[updatedMessages.length - 1] = { ...assistantMessage }
                                if(!singleMode) {
                                    aiStore.updateSessionMessages(activeSession.id, updatedMessages)
                                } else {
                                    signalSession.value.messages = updatedMessages
                                }
                                
                                await nextTick()
                                if(chatMode === 'single') {
                                    messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize)
                                }
                            }
                        } catch (error) {
                            if (error.name === 'AbortError') {
                                console.log('请求被中断')
                            } else {
                                console.error('读取响应流时出错:', error)
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('请求被中断')
                } else {
                    console.error('Error:', error)
                    // 这里可以添加错误提示
                }
            } finally {
                reader.releaseLock()
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被中断')
            } else {
                console.error('Error:', error)
                // 这里可以添加错误提示
            }
        } finally {
            loading.value = false
            abortController = null
            searchAbortController = null
        }
    }

    return {
        chatSessions,
        currentSession,
        signalSession,
        inputMessage,
        loading,
        messageContainer,
        createNewChat,
        loadSession,
        deleteSession,
        sendMessage,
        cancelResponse,
        saveScrollPosition // Expose the saveScrollPosition method
    }
} 