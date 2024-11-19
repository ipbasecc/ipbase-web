<template>
    <div class="column items-center q-pa-md">
      <q-icon name="error" color="negative" size="4em" />
      
      <div class="text-h6 q-mt-md text-negative">
        {{ errorMessage }}
      </div>
  
      <div class="text-body2 q-mt-sm text-grey">
        {{ errorDescription }}
      </div>
  
      <div class="row q-gutter-sm q-mt-lg">
        <q-btn
          v-if="showRelogin"
          flat
          color="primary"
          label="重新登录"
          @click="$emit('relogin')"
        />
        
        <q-btn
          v-if="connectRefused"
          flat
          color="primary"
          label="设置服务器"
          @click="$emit('set-server')"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    errorType: {
      type: String,
      required: true
    },
    connectRefused: {
      type: Boolean,
      default: false
    }
  });
  
  const errorMessages = {
    ValidationError: '验证失败',
    Unauthorized: '用户名或密码错误',
    ERR_NETWORK: '网络连接失败',
    noneConfirmed: '账号未确认',
    UNKNOWN_ERROR: '未知错误'
  };
  
  const errorDescriptions = {
    ValidationError: '请检查输入信息是否正确',
    Unauthorized: '请检查用户名和密码',
    ERR_NETWORK: '请检查网络连接或服务器设置',
    noneConfirmed: '请先确认您的账号',
    UNKNOWN_ERROR: '请稍后重试或联系管理员'
  };
  
  const errorMessage = computed(() => errorMessages[props.errorType] || '未知错误');
  const errorDescription = computed(() => errorDescriptions[props.errorType] || '发生未知错误，请稍后重试');
  const showRelogin = computed(() => props.errorType !== 'ERR_NETWORK');
  
  defineEmits(['relogin', 'set-server']);
  </script>