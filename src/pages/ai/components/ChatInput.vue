<template>
  <q-item>
    <q-item-section avatar />
    <q-item-section>
      <q-input
        v-model="localMessage"
        type="text"
        autogrow
        outlined
        :disable="loading"
        placeholder="输入消息..."
        :rows="3"
        input-class="q-px-sm"
        @keypress.enter.prevent="onEnter"
        hide-bottom-space
      >
        <template v-slot:append>
          <q-btn
            :flat="!localMessage.trim()"
            icon="send"
            class="border"
            :class="{
              'text-primary': localMessage.trim()
            }"
            :disable="!localMessage.trim()"
            @click="onSend"
          />
        </template>
        <div v-if="loading" class="absolute-full flex flex-center">
          <q-spinner color="orange" size="sm" />
        </div>
      </q-input>
    </q-item-section>
  </q-item>
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