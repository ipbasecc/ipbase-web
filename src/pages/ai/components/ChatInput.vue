<template>
  <div class="chat-input">
    <q-input
      v-model="localMessage"
      type="text"
      autogrow
      outlined
      :loading="loading"
      :disable="loading"
      placeholder="输入消息..."
      :rows="3"
      @keypress.enter.prevent="onEnter"
      hide-bottom-space
    >
      <template v-slot:append>
        <q-btn
          flat dense class="border" padding="xs md"
          icon="send"
          :loading="loading"
          :disable="!localMessage.trim()"
          @click="onSend"
        />
      </template>
    </q-input>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ChatInput',
  
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'send'],

  setup (props, { emit }) {
    const localMessage = ref(props.modelValue)

    watch(() => props.modelValue, (newVal) => {
      localMessage.value = newVal
    })

    const onSend = () => {
      if (localMessage.value.trim() && !props.loading) {
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

    return {
      localMessage,
      onSend,
      onEnter
    }
  }
}
</script>

<style scoped>
.chat-input {
  width: 100%;
}
</style> 