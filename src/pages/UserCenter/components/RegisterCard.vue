<template>
      <q-card-section class="column gap-sm">
        <div class="text-h2 q-py-lg q-mb-md flex flex-center">注册账号</div>
        
        <q-form
          ref="formRef"
          @submit="handleSubmit"
          class="column gap-sm"
        >
          <!-- 用户名输入 -->
          <q-input
            v-model="form.username"
            :rules="rules.username"
            :disable="loading"
            label="用户名"
            hide-bottom-space
            lazy-rules
            class="border radius-xs overflow-hidden"
          >
            <template #prepend>
              <q-icon name="person" right />
            </template>
          </q-input>
  
          <!-- 邮箱输入 -->
          <q-input
            v-model="form.email"
            :rules="rules.email"
            :disable="loading"
            label="邮箱"
            type="email"
            hide-bottom-space
            lazy-rules
            class="border radius-xs overflow-hidden"
          >
            <template #prepend>
              <q-icon name="email" right />
            </template>
          </q-input>
  
          <!-- 密码输入 -->
          <PasswordInput
            v-model="form.password"
            :rules="rules.password"
            :disable="loading"
            label="密码"
          />
  
          <!-- 确认密码 -->
          <PasswordInput
            v-model="form.confirmPassword"
            :rules="[
              ...rules.password,
              val => val === form.password || '两次输入的密码不一致'
            ]"
            :disable="loading"
            label="确认密码"
          />
  
          <!-- 提交按钮 -->
          <q-btn
            :loading="loading"
            type="submit"
            color="primary"
            class="full-width"
            label="注册"
          />
        </q-form>
        <q-separator spaced class="op-5 full-width" />
        <q-btn
            color="info"
            icon="mdi-server-network"
            label="设置服务器地址"
            unelevated
            class="full-width"
            @click="$emit('set-server')"
        />
        <!-- 已有账号提示 -->
        <div class="text-left">
            已有账号？
            <router-link
            to="/login"
            class="text-primary"
            >
            立即登录
            </router-link>
        </div>
      </q-card-section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import PasswordInput from './PasswordInput.vue';
  
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['submit', 'set-server']);
  const formRef = ref(null);
  
  const handleSubmit = async () => {
    const isValid = await formRef.value.validate();
    if (isValid) {
      emit('submit');
    }
  };
  </script>
  
  <style scoped>
  .register-card {
    width: 420px;
    max-width: 100%;
  }
  </style>