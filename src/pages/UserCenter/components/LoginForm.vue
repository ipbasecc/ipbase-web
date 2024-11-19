<template>
    <q-form @submit.prevent="handleSubmit" class="column gap-sm">
      <div class="text-h2 q-py-lg q-mb-md flex flex-center">登录</div>
      
      <q-input
        v-model="form.identifier"
        :rules="[
            (val) => !!val || 'Email is missing',
            (val) =>
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
                val
            ) || '邮箱输入有误，请检查输入！',
        ]"
        label="用户名/邮箱"
        hide-bottom-space
        :disable="loading"
        class="border radius-xs overflow-hidden"
        >
        <template v-slot:prepend>
            <q-icon name="mdi-email-outline" size="sm" class="q-px-sm" />
        </template>
        </q-input>
  
      <q-input
        v-model="form.password"
        :rules="[(val) => !!val || '请输入账号密码!']"
        label="密码"
        type="password"
        hide-bottom-space
        :disable="loading"
        class="border radius-xs overflow-hidden"
        >
        <template v-slot:prepend>
            <q-icon name="mdi-lock-outline" size="sm" class="q-px-sm" />
        </template>
        </q-input>

  
      <q-btn
        :loading="loading"
        type="submit"
        color="primary"
        class="full-width"
        label="登录"
      />
      <q-separator spaced class="op-5 full-width" />
        <q-btn
            color="info"
            icon="mdi-server-network"
            label="设置服务器地址"
            unelevated
            class="full-width"
            @click="setServer()"
        />
        <RouterLink class="q-pr-xs q-mt-sm text-primary q-mt-xl" :to="`/register`"
            >没有账号？点此注册</RouterLink
        >
        <RouterLink class="q-pr-xs text-primary" :to="`/forgot-password`"
            >忘记密码？</RouterLink
        >
    </q-form>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['submit','setServer']);
  
  const form = reactive({
    identifier: '',
    password: ''
  });
  
  const handleSubmit = () => {
    emit('submit', { ...form });
  };
  const setServer = () => {
    emit('setServer');
  };
  </script>