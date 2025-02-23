<template>
  <div class="full-width row items-center q-gutter-x-md">
    <!-- API供应商选择 -->
    <div class="cursor-pointer hover-highlight">
      <span>{{ currentProviderName }}</span>
      <q-menu
        anchor="bottom left"
        self="top left"
        :offset="[0, 8]"
      >
        <q-list bordered dense class="q-pa-xs column gap-xs radius-sm">
          <q-item
            v-for="provider in availableProviders"
            :key="provider.id"
            clickable
            v-close-popup
            class="radius-xs"
            @click="selectProvider(provider)"
            :class="{ 'bg-primary': selectedProvider === provider.id }"
          >
            <q-item-section>
              <q-item-label>{{ provider.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>

    <!-- 模型选择 -->
    <div class="cursor-pointer hover-highlight">
      <span>{{ currentModelName }}</span>
      <q-menu
        anchor="bottom left"
        self="top left"
        :offset="[0, 8]"
      >
        <q-list bordered dense class="q-pa-xs column gap-xs radius-sm">
          <template v-if="availableModels.length">
            <q-item
              v-for="model in availableModels"
              :key="model.id"
              clickable
              v-close-popup
              class="radius-xs"
              @click="selectModel(model)"
              :class="{ 'bg-primary': selectedModel === model.id }"
            >
              <q-item-section>
                <q-item-label>{{ model.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-item>
              <q-item-section>
                <q-item-label class="text-grey">暂无可用模型</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </div>

    <q-space />
    <!-- API配置按钮 -->
    <q-icon name="settings" size="xs" class="cursor-pointer hover-highlight" @click="$emit('config')"  />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { defaultProviders } from '../config/apiProviders'

const props = defineProps({
  selectedProvider: {
    type: String,
    required: true
  },
  selectedModel: {
    type: String,
    required: true
  },
  apiConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:selectedProvider', 'update:selectedModel', 'config'])

// 获取可用的供应商列表（已配置且激活的）
const availableProviders = computed(() => {
  return defaultProviders.filter(provider => {
    const config = props.apiConfig[provider.id]
    if (!config || !config.active || !config.endpoint) return false
    
    // Ollama不需要apiKey
    if (provider.id === 'ollama') {
      return true
    }
    
    return config.apiKey
  })
})

// 获取当前供应商的可用模型
const availableModels = computed(() => {
  const provider = defaultProviders.find(p => p.id === props.selectedProvider)
  if (!provider) return []
  
  const config = props.apiConfig[props.selectedProvider]
  if (!config || !config.models.length || !config.activeModels?.length) return []

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
})

// 当前选中的供应商名称
const currentProviderName = computed(() => {
  const provider = availableProviders.value.find(p => p.id === props.selectedProvider)
  return provider?.name || '选择供应商'
})

// 当前选中的模型名称
const currentModelName = computed(() => {
  const model = availableModels.value.find(m => m.id === props.selectedModel)
  return model?.name || '选择模型'
})

// 选择供应商
const selectProvider = (provider) => {
  emit('update:selectedProvider', provider.id)
  
  // 从localStorage中读取配置
  const savedConfig = localStorage.getItem('aiChatConfig')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    if (config[provider.id] && config[provider.id].models?.length > 0) {
      // 如果有保存的模型，使用第一个保存的模型
      emit('update:selectedModel', config[provider.id].models[0])
    } else {
      // 否则使用当前供应商的第一个可用模型
      const firstAvailableModel = availableModels.value[0]
      if (firstAvailableModel) {
        emit('update:selectedModel', firstAvailableModel.id)
      }
    }
  }
}

// 选择模型
const selectModel = (model) => {
  emit('update:selectedModel', model.id)
  
  // 更新localStorage中的配置
  const savedConfig = localStorage.getItem('aiChatConfig')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    config.model = model.id
    localStorage.setItem('aiChatConfig', JSON.stringify(config))
  }
}
</script>
