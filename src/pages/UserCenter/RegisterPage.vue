<template>
  <ExtendWarpper>
    <q-card-section class="q-space">
      <RegisterCard v-if="step === 0" :loading="loading" v-model:agree="agree" :form="form" :rules="formRules" @submit="handleRegister"
        @set-server="setServer" />
      <CompleteCard v-else-if="step === 1" :count="count" :username="me?.username" @redirect="redirectNow" />
    </q-card-section>
    <AgreementCard v-model:showAgreement="showAgreement" @agreeAgreement="agreeAgreement" />
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
  // import LoginStepCard from './components/LoginStepCard.vue';
  import CompleteCard from './RegisterSteps/CompleteCard.vue';
  import ExtendWarpper from './ExtendWarpper.vue'
  import AgreementCard from 'src/components/VIewComponents/AgreementCard.vue'


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

  const agreeAgreementAt = ref();
  const showAgreement = ref(false);
  const agree = ref(false);
  const agreeAgreement = () => {
    showAgreement.value = false;
    agree.value = true;
    agreeAgreementAt.value = new Date();
    handleRegister();
  };
  // 注册处理
  const handleRegister = async () => {
    if(!agreeAgreementAt.value || !agree.value) {
      showAgreement.value = true;
      return;
    }
    try {
      if (loading.value) return;
      loading.value = true;

      await clearLocalDB("RegisterPage submitRegister event");
      const { data, error } = await register({
        email: form.email,
        password: form.password,
        username: form.username,
        agreeAgreementAt: agreeAgreementAt.value
      });

      if (error) {
        $q.notify({
          type: 'negative',
          message: error.message,
          position: 'top',
          timeout: 3000,
        });
      }
      if (data) {
        me.value = data.user;
        userStore.logged = true;
        userStore.needRefetch = true;
        step.value = 1;
        startCountdown();
      }

    } catch (error) {
      console.log('handleRegister error', error);
      handleError(error);
    } finally {
      loading.value = false;
    }
  };

  // 重定向处理
  const redirectNow = () => {
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
