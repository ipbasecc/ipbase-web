<template>
    <!-- 未确认状态 -->
    <EmailConfirmation
      v-if="!me.confirmed"
      :app-name="appName"
    />
    
    <!-- 登录状态 -->
    <LoginProgress
      v-else
      :loading="loading"
      :error="error"
    />
    
    <!-- 错误提示 -->
    <ErrorAlert
      v-if="error"
      :error="error"
      @retry="handleRetry"
    />
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { useLoginStep } from '../hooks/useLoginStep';
  import EmailConfirmation from './EmailConfirmation.vue';
  import LoginProgress from './LoginProgress.vue';
  import ErrorAlert from './ErrorAlert.vue';
  
  const props = defineProps({
    me: {
      type: Object,
      required: true
    },
    form: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['loginComplete']);
  
  const appName = ref('易乎APP');
  const loading = ref(false);
  const error = ref(null);
  
  const { initLogin } = useLoginStep({
    email: props.form?.email,
    password: props.form?.password,
    onSuccess: () => emit('loginComplete'),
    onError: (err) => error.value = err
  });
  
  const handleRetry = async () => {
    error.value = null;
    await initLogin();
  };
  
  watch(
    () => props.me?.mm_profile,
    async () => {
      loading.value = true;
      try {
        console.log(props.me);
        
        if(props.me?.mm_profile){
          await initLogin();
        }
      } finally {
        loading.value = false;
      }
    },
    { immediate: true }
  );
  </script>
  
  <style scoped>
  .login-step-card {
    width: 420px;
  }
  </style>