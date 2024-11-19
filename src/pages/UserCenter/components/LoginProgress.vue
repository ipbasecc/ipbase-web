<template>
    <q-card-section class="login-progress">
      <div class="row items-center q-gutter-x-md">
        <q-spinner
          v-if="loading"
          color="primary"
          size="2em"
        />
        <span>
          {{ loading ? '用户创建成功，正在登录，请稍后...' : '登录成功！' }}
        </span>
      </div>
    </q-card-section>
  </template>
  
  <script setup>
  defineProps({
    loading: {
      type: Boolean,
      default: false
    }
  });
  </script>