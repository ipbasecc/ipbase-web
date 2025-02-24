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
              <div class="text-h6 q-mb-md">{{ currentProviderName }}</div>
              
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
              <template v-if="selectedProvider === 'custom'">
                <div class="row q-gutter-sm">
                  <q-chip
                    v-for="model in providerConfigs.custom.models"
                    :key="model"
                    removable
                    @remove="removeCustomModel(model)"
                  >
                    {{ model }}
                  </q-chip>
                </div>
                <q-input
                  v-model="customModel"
                  dense outlined
                  label="添加自定义模型"
                  class="col q-mt-sm"
                  @keyup.enter="addCustomModel"
                >
                  <template v-slot:after>
                    <q-btn flat dense icon="add" @click="addCustomModel" />
                  </template>
                </q-input>
              </template>
              <template v-else>
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
              </template>
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
              <template v-if="provider.id === 'custom'">
                <div class="row q-gutter-sm">
                  <q-chip
                    v-for="model in providerConfigs.custom.models"
                    :key="model"
                    removable
                    @remove="removeCustomModel(model)"
                  >
                    {{ model }}
                  </q-chip>
                </div>
                <q-input
                  v-model="customModel"
                  dense outlined
                  label="添加自定义模型"
                  class="col q-mt-sm"
                  @keyup.enter="addCustomModel"
                >
                  <template v-slot:after>
                    <q-btn flat dense icon="add" @click="addCustomModel" />
                  </template>
                </q-input>
              </template>
              <template v-else>
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
              </template>
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

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const splitterModel = ref(25) // 左侧宽度比例
const showApiKey = ref(false)
const customModel = ref('')
const customProviderModel = ref('')
const providers = ref(defaultProviders)
const selectedProvider = ref(null)
const showAddModelDialog = ref(false)
const showDropdown = ref(false)
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
        active: false
      }
    ])
  )
)

// 从props初始化配置
const initializeConfigs = () => {
  // 用props中的值覆盖默认配置
  Object.keys(providerConfigs.value).forEach(providerId => {
    if (props.modelValue[providerId]) {
      providerConfigs.value[providerId] = {
        ...providerConfigs.value[providerId],
        ...props.modelValue[providerId]
      }
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
  // 如果props中有当前选中的provider，则选中它
  if (props.modelValue.provider) {
    selectedProvider.value = props.modelValue.provider
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

const addCustomModel = () => {
  if (customModel.value.trim()) {
    const config = providerConfigs.value.custom
    if (!config.models.includes(customModel.value)) {
      config.models.push(customModel.value)
    }
    customModel.value = ''
  }
}

const removeCustomModel = (model) => {
  const config = providerConfigs.value.custom
  const index = config.models.indexOf(model)
  if (index > -1) {
    config.models.splice(index, 1)
  }
}

const handleSave = () => {
  // 找到激活的供应商
  const activeProvider = Object.entries(providerConfigs.value)
    .find(([id, config]) => config.active && isProviderConfigValid({ id }))

  if (activeProvider) {
    const [providerId, config] = activeProvider
    
    // 创建新的配置对象，保留原有配置
    const newConfig = {
      ...props.modelValue,  // 保留原有配置
      provider: providerId,  // 更新当前选中的provider
      [providerId]: {  // 更新特定provider的配置
        ...props.modelValue[providerId],  // 保留该provider的原有配置
        ...config  // 更新修改的部分
      }
    }

    // 更新modelValue
    emit('update:modelValue', newConfig)
  }
  
  emit('save')
}

const isModelSelected = (providerId, modelId) => {
  return providerConfigs.value[providerId]?.models.includes(modelId)
}

// 检查模型是否激活
const isModelActive = (modelId) => {
  const config = providerConfigs.value[selectedProvider.value]
  return config.activeModels?.includes(modelId) ?? false
}

// 切换模型激活状态
const toggleModelActive = (modelId) => {
  const config = providerConfigs.value[selectedProvider.value]
  if (!config.activeModels) {
    config.activeModels = []
  }
  
  const index = config.activeModels.indexOf(modelId)
  if (index === -1) {
    // 激活模型
    config.activeModels.push(modelId)
  } else {
    // 如果是最后一个激活的模型，不允许取消激活
    if (config.activeModels.length === 1) {
      return
    }
    // 取消激活
    config.activeModels.splice(index, 1)
  }
}

// 添加并激活模型
const addAndActivateModel = () => {
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
  const config = providerConfigs.value[selectedProvider.value]
  if (isLastActiveModel(selectedProvider.value, modelId)) {
    return
  }
  const index = config.models.indexOf(modelId)
  if (index > -1) {
    config.models.splice(index, 1)
    // 同时从激活列表中移除
    const activeIndex = config.activeModels?.indexOf(modelId)
    if (activeIndex > -1) {
      config.activeModels.splice(activeIndex, 1)
    }
  }
}

// 获取当前供应商的自定义模型
const customProviderModels = computed(() => {
  const provider = currentProvider.value
  if (!provider) return []
  
  const config = providerConfigs.value[provider.id]
  if (!config) return []

  return config.models
    .filter(modelId => !provider.models.some(m => m.id === modelId))
    .map(modelId => ({
      id: modelId,
      name: modelId,
      default: false
    }))
})

// 获取当前供应商所有可用的模型（包括预设和自定义）
const availableModels = computed(() => {
  const provider = currentProvider.value
  if (!provider) return []
  
  const config = providerConfigs.value[provider.id]
  if (!config) return []

  if (provider.id === 'ollama') {
    return config.models.map(model => ({
      id: model.name,
      name: model.name,
      default: true
    }))
  }

  // 合并预设模型和自定义模型
  const presetModels = provider.models || []
  const customModels = config.models
    .filter(modelId => !provider.models.some(m => m.id === modelId))
    .map(modelId => ({
      id: modelId,
      name: modelId,
      default: false
    }))

  return [...presetModels, ...customModels]
})

// 移除模型
const removeModel = (model) => {
  const config = providerConfigs.value[selectedProvider.value]
  if (isLastActiveModel(selectedProvider.value, model)) {
    return
  }
  const index = config.models.indexOf(model)
  if (index > -1) {
    config.models.splice(index, 1)
  }
}

// 添加供应商自定义模型并关闭弹窗
const addProviderModelAndClose = () => {
  if (customProviderModel.value.trim()) {
    addProviderModel()
    showAddModelDialog.value = false
    customProviderModel.value = ''
  }
}

// 添加供应商自定义模型
const addProviderModel = () => {
  const modelId = customProviderModel.value.trim()
  if (!modelId) return

  const config = providerConfigs.value[selectedProvider.value]
  if (!config.models.includes(modelId)) {
    config.models.push(modelId)
  }
}

// 更新选中的模型
const updateSelectedModels = (models) => {
  if (!selectedProvider.value) return
  const config = providerConfigs.value[selectedProvider.value]
  config.models = models.map(model => model.id)
}

// 创建新模型
const createNewModel = (val, done) => {
  if (val.trim() === '') {
    done()
    return
  }

  const modelId = val.trim()
  const config = providerConfigs.value[selectedProvider.value]
  
  // 检查是否已存在于预设模型中
  const existingModel = availableModels.value.find(m => m.id === modelId)
  if (!existingModel) {
    // 添加到可用模型列表
    availableModels.value.push({
      id: modelId,
      name: modelId,
      default: false
    })
  }
  
  // 添加到已选模型列表
  if (!config.models.includes(modelId)) {
    config.models.push(modelId)
  }
  
  done()
}

// 过滤模型列表
const filterModels = (val, update) => {
  // 不显示下拉列表，让用户专注于输入
  update(() => {
    // 保持原有列表不变
  })
}

// 选择模型
const selectModel = (model) => {
  const config = providerConfigs.value[selectedProvider.value]
  if (!config.models.includes(model.id)) {
    config.models.push(model.id)
  }
  showDropdown.value = false
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

<style scoped>
.q-splitter {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.radius-default {
  border-radius: 4px;
}
</style> 