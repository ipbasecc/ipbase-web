<template>
  <div class="q-space row items-center q-gutter-x-md">
    <!-- API供应商选择 -->
    <div class="cursor-pointer hover-highlight" @click="providerHandler">
      <span>{{ currentProviderName }}</span>
      <q-menu v-if="availableProviders.length > 0"
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
            :class="{ 'bg-primary': aiStore.provider === provider.id }"
          >
            <q-item-section>
              <q-item-label>{{ provider.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>

    <!-- 模型选择 -->
    <div v-if="currentProvider" class="cursor-pointer hover-highlight">
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
              :class="{ 'bg-primary': aiStore.model === model.id }"
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
    <q-icon name="settings" size="xs" class="cursor-pointer hover-highlight" @click="aiStore.showConfig = true" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAIStore } from '../../../stores/ai'

const aiStore = useAIStore()

const providerHandler = () => {  
  if (availableProviders.value?.length === 0) {
    aiStore.showConfig = true
  }
}

// 使用store中的getters
const availableProviders = computed(() => aiStore.availableProviders)
const availableModels = computed(() => aiStore.availableModels)
const currentProvider = computed(() => aiStore.currentProvider)
const currentModel = computed(() => aiStore.currentModel)

// 当前选中的供应商名称
const currentProviderName = computed(() => {
  return currentProvider.value?.name || '选择供应商'
})

// 当前选中的模型名称
const currentModelName = computed(() => {
  return currentModel.value?.name || '选择模型'
})

// 选择供应商
const selectProvider = (provider) => {
  aiStore.setProvider(provider.id)
}

// 选择模型
const selectModel = (model) => {
  aiStore.setModel(model.id)
}
</script>
