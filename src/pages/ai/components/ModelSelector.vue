<template>
  <div class="model-selector">
    <q-btn
      class="full-width"
      flat
      :label="selectedModelName"
      :disable="!modelOptions.length"
    >
      <q-menu
        fit
        anchor="bottom left"
        self="top left"
        :offset="[0, 8]"
      >
        <q-list style="min-width: 200px" padding>
          <q-item-label header>{{ label }}</q-item-label>
          <template v-if="modelOptions.length">
            <q-item
              v-for="model in modelOptions"
              :key="model.id"
              clickable
              v-close-popup
              @click="toggleModel(model)"
              :active="isModelSelected(model.id)"
            >
              <q-item-section>
                <q-item-label>{{ model.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  v-if="multiple"
                  :model-value="isModelSelected(model.id)"
                  @update:model-value="toggleModel(model)"
                  :disable="isLastDefaultModel(model)"
                />
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
    </q-btn>
    
    <!-- 已选模型展示 -->
    <div class="q-mt-sm row q-gutter-x-sm q-gutter-y-xs items-center" v-if="multiple && selectedModels.length">
      <q-chip
        v-for="model in selectedModels"
        :key="model.id"
        removable
        @remove="toggleModel(model)"
        :disable="isLastDefaultModel(model)"
        dense
        size="sm"
      >
        {{ model.name }}
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  modelOptions: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: '选择模型'
  },
  multiple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 已选中的模型列表
const selectedModels = computed(() => {
  return props.modelOptions.filter(model => props.modelValue.includes(model.id))
})

// 显示在按钮上的文本
const selectedModelName = computed(() => {
  if (props.modelValue.length === 0) return props.label
  if (!props.multiple) return selectedModels.value[0]?.name || props.label
  return `已选 ${props.modelValue.length} 个模型`
})

// 检查模型是否被选中
const isModelSelected = (modelId) => {
  return props.modelValue.includes(modelId)
}

// 检查是否是最后一个默认模型
const isLastDefaultModel = (model) => {
  if (!model.default) return false
  const selectedDefaultModels = props.modelOptions
    .filter(m => m.default && props.modelValue.includes(m.id))
  return selectedDefaultModels.length === 1 && selectedDefaultModels[0].id === model.id
}

// 切换模型选择状态
const toggleModel = (model) => {
  if (isLastDefaultModel(model)) return

  let newValue
  if (props.multiple) {
    newValue = isModelSelected(model.id)
      ? props.modelValue.filter(id => id !== model.id)
      : [...props.modelValue, model.id]
  } else {
    newValue = [model.id]
  }
  
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.model-selector {
  width: 100%;
}
</style> 