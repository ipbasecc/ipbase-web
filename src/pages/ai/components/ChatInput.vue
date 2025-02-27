<template>
  <q-item>
    <q-item-section avatar />
    <q-item-section class="border q-pa-sm radius-sm">
      <div class="column no-wrap gap-xs">
        <q-input
          v-model="localMessage"
          type="text"
          autogrow
          dense
          borderless
          :disable="loading"
          placeholder="输入消息..."
          :rows="3"
          input-class="q-px-sm"
          @keypress.enter.prevent="onEnter"
          hide-bottom-space
        />
        <div class="row no-wrap items-center">
          <q-btn flat dense icon="mdi-plus" class="border" @click="aiStore.createNewChat()" />
          <q-space />
          <q-btn
            flat
            icon="send"
            class="border"
            :class="{
              'text-primary': localMessage.trim()
            }"
            :loading="loading"
            :disable="!localMessage.trim()"
            @click="onSend"
          />
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAIStore } from 'src/stores/ai'

const { modelValue, loading } = defineProps(['modelValue','loading'])
const emit = defineEmits(['update:modelValue', 'send'])
const aiStore = useAIStore()
const localMessage = ref(modelValue)

watch(() => modelValue, (newVal) => {
  localMessage.value = newVal
})

const onSend = () => {
  if (localMessage.value.trim() && !loading) {
    emit('send')
  }
}

const onEnter = (e) => {
  if (e.shiftKey) {
    return
  }
  onSend()
}

watch(localMessage, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>