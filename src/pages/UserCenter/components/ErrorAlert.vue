<template>
    <q-card-section class="error-alert">
      <div class="row items-center q-gutter-x-md text-negative">
        <q-icon name="error" />
        <span>{{ errorMessage }}</span>
      </div>
      <q-btn
        flat
        color="primary"
        label="重试"
        class="q-mt-sm"
        @click="$emit('retry')"
      />
    </q-card-section>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    error: {
      type: Error,
      required: true
    }
  });
  
  const errorMessage = computed(() => {
    const messages = {
      'NetworkError': '网络连接失败，请检查网络设置',
      'AuthError': '登录验证失败，请重试',
      'default': '登录过程中出现错误，请重试'
    };
    
    return messages[props.error.name] || props.error.message || messages.default;
  });
  
  defineEmits(['retry']);
  </script>