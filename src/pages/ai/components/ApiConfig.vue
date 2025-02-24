<template>
  <q-card flat bordered class="column" :class="$q.screen.gt.xs ? 'w-min-800 h-600' : 'fit'">
    <q-card-section class="border-bottom">
      <div class="text-h6">API 供应商配置</div>
    </q-card-section>

    <!-- 桌面端布局 -->
    <q-card-section class="q-pa-none q-space" v-if="$q.screen.gt.xs">
      <q-splitter v-model="splitterModel" class="fit">
        <!-- 左侧供应商列表 -->
        <template v-slot:before>
          <q-scroll-area class="fit">
            <q-list class="column gap-xs q-pa-md" dense>
              <q-item
                v-for="provider in providers"
                :key="provider.id"
                clickable
                :active="selectedProvider === provider.id"
                @click="selectedProvider = provider.id"
                v-ripple
                class="radius-xs"
                :class="selectedProvider === provider.id ? $q.dark.mode ? 'bg-grey-10 border' : 'bg-grey-3 border' : 'border-placeholder'"
              >
                <q-item-section>
                  <q-item-label>{{ provider.name }}</q-item-label>
                  <q-item-label caption :class="isProviderActive(provider) ? 'text-primary' : 'op-5'">
                    {{ isProviderActive(provider) ? '已配置' : '未配置' }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-toggle dense
                    v-model="providerConfigs[provider.id].active"
                    :disable="!isProviderConfigValid(provider)"
                    @click.stop
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </template>

        <!-- 右侧配置详情 -->
        <template v-slot:after>
          <q-scroll-area class="fit">
            <div class="q-pa-md" v-if="selectedProvider">
              <div class="text-h6 q-mb-md" :class="currentProvider?.tip ? 'no-margin' : ''">{{ currentProviderName }}</div>
              <div v-if="currentProvider?.tip" class="text-subtitle2 q-mb-lg text-orange">{{ currentProvider?.tip }}</div>
              <q-input
                v-model="providerConfigs[selectedProvider].endpoint"
                dense outlined
                label="API Endpoint"
                :placeholder="currentProvider?.defaultEndpoint"
                class="q-mb-md"
              />
              
              <q-input
                v-model="providerConfigs[selectedProvider].apiKey"
                dense outlined
                label="API Key"
                class="q-mb-md"
                :type="showApiKey ? 'text' : 'password'"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showApiKey ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showApiKey = !showApiKey"
                  />
                </template>
              </q-input>

              <div class="text-subtitle2 q-mb-sm">可用模型</div>
              <div class="column q-gutter-y-md">
                <div class="row items-center border radius-xs q-pa-xs" style="min-height: 42px;">
                  <q-chip v-for="modelId in providerConfigs[selectedProvider].models"
                    :key="modelId"
                    :label="modelId"
                    removable square clickable
                    class="border q-ma-xs"
                    :color="isModelActive(modelId) ? 'primary' : undefined"
                    :text-color="isModelActive(modelId) ? 'white' : undefined"
                    @click="toggleModelActive(modelId)"
                    @remove="removeProviderModel(modelId)"
                    :disable="isLastActiveModel(selectedProvider, modelId)"
                  />
                  <q-input 
                    v-if="showModelInput"
                    v-model="customProviderModel" 
                    type="text"
                    aria-placeholder="请输入模型名称"
                    borderless 
                    dense
                    autofocus
                    class="q-px-xs col"
                    style="min-width: 100px;"
                    @keyup.enter="handleAddModel"
                    @blur="handleInputBlur"
                  />
                  <span v-else class="cursor-pointer q-pa-sm text-primary" @click="showModelInput = true" >添加模型</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center q-pa-md text-grey">
              请选择一个供应商进行配置
            </div>
          </q-scroll-area>
        </template>
      </q-splitter>
    </q-card-section>

    <!-- 移动端布局 -->
    <q-card-section class="q-pa-none" v-else>
      <q-list class="q-pa-none">
        <q-expansion-item
          v-for="provider in providers"
          :key="provider.id"
          :label="provider.name"
          :caption="isProviderActive(provider) ? '已配置' : '未配置'"
          :class="isProviderActive(provider) ? 'text-primary' : ''"
          dense-toggle
          class="border-bottom"
        >
          <q-card>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle2">启用状态</div>
                <q-toggle dense
                  v-model="providerConfigs[provider.id].active"
                  :disable="!isProviderConfigValid(provider)"
                />
              </div>
              
              <q-input
                v-model="providerConfigs[provider.id].endpoint"
                dense outlined
                label="API Endpoint"
                :placeholder="provider.defaultEndpoint"
                class="q-mb-md"
              />
              
              <q-input
                v-model="providerConfigs[provider.id].apiKey"
                dense outlined
                label="API Key"
                class="q-mb-md"
                :type="showApiKey ? 'text' : 'password'"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showApiKey ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showApiKey = !showApiKey"
                  />
                </template>
              </q-input>

              <div class="text-subtitle2 q-mb-sm">可用模型</div>
              <div class="column q-gutter-y-md">
                <div class="row items-center wrap border radius-xs q-px-xs" style="min-height: 42px;">
                  <q-chip v-for="modelId in providerConfigs[provider.id].models"
                    :key="modelId"
                    :label="modelId"
                    removable square clickable
                    class="border q-ma-xs"
                    :color="isModelActive(modelId) ? 'primary' : undefined"
                    :text-color="isModelActive(modelId) ? 'white' : undefined"
                    @click="toggleModelActive(modelId)"
                    @remove="removeProviderModel(modelId)"
                    :disable="isLastActiveModel(provider.id, modelId)"
                  />
                  <q-input 
                    v-if="showModelInput && selectedProvider === provider.id"
                    v-model="customProviderModel" 
                    type="text"
                    aria-placeholder="请输入模型名称"
                    borderless 
                    dense
                    autofocus
                    class="q-px-xs col"
                    style="min-width: 100px;"
                    @keyup.enter="handleAddModel"
                    @blur="handleInputBlur"
                  />
                  <span v-else class="cursor-pointer q-pa-sm" @click="showModelInput = true; selectedProvider = provider.id" >添加模型</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right" :class="!$q.screen.gt.xs ? 'q-mt-lg' : 'border-top'">
      <q-btn flat dense label="取消" v-close-popup />
      <q-space />
      <q-btn dense color="primary" label="保存" @click="handleSave" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { defaultProviders } from '../config/apiProviders'
import { useAIStore } from '../../../stores/ai'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save'])
const aiStore = useAIStore()

const splitterModel = ref(25) // 左侧宽度比例
const showApiKey = ref(false)
const customProviderModel = ref('')
const providers = ref(defaultProviders)
const selectedProvider = ref(null)
const showModelInput = ref(false)

// 初始化供应商配置
const providerConfigs = ref(
  Object.fromEntries(
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
  )
)

// 从store初始化配置
const initializeConfigs = () => {
  Object.keys(providerConfigs.value).forEach(providerId => {
    providerConfigs.value[providerId] = {
      ...providerConfigs.value[providerId],
      ...aiStore.providers[providerId]
    }
  })
}

// 监听props变化
watch(() => props.modelValue, () => {
  initializeConfigs()
}, { deep: true })

// 监听选中的供应商变化
watch(selectedProvider, (newProviderId) => {
  if (newProviderId) {
    const provider = providers.value.find(p => p.id === newProviderId)
    const config = providerConfigs.value[newProviderId]
    
    // 如果endpoint为空，使用默认endpoint
    if (!config.endpoint && provider?.defaultEndpoint) {
      config.endpoint = provider.defaultEndpoint
    }
    
    // 如果是Ollama，尝试获取模型列表
    if (newProviderId === 'ollama' && config.endpoint) {
      const baseEndpoint = config.endpoint.replace(/\/api\/chat$/, '')
      fetchOllamaModels(baseEndpoint)
    }
  }
})

// 监听Ollama endpoint的变化
watch(
  () => providerConfigs.value.ollama?.endpoint,
  async (newEndpoint, oldEndpoint) => {
    if (newEndpoint && newEndpoint !== oldEndpoint) {
      await fetchOllamaModels(newEndpoint)
    }
  }
)

// 监听API Key的变化
const watchProviderApiKey = (providerId) => {
  watch(
    () => providerConfigs.value[providerId].apiKey,
    (newApiKey) => {
      if (newApiKey && providerId !== 'custom') {
        const provider = providers.value.find(p => p.id === providerId)
        const config = providerConfigs.value[providerId]
        
        // 当API Key被填写且没有选择模型时，自动选择默认模型
        if (config.models.length === 0 && provider?.models) {
          const defaultModels = provider.models
            .filter(model => model.default)
            .map(model => model.id)
          config.models = defaultModels
          config.activeModels = [...defaultModels]
        }
      }
    }
  )
}

// 组件挂载时初始化配置
onMounted(() => {
  initializeConfigs()
  providers.value.forEach(provider => {
    watchProviderApiKey(provider.id)
  })
  // 如果store中有当前选中的provider，则选中它
  if (aiStore.provider) {
    selectedProvider.value = aiStore.provider
  } else {
    // 否则选中第一个provider
    selectedProvider.value = providers.value[0].id
  }
})

// 计算属性：当前选中的供应商信息
const currentProvider = computed(() => 
  providers.value.find(p => p.id === selectedProvider.value)
)

const currentProviderName = computed(() => 
  currentProvider.value?.name || ''
)

// 判断供应商是否已配置
const isProviderActive = (provider) => {
  const config = providerConfigs.value[provider.id]
  if (!config) return false
  
  if (provider.id === 'ollama') {
    return config.endpoint && config.endpoint.trim() !== '' && config.models.length > 0
  }
  return config.endpoint && config.apiKey && config.models.length > 0
}

const handleSave = () => {
  // 更新所有供应商的配置
  Object.entries(providerConfigs.value).forEach(([id, config]) => {
    aiStore.updateProviderConfig(id, config)
  })

  // 获取当前激活的供应商列表
  const activeProviders = Object.entries(providerConfigs.value)
    .filter(([id, config]) => config.active && isProviderConfigValid({ id }))
    .map(([id]) => id)

  if (activeProviders.length === 0) {
    // 如果没有可用的供应商，清空选择
    aiStore.setProvider('')
    aiStore.setModel('')
  } else {
    const currentProvider = aiStore.provider
    const currentModel = aiStore.model

    if (activeProviders.includes(currentProvider)) {
      // 当前供应商仍然可用
      const providerConfig = providerConfigs.value[currentProvider]
      if (!providerConfig.activeModels.includes(currentModel)) {
        // 当前模型不可用，选择第一个可用模型
        if (providerConfig.activeModels.length > 0) {
          aiStore.setModel(providerConfig.activeModels[0])
        }
      }
    } else {
      // 当前供应商不可用，选择第一个可用供应商
      const firstProvider = activeProviders[0]
      aiStore.setProvider(firstProvider)
      
      // 选择该供应商的第一个可用模型
      const firstProviderConfig = providerConfigs.value[firstProvider]
      if (firstProviderConfig.activeModels.length > 0) {
        aiStore.setModel(firstProviderConfig.activeModels[0])
      }
    }
  }
  
  aiStore.showConfig = false
}

// 检查模型是否激活
const isModelActive = (modelId) => {
  const config = providerConfigs.value[selectedProvider.value]
  return config.activeModels?.includes(modelId) ?? false
}

// 切换模型激活状态
const toggleModelActive = (modelId) => {
  aiStore.toggleModelActive(selectedProvider.value, modelId)
  const config = providerConfigs.value[selectedProvider.value]
  config.activeModels = [...aiStore.providers[selectedProvider.value].activeModels]
}

// 检查是否是最后一个激活的模型
const isLastActiveModel = (providerId, modelId) => {
  const config = providerConfigs.value[providerId]
  if (!config.activeModels) {
    config.activeModels = [modelId]
    return true
  }
  return config.activeModels.length === 1 && config.activeModels[0] === modelId
}

// 移除模型
const removeProviderModel = (modelId) => {
  aiStore.removeModel(selectedProvider.value, modelId)
  
  // 同步本地状态
  const config = providerConfigs.value[selectedProvider.value]
  const storeConfig = aiStore.providers[selectedProvider.value]
  config.models = [...storeConfig.models]
  config.activeModels = [...storeConfig.activeModels]
}

const handleAddModel = () => {
  if (!customProviderModel.value.trim()) return

  const modelId = customProviderModel.value.trim()
  const config = providerConfigs.value[selectedProvider.value]
  
  // 添加到模型列表
  if (!config.models.includes(modelId)) {
    config.models.push(modelId)
  }
  
  // 激活新添加的模型
  if (!config.activeModels) {
    config.activeModels = []
  }
  if (!config.activeModels.includes(modelId)) {
    config.activeModels.push(modelId)
  }
  
  // 清空输入
  customProviderModel.value = ''
}

const handleInputBlur = () => {
  showModelInput.value = false
}

// 判断供应商配置是否有效
const isProviderConfigValid = (provider) => {
  const config = providerConfigs.value[provider.id]
  if (!config) return false
  
  if (provider.id === 'ollama') {
    return config.endpoint && config.endpoint.trim() !== ''
  }
  return config.endpoint && config.endpoint.trim() !== '' && config.apiKey && config.apiKey.trim() !== ''
}

// 获取Ollama可用模型列表
const fetchOllamaModels = async (endpoint) => {
  try {
    const response = await fetch(`${endpoint}/api/tags`)
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models')
    }
    const data = await response.json()
    
    // 更新Ollama的模型列表，统一数据结构为字符串数组
    const ollamaConfig = providerConfigs.value.ollama
    if (Array.isArray(data.models)) {
      // 将模型列表转换为与其他provider相同的字符串数组格式
      ollamaConfig.models = data.models.map(model => model.name)
      
      // 如果当前没有选择的模型，自动选择第一个
      if (ollamaConfig.models.length > 0 && (!ollamaConfig.activeModels || ollamaConfig.activeModels.length === 0)) {
        ollamaConfig.activeModels = [ollamaConfig.models[0]]
      }
    }
  } catch (error) {
    console.error('Error fetching Ollama models:', error)
    // 清空模型列表
    providerConfigs.value.ollama.models = []
    providerConfigs.value.ollama.activeModels = []
  }
}
</script>