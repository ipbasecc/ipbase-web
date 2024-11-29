<template>
    <q-card-section class="column items-center">
      <!-- 成功图标 -->
      <q-icon
        name="check_circle"
        color="positive"
        size="4em"
        class="q-mb-md"
      />
      
      <!-- 成功消息 -->
      <div class="text-h6">
        {{ $t('register_success') }}
      </div>
      
      <!-- 用户名显示 -->
      <div class="text-subtitle1 q-mt-sm">
        {{ $t('welcome_to_join') }}, {{ username }}
      </div>
      
      <!-- 倒计时显示 -->
      <div 
        v-if="count" 
        class="text-caption q-mt-sm"
      >
        {{ $t('auto_redirect') }} {{ count }} {{ $t('seconds') }} {{ $t('redirect_now') }}
      </div>
      
      <!-- 立即跳转按钮 -->
      <q-btn
        flat
        color="primary"
        :label="$t('redirect_now')"
        class="q-mt-md"
        @click="$emit('redirect')"
      />
    </q-card-section>
  </template>
  
  <script setup>
  defineProps({
    username: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: null
    }
  });
  
  defineEmits(['redirect']);
  </script>
  
  <style scoped>
  .complete-card {
    width: 420px;
    max-width: 100%;
  }
  </style>