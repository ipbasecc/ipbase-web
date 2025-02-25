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
    // 聊天会话相关状态
    chatSessions: [],
    currentSession: null,
  }),

  getters: {
    // 获取可用的供应商列表
    availableProviders: (state) => {
      return defaultProviders.filter(provider => {
        const config = state.providers[provider.id]
        if (!config || !config.active || !config.endpoint) return false
        
        // 检查是否有可用的激活模型
        const hasActiveModels = Array.isArray(config.activeModels) && config.activeModels.length > 0
        
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
    }
  },

  actions: {
    // 初始化配置
    initConfig() {
      const savedConfig = localStorage.getItem('aiChatConfig')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        this.provider = config.provider || ''
        this.model = config.model || ''
        
        // 更新所有供应商配置
        Object.entries(config).forEach(([id, providerConfig]) => {
          if (this.providers[id]) {
            this.providers[id] = {
              ...this.providers[id],
              ...providerConfig,
              models: providerConfig.models || [],
              activeModels: providerConfig.activeModels || []
            }
          }
        })
      }
    },

    // 保存配置
    saveConfig() {
      const config = {
        provider: this.provider,
        model: this.model,
        ...this.providers
      }
      localStorage.setItem('aiChatConfig', JSON.stringify(config))
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
    initChatSessions() {
      const savedSessions = localStorage.getItem('aiChatSessions')
      if (savedSessions) {
        this.chatSessions = JSON.parse(savedSessions)
        if (this.chatSessions.length > 0) {
          this.currentSession = this.chatSessions[0]
        }
      }
    },

    // 保存聊天会话到localStorage
    saveChatSessions() {
      localStorage.setItem('aiChatSessions', JSON.stringify(this.chatSessions))
    },

    // 创建新会话
    createNewChat() {
      const newSession = {
        id: uid(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.chatSessions.unshift(newSession)
      this.currentSession = newSession
      this.saveChatSessions()
    },

    // 加载会话
    loadSession(session) {
      if (!session) return
      // 确保深层响应性
      this.currentSession = JSON.parse(JSON.stringify(session))
      this.saveChatSessions()
    },

    // 删除会话
    deleteSession(session) {
      const index = this.chatSessions.findIndex(s => s.id === session.id)
      if (index > -1) {
        this.chatSessions.splice(index, 1)
        if (this.currentSession?.id === session.id) {
          this.currentSession = this.chatSessions[0] || null
        }
        this.saveChatSessions()
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
        this.saveChatSessions()
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
        
        this.saveChatSessions()
      }
    },

    // 添加消息到当前会话
    addMessageToCurrentSession(message) {
      if (this.currentSession) {
        this.currentSession.messages.push(message)
        this.currentSession.updatedAt = Date.now()
        const index = this.chatSessions.findIndex(s => s.id === this.currentSession.id)
        if (index > -1) {
          this.chatSessions[index] = JSON.parse(JSON.stringify(this.currentSession))
        }
        this.saveChatSessions()
      }
    }
  }
}) 