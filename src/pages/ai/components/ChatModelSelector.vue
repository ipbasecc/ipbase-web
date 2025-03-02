<template>
  <div class="q-space row items-center q-gutter-x-md">
    <!-- API配置按钮 -->
    <q-icon name="settings" size="xs" class="cursor-pointer hover-highlight" @click="aiStore.showConfig = true">
      <q-tooltip class="no-padding shadow-24">
        <q-card bordered class="q-px-md q-py-sm font-medium">
          配置API
        </q-card>
      </q-tooltip>
    </q-icon>
    <!-- API供应商选择 -->
    <div class="row items-center gap-xs no-wrap cursor-pointer hover-highlight" @click="providerHandler">
      <q-avatar v-if="currentProvider?.logo" size="26px" class="q-mr-xs">
        <q-img
          :src="currentProvider.logo"
          :ratio="1"
        />
      </q-avatar>
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
    <div v-if="currentProvider" class="cursor-pointer hover-highlight text-weight-bold text-positive">

      <span class="text-no-wrap">{{ currentModelName }}</span>
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
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { useAIStore } from '../../../stores/ai'

const aiStore = useAIStore()

const providerHandler = () => {  
  if (availableProviders.value?.length === 0) {
    aiStore.showConfig = true
  }
}
onMounted(async() => {
  await nextTick()
  console.log('aiStore.providers', aiStore.providers)
})
// 使用store中的getters
const availableProviders = computed(() => aiStore.availableProviders)
const availableModels = computed(() => aiStore.availableModels)
const currentProvider = computed(() => aiStore.currentProvider)
const currentModel = computed(() => aiStore.currentModel)

// 当前选中的供应商名称
const currentProviderName = computed(() => {
  return currentProvider.value?.name || '配置 AI 服务'
})

// 当前选中的模型名称
const currentModelName = computed(() => {
  return currentModel.value?.name || '选择 AI 模型'
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
