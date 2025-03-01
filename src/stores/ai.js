import { defineStore } from 'pinia'
import { defaultProviders } from '../pages/ai/config/apiProviders'
import { uid } from 'quasar'

export const useAIStore = defineStore('ai', {
  state: () => ({
    // 当前选中的供应商
    provider: '',
    // 当前选中的模型
    model: '',
    // 供应商配置
    providers: Object.fromEntries(
      defaultProviders.map(provider => [
        provider.id,
        {
          endpoint: provider.defaultEndpoint || '',
          apiKey: '',
          models: [],
          activeModels: [],
          active: false
        }
      ])
    ),
    showConfig: false,
    // 搜索服务配置
    searchProvider: {
      tavily: {
        apiKey: '',
        active: false
      }
    },
    // 搜索关键词提取模型
    searchKeywordModel: '',
    // 聊天会话相关状态
    chatSessions: [], // List of chat sessions
    currentSession: null, // Currently selected session
    scrollPosition: {}, // 用于存储每个会话的滚动位置
    assistants: [], // List of assistants
    selectedAssistant: null, // Currently selected assistant
    listToggler: 'assistants',
  }),

  persist: true, // Enable persistence for the entire store

  getters: {
    // 获取可用的供应商列表
    availableProviders: (state) => {
      return defaultProviders.filter(provider => {
        const config = state.providers[provider.id]
        console.log('availableProviders', config);
        
        if (!config || !config.active || !config.endpoint) return false
        
        // 检查是否有可用的激活模型
        const hasActiveModels = Array.isArray(config.activeModels) && config.activeModels.length > 0
        console.log('hasActiveModels', hasActiveModels);
        
        // Ollama不需要apiKey
        if (provider.id === 'ollama') {
          return hasActiveModels
        }
        
        return config.apiKey && hasActiveModels
      })
    },

    // 获取当前供应商的可用模型
    availableModels: (state) => {
      const provider = defaultProviders.find(p => p.id === state.provider)
      if (!provider) return []
      
      const config = state.providers[state.provider]
      if (!config || !Array.isArray(config.activeModels) || config.activeModels.length === 0) return []

      // 对于Ollama，直接使用config中被激活的models
      if (provider.id === 'ollama') {
        return config.activeModels.map(modelId => ({
          id: modelId,
          name: modelId
        }))
      }

      // 对于其他提供商，只返回被激活的模型
      return provider.models
        .filter(model => config.activeModels.includes(model.id))
        .map(model => ({
          id: model.id,
          name: model.name
        }))
    },

    // 获取当前供应商信息
    currentProvider: (state) => {
      return defaultProviders.find(p => p.id === state.provider)
    },

    // 获取当前模型信息
    currentModel: (state) => {
      const provider = defaultProviders.find(p => p.id === state.provider)
      if (!provider) return null

      if (provider.id === 'ollama') {
        return {
          id: state.model,
          name: state.model
        }
      }

      return provider.models.find(m => m.id === state.model)
    },

    // 获取当前助手信息
    currentAssistant: (state) => {
      return state.assistants.find(a => a.id === state.selectedAssistant);
    },

    availableProvidersWithModels: (state) => {
      const providers = state.providers
      return Object.keys(providers).filter(key => providers[key].active).map(key => ({ name: key, ...providers[key] }))
    },
  },

  actions: {
    // 保存配置
    async saveConfig() {
      const config = {
        provider: this.provider,
        model: this.model,
        providers: this.providers
      }
    },

    // 更新供应商配置
    updateProviderConfig(providerId, config) {
      if (this.providers[providerId]) {
        this.providers[providerId] = {
          ...this.providers[providerId],
          ...config,
          models: Array.isArray(config.models) ? config.models : this.providers[providerId].models,
          activeModels: Array.isArray(config.activeModels) ? config.activeModels : this.providers[providerId].activeModels
        }
        this.saveConfig()
      }
    },

    // 设置当前供应商
    setProvider(providerId) {
      this.provider = providerId
      
      // 自动选择第一个可用的模型
      const config = this.providers[providerId]
      if (config && Array.isArray(config.activeModels) && config.activeModels.length > 0) {
        this.model = config.activeModels[0]
      }
      
      this.saveConfig()
    },

    // 设置当前模型
    setModel(modelId) {
      this.model = modelId
      this.saveConfig()
    },

    // 切换模型激活状态
    toggleModelActive(providerId, modelId) {
      const config = this.providers[providerId]
      if (!config) return

      if (!Array.isArray(config.activeModels)) {
        config.activeModels = []
      }

      const index = config.activeModels.indexOf(modelId)
      if (index === -1) {
        // 激活模型
        config.activeModels.push(modelId)
      } else {
        // 如果是最后一个激活的模型，不允许取消激活
        if (config.activeModels.length === 1) return
        // 取消激活
        config.activeModels.splice(index, 1)
      }

      this.saveConfig()
    },

    // 添加模型
    addModel(providerId, modelId) {
      const config = this.providers[providerId]
      if (!config) return

      if (!Array.isArray(config.models)) {
        config.models = []
      }

      if (!config.models.includes(modelId)) {
        config.models.push(modelId)
        
        // 自动激活新添加的模型
        if (!Array.isArray(config.activeModels)) {
          config.activeModels = []
        }
        if (!config.activeModels.includes(modelId)) {
          config.activeModels.push(modelId)
        }
      }

      this.saveConfig()
    },

    // 移除模型
    removeModel(providerId, modelId) {
      const config = this.providers[providerId]
      if (!config) return

      // 如果是最后一个激活的模型，不允许移除
      if (config.activeModels?.length === 1 && config.activeModels[0] === modelId) {
        return
      }

      const modelIndex = config.models.indexOf(modelId)
      if (modelIndex > -1) {
        config.models.splice(modelIndex, 1)
      }

      const activeIndex = config.activeModels?.indexOf(modelId)
      if (activeIndex > -1) {
        config.activeModels.splice(activeIndex, 1)
      }

      this.saveConfig()
    },

    // 初始化聊天会话
    async initChatSessions() {
      console.log('initChatSessions 1');
      
      // 确保所有会话都有archived_messages字段
      this.migrateSessionsStructure();
      
      if(this.assistants.length === 0) {
        console.log('initChatSessions 2', this.assistants);
        const newAssistant = {
          id: uid(),
          name: 'default_assistant',
          prompt: '你是一个AI助手，请根据用户的问题给出准确的回答。',
          last_session_id: null
        };
        this.assistants.push(newAssistant);
        this.setSelectedAssistant(newAssistant.id);
        console.log('initChatSessions 3', this.assistants);
      }
      console.log('initChatSessions 1.1', this.assistants);
      if(!this.currentSession){
        if(this.chatSessions.length > 0){
          if(!this.selectedAssistant){
            this.setSelectedAssistant(this.assistants[0].id)
          }
          const sessionsOfCurrentAssistant = this.getSessionsForCurrentAssistant()
          if(sessionsOfCurrentAssistant.length > 0){
            this.currentSession = sessionsOfCurrentAssistant[0]
          }
        }
      }
    },

    // 迁移会话结构，确保所有会话都有archived_messages字段
    migrateSessionsStructure() {
      if (this.chatSessions && this.chatSessions.length > 0) {
        this.chatSessions.forEach(session => {
          // 处理旧版本中的archived_messages字段
          if (Array.isArray(session.archived_messages) && session.archived_messages.length > 0) {
            // 标记所有已归档消息
            const archivedMessages = session.archived_messages.map(msg => ({
              ...msg,
              archived: true
            }));
            
            // 如果有归档消息，添加一个分隔符
            if (archivedMessages.length > 0) {
              session.messages.push({
                id: uid(),
                role: 'system',
                content: '--- 上下文已清空 ---',
                isContextDivider: true,
                timestamp: Date.now() - 1000 // 稍早于当前时间
              });
            }
            
            // 将归档消息添加到当前消息数组
            session.messages = [...session.messages, ...archivedMessages];
            
            // 删除旧的archived_messages字段
            delete session.archived_messages;
          }
        });
      }
      
      // 如果当前会话存在，确保它的结构也被更新
      if (this.currentSession) {
        if (Array.isArray(this.currentSession.archived_messages) && this.currentSession.archived_messages.length > 0) {
          // 标记所有已归档消息
          const archivedMessages = this.currentSession.archived_messages.map(msg => ({
            ...msg,
            archived: true
          }));
          
          // 如果有归档消息，添加一个分隔符
          if (archivedMessages.length > 0) {
            this.currentSession.messages.push({
              id: uid(),
              role: 'system',
              content: '--- 上下文已清空 ---',
              isContextDivider: true,
              timestamp: Date.now() - 1000 // 稍早于当前时间
            });
          }
          
          // 将归档消息添加到当前消息数组
          this.currentSession.messages = [...this.currentSession.messages, ...archivedMessages];
          
          // 删除旧的archived_messages字段
          delete this.currentSession.archived_messages;
        }
      }
    },

    // 创建新会话
    createNewChat() {
      // console.log('Creating new chat session with assistantId:', this.selectedAssistant); // Debugging output
      const newSession = {
        id: uid(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        assistantId: this.selectedAssistant || this.assistants[0].id,
        searchEnabled: false // 添加搜索状态字段，默认关闭
      }
      this.chatSessions.unshift(newSession)
      this.currentSession = newSession
    },
    // 创建新会话
    createSingleChat() {
      // console.log('Creating new chat session with assistantId:', this.selectedAssistant); // Debugging output
      return {
        id: uid(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        assistantId: this.selectedAssistant || this.assistants[0].id,
        searchEnabled: false // 添加搜索状态字段，默认关闭
      }
    },

    // 加载会话
    loadSession(session) {
      if (!session) return
      this.currentSession = JSON.parse(JSON.stringify(session))
      const assistant = this.assistants.find(a => a.id === session.assistantId)
      if (assistant) {
        assistant.last_session_id = session.id
      }
    },

    // 获取与当前助手关联的会话
    getSessionsForCurrentAssistant() {
      return this.chatSessions.filter(session => session.assistantId === this.selectedAssistant);
    },

    // 删除会话
    deleteSession(session) {
      const index = this.chatSessions.findIndex(s => s.id === session.id)
      if (index > -1) {
        this.chatSessions.splice(index, 1)
        if (this.currentSession?.id === session.id) {
          this.currentSession = this.chatSessions[0] || null
        }
      }
    },

    // 更新会话消息
    updateSessionMessages(sessionId, messages) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        // 保存当前标题
        const currentTitle = session.title
        
        session.messages = messages
        session.updatedAt = Date.now()
        
        // 确保标题不变
        session.title = currentTitle
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession = JSON.parse(JSON.stringify(session))
        }
      }
    },

    // 更新会话标题
    updateSessionTitle(sessionId, newTitle) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        session.title = newTitle
        session.updatedAt = Date.now()
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession.title = newTitle
        }
      }
    },

    // 更新会话的搜索状态
    updateSessionSearchEnabled(sessionId, searchEnabled) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        session.searchEnabled = searchEnabled
        session.updatedAt = Date.now()
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession.searchEnabled = searchEnabled
        }
      }
    },

    // 清空会话消息
    clearSessionMessages(sessionId) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        // 保存当前标题和搜索状态
        const currentTitle = session.title
        const searchEnabled = session.searchEnabled
        
        // 清空消息
        session.messages = []
        session.updatedAt = Date.now()
        
        // 确保标题和搜索状态不变
        session.title = currentTitle
        session.searchEnabled = searchEnabled
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession = JSON.parse(JSON.stringify(session))
        }
      }
    },

    // 归档会话消息（清空上下文）
    archiveSessionMessages(sessionId) {
      const session = this.chatSessions.find(s => s.id === sessionId)
      if (session) {
        // 保存当前标题和搜索状态
        const currentTitle = session.title
        const searchEnabled = session.searchEnabled
        
        // 将当前消息标记为已归档
        if (Array.isArray(session.messages)) {
          session.messages.forEach(msg => {
            msg.archived = true
          })
        }
        
        // 添加一个分隔消息
        session.messages.push({
          id: uid(),
          role: 'system',
          content: '--- 上下文已清空 ---',
          isContextDivider: true,
          timestamp: Date.now()
        })
        
        session.updatedAt = Date.now()
        
        // 确保标题和搜索状态不变
        session.title = currentTitle
        session.searchEnabled = searchEnabled
        
        if (this.currentSession?.id === sessionId) {
          this.currentSession = JSON.parse(JSON.stringify(session))
        }
      }
    },

    // 添加消息到当前会话
    addMessageToCurrentSession(message) {
      if (this.currentSession) {
        this.currentSession.messages.push(message)
        this.currentSession.updatedAt = Date.now()
        const index = this.chatSessions.findIndex(s => s.id === this.currentSession.id)
        if (index > -1) {
          this.chatSessions[index] = this.currentSession
        }
      }
    },

    // 设置当前助手
    setSelectedAssistant(assistantId) {
      this.selectedAssistant = assistantId;
      const assistant = this.assistants.find(a => a.id === assistantId);
      if (assistant && assistant.last_session_id) {
        const sessionToLoad = this.chatSessions.find(s => s.id === assistant.last_session_id);
        if (sessionToLoad) {
          this.loadSession(sessionToLoad);
          return;
        }
      }
      const sessions = this.getSessionsForCurrentAssistant();
      if (sessions.length > 0) {
        this.loadSession(sessions[0]);
      } else {
        this.currentSession = null;
      }
    },

    // 添加助手
    addAssistant(assistant) {
      this.assistants.push(assistant);
    },

    // 更新助手的Prompt
    updateAssistant(assistantId, params) {
      const assistant = this.assistants.find(a => a.id === assistantId);
      if (assistant) {
        assistant.prompt = params.prompt;
        assistant.name = params.name;
      }
    },

    deleteAssistant(assistantId) {
      // Remove the assistant from the list
      this.assistants = this.assistants.filter(a => a.id !== assistantId);
      // Remove all chat sessions associated with this assistant
      this.chatSessions = this.chatSessions.filter(session => session.assistantId !== assistantId);
      if(this.currentSession?.assistantId === assistantId){
        this.currentSession = null;
      }
      
      // Reinitialize chat sessions to ensure at least one assistant exists
      this.initChatSessions();
    },

    clearSessionsForAssistant(assistantId) {
      // Remove all chat sessions associated with this assistant
      this.chatSessions = this.chatSessions.filter(session => session.assistantId !== assistantId);
      if(this.currentSession?.assistantId === assistantId){
        this.currentSession = null
      }
    }
  }
}) 