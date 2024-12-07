<template>
  <q-card-section class="column gap-sm">
    <div class="text-h2 q-py-lg q-mb-md flex flex-center">{{ $t('register') }}</div>

    <q-form ref="formRef" @submit="handleSubmit" class="column gap-sm">
      <!-- 用户名输入 -->
      <q-input v-model="localForm.username" :rules="rules.username" :disable="loading" :label="$t('username')" hide-bottom-space
        lazy-rules class="border radius-xs overflow-hidden">
        <template #prepend>
          <q-icon name="person" right />
        </template>
      </q-input>

      <!-- 邮箱输入 -->
      <q-input v-model="localForm.email" :rules="rules.email" :disable="loading" :label="$t('email')" type="email" hide-bottom-space
        lazy-rules class="border radius-xs overflow-hidden">
        <template #prepend>
          <q-icon name="email" right />
        </template>
      </q-input>

      <!-- 密码输入 -->
      <PasswordInput v-model="localForm.password" :rules="rules.password" :disable="loading" :label="$t('password')" />

      <!-- 确认密码 -->
      <PasswordInput v-model="localForm.confirmPassword" :rules="[
        ...rules.password,
        val => val === localForm.password || $t('password_not_match')
      ]" :disable="loading" :label="$t('confirm_password')" />

      <!-- 提交按钮 -->
      <q-btn :loading="loading" type="submit" color="primary" class="full-width q-mt-xl" :label="$t('register')" />
    </q-form>
    <!-- <q-separator spaced class="op-5 full-width" /> -->
    <!-- <q-btn color="info" icon="mdi-server-network" :label="$t('set_server_address')" unelevated class="full-width"
      @click="$emit('set-server')" /> -->
    <!-- 已有账号提示 -->
    <div class="text-right">
      {{ $t('have_account') }}
      <router-link to="/login" class="text-primary">
        {{ $t('login_now') }}
      </router-link>
    </div>
  </q-card-section>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import PasswordInput from './PasswordInput.vue';
  import { uiStore } from 'src/hooks/global/useStore';

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

  const emit = defineEmits(['submit', 'set-server', 'update:form']);
  const formRef = ref(null);

  // Create local form data
  const localForm = computed({
    get: () => props.form,
    set: (newValue) => emit('update:form', newValue)
  });

  const handleSubmit = async () => {
    uiStore.logging = true;
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