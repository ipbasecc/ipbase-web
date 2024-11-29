<template>
  <ExtendWarpper>
    <q-card-section class="q-space" :style="$q.screen.gt.sm ? 'order: 99;' : ''">
      <RegisterCard v-if="step === 0" :loading="loading" :form="form" :rules="formRules" @submit="handleRegister"
        @set-server="setServer" />
      <LoginStepCard v-else-if="step === 1" :me="me" :form="form" @login-complete="handleLoginComplete" />
      <CompleteCard v-else-if="step === 2" :count="count" @redirect="redirectNow" />
    </q-card-section>
  </ExtendWarpper>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { register } from 'src/api/strapi';
  import { uiStore, userStore } from 'src/hooks/global/useStore';
  import { useCountdown } from './hooks/useCountdown.js';
  import { useFormRules } from './hooks/useFormRules';
  import { useErrorHandler } from './hooks/useErrorHandler';
  import { clearLocalDB } from 'src/pages/team/hooks/useUser';

  // 组件导入
  import RegisterCard from './components/RegisterCard.vue';
  import LoginStepCard from './components/LoginStepCard.vue';
  import CompleteCard from './RegisterSteps/CompleteCard.vue';
  import ExtendWarpper from './ExtendWarpper.vue'

  // 状态初始化
  const router = useRouter();
  const $q = useQuasar();
  const { count, startCountdown } = useCountdown();
  const { handleError } = useErrorHandler($q);
  const formRules = useFormRules();

  const step = ref(0);
  const loading = ref(false);
  const me = ref(null);

  const form = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 注册处理
  const handleRegister = async () => {
    try {
      if (loading.value) return;
      loading.value = true;

      await clearLocalDB("RegisterPage submitRegister event");
      const { data } = await register({
        email: form.email,
        password: form.password,
        username: form.username
      });

      if (data.status_code === 400) {
        throw new Error(data.message);
      }
      if (data) {
        me.value = data.user;
        userStore.logged = true;
        userStore.needRefetch = true;
        step.value = 1;
      }

    } catch (error) {
      handleError(error);
    } finally {
      loading.value = false;
    }
  };

  // 登录完成处理
  const handleLoginComplete = () => {
    if (me.value?.confirmed) {
      step.value = 2;
      startCountdown();
    } else {
      step.value = 3;
    }
  };

  // 重定向处理
  const redirectNow = () => {
    userStore.needRefetch = true;
    router.push("/teams");
  };

  // 服务器设置
  const setServer = () => {
    uiStore.setServer = true;
  };

  // 生命周期
  onMounted(() => {
    if (localStorage.getItem("jwt")) {
      router.push("/teams");
    }
  });
</script>
