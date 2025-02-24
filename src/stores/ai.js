import { defineStore } from 'pinia'
import { defaultProviders } from '../pages/ai/config/apiProviders'

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
    showConfig: false
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
    }
  }
}) 