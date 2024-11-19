<template>
    <div class="column items-center q-pa-md">
      <q-icon name="check_circle" color="positive" size="4em" />
      <div class="text-h6 q-mt-md">登录成功</div>
      <div class="text-subtitle1 q-mt-sm">
        欢迎回来, {{ username }}
      </div>
      <div v-if="count" class="text-caption q-mt-sm">
        {{ count }}秒后自动跳转
      </div>
      <q-btn
        flat
        color="primary"
        label="立即跳转"
        class="q-mt-md"
        @click="$emit('redirect')"
      />
    </div>
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