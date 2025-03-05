import { ref, nextTick, computed, watch } from 'vue'
import { uid } from 'quasar'
import { useAIStore } from '../../../stores/ai'

// Debounce function to limit how often a function can be called
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

export function useChat() {
    const inputMessage = ref('')
    const loading = ref(false)
    const messageContainer = ref(null)
    let abortController = null
    let searchAbortController = null // 用于搜索请求的中断控制
    const aiStore = useAIStore()

    // 初始化时加载配置
    aiStore.initChatSessions();

    // 计算属性：从 store 获取会话列表和当前会话
    const chatSessions = computed(() => aiStore.chatSessions)
    const currentSession = computed(() => aiStore.currentSession)

    const signalSession = ref()

    // Debounce 保存滚动位置
    const saveScrollPosition = debounce(async () => {
        if (currentSession.value) {
            const position = messageContainer.value.getScroll().verticalPosition; // 获取当前滚动位置
            aiStore.scrollPosition[currentSession.value.id] = position; // 保存到 Pinia
        }
    }, 100);

    const scrollToBottom = async () => {
        await nextTick();
        messageContainer.value?.setScrollPosition('vertical', messageContainer.value?.getScroll().verticalSize, 300);
    }

    // 创建新会话
    const createNewChat = () => {
        aiStore.createNewChat()
    }

    // 加载会话
    const loadSession = async (session) => {
        aiStore.loadSession(session)
        aiStore.setSelectedAssistant(session.assistantId)
        // 恢复滚动位置
        nextTick(() => {
            const savedPosition = aiStore.scrollPosition[session.id];
            if (savedPosition !== undefined) {
                messageContainer.value?.setScrollPosition('vertical', savedPosition, 300);
            } else {
                scrollToBottom()
            }
        })
    }

    // 删除会话
    const deleteSession = (session) => {
        aiStore.deleteSession(session)
    }

    // 停止生成
    const isAbort = ref(false)
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
        }

        isAbort.value = true
    }

    // 清理会话状态
    const cleanupSession = (singleMode, activeSession) => {
        // 如果最后一条消息是空的助手消息，则移除它
        if (activeSession && activeSession.messages && activeSession.messages.length > 0) {
            const lastMessage = activeSession.messages[activeSession.messages.length - 1];
            if (lastMessage.role === 'assistant' && 
                (!lastMessage.content || lastMessage.content.trim() === '') && 
                (!lastMessage.reasoning_content || lastMessage.reasoning_content.trim() === '')) {
                activeSession.messages.pop();
                updateMessages(singleMode, activeSession, [...activeSession.messages]);
            }
        }
        // 重置状态
        loading.value = false;
        abortController = null;
        searchAbortController = null;
        isAbort.value = false;
    };

    // 取消响应
    const cancelResponse = () => {
        abort();
        const activeSession = getActiveSession(false);
        if (!activeSession || !activeSession.messages || activeSession.messages.length === 0) return;

        // 先使用 cleanupSession 清理空的助手消息
        cleanupSession(false, activeSession);
        
        // 如果最后一条消息是用户消息，将其内容恢复到输入框并移除
        if (activeSession.messages.length > 0) {
            const lastMessage = activeSession.messages[activeSession.messages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
                inputMessage.value = lastMessage.content;
                activeSession.messages.pop();
                updateMessages(false, activeSession, [...activeSession.messages]);
            }
        }
    }

    // 获取活动会话
    const getActiveSession = (singleMode) => {
        return singleMode ? signalSession.value : currentSession.value;
    };

    // 更新消息数组
    const updateMessages = (singleMode, activeSession, messages) => {
        if (singleMode) {
            signalSession.value.messages = messages;
        } else {
            aiStore.updateSessionMessages(activeSession.id, messages);
        }
    };

    // 构建请求体和头信息
    const buildRequest = (provider, providerConfig, messages, searchResults, singleMode) => {
        let requestBody;
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        };
        // 创建消息数组的副本，而不是直接修改原始数组
        const messagesCopy = [...messages];
        
        // 检查最后一条消息是否是空的助手消息，如果是则移除
        const lastMessage = messagesCopy.length > 0 ? messagesCopy[messagesCopy.length - 1] : null;
        if (lastMessage && 
            lastMessage.role === 'assistant' && 
            (!lastMessage.content || lastMessage.content.trim() === '') && 
            (!lastMessage.reasoning_content || lastMessage.reasoning_content.trim() === '')) {
            // 只有当最后一条消息是空的助手消息时才移除
            messagesCopy.pop();
        }

        switch (provider) {
            case 'ollama':
                headers['Accept'] = 'application/x-ndjson';
                let ollamaMessages = messagesCopy.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }));
                if (searchResults?.raw?.results) {
                    console.log('searchResults', searchResults);
                    
                    const searchContent = searchResults.raw.results.map((result, index) => {
                        return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                    }).join('\n\n');
                    console.log('searchContent', searchContent);
                    ollamaMessages.unshift({
                        role: 'system',
                        content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                    });
                }
                if (currentSession.value.prompt && !singleMode){
                    ollamaMessages.unshift({
                        role: 'system',
                        content: currentSession.value.prompt
                    });
                }
                console.log('ollamaMessages', ollamaMessages);
                requestBody = {
                    model: aiStore.currentModel.id,
                    prompt: aiStore.currentAssistant.prompt,
                    messages: ollamaMessages,
                    stream: true,
                    options: { temperature: 0.7 }
                };
                break;
            case 'anthropic':
                headers['x-api-key'] = providerConfig.apiKey;
                let anthropicMessages = messagesCopy.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })).slice(-20);
                if (searchResults?.raw?.results) {
                    const searchContent = searchResults.raw.results.map((result, index) => {
                        return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                    }).join('\n\n');
                    anthropicMessages.unshift({
                        role: 'assistant',
                        content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                    });
                }
                if (currentSession.value.prompt && !singleMode){
                    anthropicMessages.unshift({
                        role: 'system',
                        content: currentSession.value.prompt
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
                headers['Authorization'] = 'Bearer ' + providerConfig.apiKey;
                const contextLimit = 4096;
                let totalLength = 0;
                const limitedMessages = [];
                for (let i = messagesCopy.length - 1; i >= 0; i--) {
                    const msg = messagesCopy[i];
                    const estimatedTokens = (msg.content.length + (msg.reasoning_content?.length || 0)) / 4;
                    if (totalLength + estimatedTokens > contextLimit) break;
                    totalLength += estimatedTokens;
                    limitedMessages.unshift({ role: msg.role, content: msg.content });
                }
                if (searchResults?.raw?.results) {
                    const searchContent = searchResults.raw.results.map((result, index) => {
                        return `[${index + 1}] ${result.title}\n${result.content}\n来源: ${result.url}`;
                    }).join('\n\n');
                    limitedMessages.unshift({
                        role: 'system',
                        content: `以下是与用户问题相关的搜索结果，请在回答时参考这些信息：\n\n${searchContent}`
                    });
                }
                if (currentSession.value.prompt && !singleMode){
                    limitedMessages.unshift({
                        role: 'system',
                        content: currentSession.value.prompt
                    });
                }
                requestBody = {
                    model: aiStore.currentModel.id,
                    prompt: aiStore.currentAssistant.prompt,
                    messages: limitedMessages,
                    stream: true
                };
        }
        return { requestBody, headers };
    };

    // 处理流式响应
    const processStreamResponse = async (provider, reader, assistantMessage, activeSession, singleMode) => {
        const decoder = new TextDecoder();
        let lastScrollPosition = 0;
        let userHasScrolled = false;
        let scrollUpdatePending = false;
        let lastScrollTime = 0; // 记录上次滚动时间
        
        // 检测用户是否手动滚动
        const checkUserScroll = () => {
            if (!messageContainer.value) return;
            const container = messageContainer.value;
            const { verticalPosition, verticalSize, verticalContainerSize } = container.getScroll();
            
            // 如果用户向上滚动超过20px，认为用户已手动滚动
            const isAtBottom = verticalSize - verticalPosition - verticalContainerSize < 20;
            userHasScrolled = !isAtBottom;
            lastScrollPosition = verticalPosition;
        };
        
        // 添加滚动事件监听
        if (messageContainer.value && !singleMode) {
            messageContainer.value.$el.addEventListener('scroll', checkUserScroll);
        }
        
        // 智能滚动函数 - 每3秒最多触发一次
        const smartScroll = async () => {
            if (scrollUpdatePending) return;
            
            const currentTime = Date.now();
            // 如果距离上次滚动不足3秒，则不执行滚动
            if (currentTime - lastScrollTime < 3000) return;
            
            scrollUpdatePending = true;
            lastScrollTime = currentTime;
            
            await nextTick();
            if (!messageContainer.value || userHasScrolled) {
                scrollUpdatePending = false;
                return;
            }
            
            // 只有当用户没有手动滚动时，才自动滚动到底部
            messageContainer.value.setScrollPosition('vertical', messageContainer.value.getScroll().verticalSize, 300);
            
            // 延迟重置scrollUpdatePending标志，确保3秒内不会再次触发
            setTimeout(() => {
                scrollUpdatePending = false;
            }, 300); // 滚动动画完成后重置
        };
        
        try {
            while (true) {
                if (isAbort.value) {
                    loading.value = false;
                    return;
                }
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (provider === 'ollama') {
                        if (!line.trim()) continue;
                        const json = JSON.parse(line);
                        let currentChunk = json.message?.content || json.response || '';
                        if (!currentChunk) continue;

                        if (!assistantMessage.thinkMode) assistantMessage.thinkMode = false;
                        if (currentChunk.includes('<think>') && !assistantMessage.thinkMode) {
                            assistantMessage.thinkMode = true;
                            const startIndex = currentChunk.indexOf('<think>') + 7;
                            const thinkContent = currentChunk.slice(startIndex);
                            if (thinkContent) assistantMessage.reasoning_content += thinkContent;
                            continue;
                        }
                        if (currentChunk.includes('</think>') && assistantMessage.thinkMode) {
                            const endIndex = currentChunk.indexOf('</think>');
                            const thinkContent = currentChunk.slice(0, endIndex);
                            if (thinkContent) assistantMessage.reasoning_content += thinkContent;
                            assistantMessage.thinkMode = false;
                            const remainingContent = currentChunk.slice(endIndex + 8).trim();
                            if (remainingContent) assistantMessage.content += remainingContent;
                        } else if (assistantMessage.thinkMode) {
                            assistantMessage.reasoning_content += currentChunk;
                        } else {
                            assistantMessage.content += currentChunk;
                        }
                    } else {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            const json = JSON.parse(data);
                            let content = '';
                            let reasoningContent = '';
                            switch (provider) {
                                case 'anthropic':
                                    content = json.delta?.text || '';
                                    break;
                                default:
                                    content = json.choices[0]?.delta?.content || '';
                                    reasoningContent = json.choices[0]?.delta?.reasoning_content || '';
                            }
                            if (reasoningContent) assistantMessage.reasoning_content += reasoningContent;
                            if (content) assistantMessage.content += content;
                        }
                    }
                    const updatedMessages = [...activeSession.messages];
                    // 确保最后一条消息是我们要更新的助手消息
                    if (updatedMessages.length > 0 && 
                        updatedMessages[updatedMessages.length - 1].role === 'assistant' &&
                        updatedMessages[updatedMessages.length - 1].id === assistantMessage.id) {
                        updatedMessages[updatedMessages.length - 1] = { ...assistantMessage };
                        updateMessages(singleMode, activeSession, updatedMessages);
                        if (!singleMode) smartScroll();
                    }
                }
            }
            
            // 消息接收完成后，执行最后一次滚动到底部
            if (!singleMode && !userHasScrolled && messageContainer.value) scrollToBottom();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被中断');
            } else {
                console.error('Error:', error);
            }
        } finally {
            // 移除滚动事件监听
            if (messageContainer.value && !singleMode) {
                messageContainer.value.$el.removeEventListener('scroll', checkUserScroll);
            }
        }
    };

    // 处理搜索逻辑
    const handleSearch = async (userMessage, assistantMessage, activeSession, singleMode) => {
        let searchQuery = userMessage.content;
        let searchResults = null;
        try {
            searchAbortController = new AbortController();
    
            // 如果配置了搜索关键词提取模型，则使用该模型提取关键词
            if (aiStore.searchKeywordModel) {
                try {
                    assistantMessage.status = 'keyword generating';
                    updateMessages(singleMode, activeSession, [...activeSession.messages]);
    
                    const modelId = aiStore.searchKeywordModel;
                    let providerId = null;
                    for (const pid in aiStore.providers) {
                        if (aiStore.providers[pid].activeModels?.includes(modelId)) {
                            providerId = pid;
                            break;
                        }
                    }
                    if (!providerId) throw new Error('未找到搜索关键词提取模型所属的供应商');
    
                    const providerConfig = aiStore.providers[providerId];
                    if (!providerConfig || !providerConfig.endpoint) throw new Error('搜索关键词提取模型的供应商未配置');
    
                    let requestBody;
                    let headers = { 'Content-Type': 'application/json' };
    
                    switch (providerId) {
                        case 'ollama':
                            let ollamaMessages = activeSession.messages.map(msg => ({
                                role: msg.role === 'user' ? 'user' : 'assistant',
                                content: msg.content
                            }));
                            ollamaMessages.push({
                                role: 'user',
                                content: `请从以下问题中提取出最适合用于搜索引擎的关键词，直接返回关键词，不要包含任何解释或其他内容：\n\n${userMessage.content}`
                            });
                            requestBody = {
                                model: modelId,
                                prompt: "你是一个搜索关键词提取助手。你的任务是从用户的问题中提取出最适合用于搜索引擎的关键词。请只返回关键词，不要包含任何解释或其他内容。",
                                messages: ollamaMessages,
                                stream: false,
                                options: { temperature: 0.1 }
                            };
                            break;
                        case 'anthropic':
                            headers['x-api-key'] = providerConfig.apiKey;
                            let anthropicMessages = activeSession.messages.map(msg => ({
                                role: msg.role === 'user' ? 'user' : 'assistant',
                                content: msg.content
                            }));
                            anthropicMessages.push({
                                role: 'user',
                                content: `请从以下问题中提取出最适合用于搜索引擎的关键词，直接返回关键词，不要包含任何解释或其他内容：\n\n${userMessage.content}`
                            });
                            requestBody = {
                                model: modelId,
                                messages: anthropicMessages,
                                stream: false,
                                max_tokens: 100
                            };
                            break;
                        default:
                            headers['Authorization'] = 'Bearer ' + providerConfig.apiKey;
                            let searchMessages = activeSession.messages.map(msg => ({
                                role: msg.role === 'user' ? 'user' : 'assistant',
                                content: msg.content
                            }));
                            searchMessages.push({
                                role: 'user',
                                content: `请从以下问题中提取出最适合用于搜索引擎的关键词，直接返回关键词，不要包含任何解释或其他内容：\n\n${userMessage.content}`
                            });
                            requestBody = {
                                model: modelId,
                                messages: searchMessages,
                                stream: false,
                                max_tokens: 100,
                                temperature: 0.1
                            };
                    }
    
                    const endpoint = providerId === 'ollama' ? `${providerConfig.endpoint.replace(/\/$/, '')}/api/chat` : providerConfig.endpoint;
                    const keywordResponse = await fetch(endpoint, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(requestBody),
                        signal: searchAbortController.signal
                    });
                    // 检查是否已被中断
                    if (!searchAbortController || isAbort.value) {
                        console.log('关键词提取请求已被中断');
                        return null;
                    }
    
                    if (!keywordResponse.ok) throw new Error(`提取关键词请求失败: ${keywordResponse.status}`);
    
                    const keywordData = await keywordResponse.json();
                    let extractedKeywords = '';
    
                    switch (providerId) {
                        case 'ollama':
                            extractedKeywords = keywordData.message?.content || keywordData.response || '';
                            break;
                        case 'anthropic':
                            extractedKeywords = keywordData.content?.[0]?.text || '';
                            break;
                        default:
                            extractedKeywords = keywordData.choices?.[0]?.message?.content || '';
                    }
    
                    searchQuery = extractedKeywords.trim().replace(/^["']|["']$/g, '') || userMessage.content;
                    assistantMessage.search.feedback = `正在搜索互联网获取最新信息...\n关键词: ${searchQuery}`;
                    updateMessages(singleMode, activeSession, [...activeSession.messages]);
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.log('搜索请求被中断');
                        return null;
                    }
                    console.error('提取搜索关键词失败:', error);
                    searchQuery = userMessage.content;
                    assistantMessage.search.feedback = '正在搜索互联网获取最新信息...';
                    updateMessages(singleMode, activeSession, [...activeSession.messages]);
                }
            }
            // 再次检查是否已被中断
            if (!searchAbortController || isAbort.value) {
                console.log('搜索过程已被中断');
                return null;
            }
    
            assistantMessage.search.keyword = searchQuery;
            assistantMessage.status = 'searching';
            updateMessages(singleMode, activeSession, [...activeSession.messages]);
    
            const searchResponse = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiStore.searchProvider.tavily.apiKey}`
                },
                body: JSON.stringify({
                    query: searchQuery,
                    search_depth: 'advanced',
                    max_results: 10
                }),
                signal: searchAbortController.signal
            });
            // 再次检查是否已被中断
            if (!searchAbortController || isAbort.value) {
                console.log('搜索过程已被中断');
                return null;
            }
    
            searchAbortController = null;
            if (!searchResponse.ok) throw new Error(`搜索请求失败: ${searchResponse.status}`);
    
            searchResults = await searchResponse.json();
            searchResults = { raw: searchResults };
            assistantMessage.search.results = searchResults.raw.results;
            assistantMessage.status = 'thinking';
            updateMessages(singleMode, activeSession, [...activeSession.messages]);
            scrollToBottom();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('搜索请求被中断');
                return null;
            }
            console.error('搜索失败:', error);
            assistantMessage.search.error = error.message;
            searchResults = { error: error.message };
        }
        return searchResults;
    };

    const generateSessionTitle = (activeSession) => {
        if (activeSession.messages.length === 1) {
            const session = aiStore.chatSessions.find(s => s.id === activeSession.id);
            if (session) {
                activeSession.title = inputMessage.value.slice(0, 10);
                session.title = activeSession.title + '...';
            }
        }
    }

    // 发送消息
    const sendMessage = async (options = {}) => {
        isAbort.value = false;
        // chatMode：对话模式 - sessions；Tiptap编辑器中生成内容是单次模式 - single
        const { chatMode = 'sessions', useSearch = false } = typeof options === 'object' ? options : { chatMode: options };
        const singleMode = chatMode === 'single';
        if (!inputMessage.value.trim() || loading.value) return;

        if (!currentSession.value && !singleMode) createNewChat();
        if (singleMode) signalSession.value = aiStore.createSingleChat();
        const activeSession = getActiveSession(singleMode);

        if (!singleMode && activeSession.id) {
            aiStore.updateSessionSearchEnabled(activeSession.id, useSearch);
        } else if (singleMode) {
            signalSession.value.searchEnabled = useSearch;
        }

        const userMessage = { id: uid(), role: 'user', content: inputMessage.value, timestamp: Date.now() };
        // 将用户消息添加到对话消息中
        // 此时UI中出现用户消息
        updateMessages(singleMode, activeSession, [...activeSession.messages, userMessage]);

        // 自动修改对话标题
        generateSessionTitle(activeSession);

        inputMessage.value = '';
        loading.value = true;
        const assistantMessage = {
            id: uid(),
            role: 'assistant',
            status: '',
            content: '',
            reasoning_content: '',
            search: { keyword: '', feedback: '', results: [], error: '' },
            timestamp: Date.now()
        };
        // 将初始化的AI消息添加到对话中
        // 此时对话列表中出现AI返回消息，但没有内容
        updateMessages(singleMode, activeSession, [...activeSession.messages, assistantMessage]);
        scrollToBottom();

        let searchResults = null;
        // 如果当前对话用户启用了联网，进入联网方法
        if (useSearch && aiStore.searchProvider.tavily.active && aiStore.searchProvider.tavily.apiKey) {
            searchResults = await handleSearch(userMessage, assistantMessage, activeSession, singleMode);
            
            // 如果搜索过程被中断，清理会话状态并返回
            if (isAbort.value || !searchResults) {
                cleanupSession(singleMode, activeSession);
                return;
            }
        }

        try {
            // 再次检查是否已被中断
            if (isAbort.value) {
                cleanupSession(singleMode, activeSession);
                return;
            }

            const provider = aiStore.provider;
            if (!provider) throw new Error('No provider selected');
            const providerConfig = aiStore.providers[provider];
            if (!providerConfig || !providerConfig.endpoint) throw new Error('Provider not configured');

            abortController = new AbortController();
            const { requestBody, headers } = buildRequest(provider, providerConfig, activeSession.messages, searchResults, singleMode);
            const endpoint = provider === 'ollama' ? `${providerConfig.endpoint.replace(/\/$/, '')}/api/chat` : providerConfig.endpoint;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                signal: abortController.signal
            });
            
            // 检查请求是否被中断
            if (isAbort.value) {
                cleanupSession(singleMode, activeSession);
                return;
            }
            
            assistantMessage.status = 'generating';
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body.getReader();
            await processStreamResponse(provider, reader, assistantMessage, activeSession, singleMode);
            
            // 检查生成的内容是否为空
            if (assistantMessage.content.trim() === '' && assistantMessage.reasoning_content.trim() === '') {
                assistantMessage.content = '抱歉，生成过程中出现了问题，请重试。';
                updateMessages(singleMode, activeSession, [...activeSession.messages]);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被中断');
                cleanupSession(singleMode, activeSession);
                return;
            } else {
                console.error('Error:', error);
                // 如果发生错误，添加错误消息
                if (activeSession.messages.length > 0 && 
                    activeSession.messages[activeSession.messages.length - 1].role === 'assistant') {
                    const errorMessage = activeSession.messages[activeSession.messages.length - 1];
                    errorMessage.content = `生成回复时出错: ${error.message}`;
                    errorMessage.status = 'error';
                    updateMessages(singleMode, activeSession, [...activeSession.messages]);
                }
            }
        } finally {
            cleanupSession(singleMode, activeSession);
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
        saveScrollPosition
    }
}