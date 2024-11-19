<template>
    <div class="column items-center q-pa-md">
      <div class="text-h6 q-mb-md">登录中...</div>
      
      <div class="row items-center q-gutter-x-md">
        <q-spinner v-if="strapiLoading" color="primary" size="2em" />
        <span :class="{ 'text-positive': !strapiLoading }">
          Strapi {{ strapiLoading ? '验证中' : '验证完成' }}
        </span>
      </div>
  
      <div class="row items-center q-gutter-x-md q-mt-sm">
        <q-spinner v-if="mmLoading" color="primary" size="2em" />
        <span :class="{ 'text-positive': !mmLoading }">
          Mattermost {{ mmLoading ? '验证中' : '验证完成' }}
        </span>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    strapiLoading: {
      type: Boolean,
      default: false
    },
    mmLoading: {
      type: Boolean,
      default: false
    }
  });
  </script>