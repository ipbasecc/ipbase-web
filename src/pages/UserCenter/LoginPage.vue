<template>
  <ExtendWarpper>
    <q-card-section class="q-space" :style="$q.screen.gt.sm ? 'order: 99;' : ''">
      <template v-if="!hasError">
        <LoginForm v-if="!store.logged" :loading="isLoading" @submit="handleSubmit" @setServer="setServer" />

        <LoadingStatus v-else-if="start" :strapi-loading="strapi_loading" :mm-loading="mm_loading" />

        <LoginSuccess v-else-if="userStore.logged" :username="store.me?.username" :count="count"
          @redirect="redirectNow" />
      </template>

      <ErrorDisplay v-else :error-type="errorStats" :connect-refused="connect_refused" @relogin="reLogin"
        @set-server="setServer" />
    </q-card-section>
  </ExtendWarpper>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { authService } from 'src/services/auth.service';
  import useUserStore from 'src/stores/user';
  import { uiStore, userStore } from 'src/hooks/global/useStore';
  import { clearLocalDB } from 'src/pages/team/hooks/useUser';
  import { useFetchAvatar } from 'src/pages/Chat/hooks/useFetchAvatar';

  // 组件导入
  import LoginForm from './components/LoginForm.vue';
  import LoadingStatus from './components/LoadingStatus.vue';
  import LoginSuccess from './components/LoginSuccess.vue';
  import ErrorDisplay from './components/ErrorDisplay.vue';
  import ExtendWarpper from './ExtendWarpper.vue'

  // 常量定义
  const ERROR_TYPES = {
    VALIDATION: 'ValidationError',
    UNAUTHORIZED: 'Unauthorized',
    NETWORK: 'ERR_NETWORK',
    NONE_CONFIRMED: 'noneConfirmed'
  };

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_DURATION = 30 * 60 * 1000; // 30分钟

  // 状态初始化
  const router = useRouter();
  const $q = useQuasar();
  const store = useUserStore();

  const isLoading = ref(false);
  const identifier = ref('');
  const password = ref('');
  const hasError = ref(false);
  const errorStats = ref(null);
  const start = ref(false);
  const strapi_loading = ref(false);
  const mm_loading = ref(false);
  const count = ref(null);
  let timer = null;

  // 计算属性
  const connect_refused = computed(() => uiStore.serverResfused);
  const isLoggedIn = computed(() => {
    return !!localStorage.getItem('jwt') && !!localStorage.getItem('mmtoken');
  });

  // 登录尝试次数控制
  const loginAttempts = ref(0);
  const checkLoginAttempts = () => {
    const lockUntil = localStorage.getItem('loginLockUntil');
    if (lockUntil && parseInt(lockUntil) > Date.now()) {
      throw new Error(`账号已被锁定，请在${Math.ceil((parseInt(lockUntil) - Date.now()) / 60000)}分钟后重试`);
    }

    if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION;
      localStorage.setItem('loginLockUntil', lockUntil);
      throw new Error('登录尝试次数过多，请30分钟后再试');
    }
  };

  // 错误处理
  const handleError = (error) => {
    const errorHandlers = {
      [ERROR_TYPES.VALIDATION]: () => {
        errorStats.value = ERROR_TYPES.VALIDATION;
        hasError.value = true;
      },
      [ERROR_TYPES.UNAUTHORIZED]: () => {
        errorStats.value = ERROR_TYPES.UNAUTHORIZED;
        handleLogout();
      },
      [ERROR_TYPES.NETWORK]: () => {
        uiStore.serverResfused = true;
        errorStats.value = ERROR_TYPES.NETWORK;
      },
      default: () => {
        console.error('Unhandled error:', error);
        errorStats.value = 'UNKNOWN_ERROR';
      }
    };

    (errorHandlers[error.name] || errorHandlers.default)();
    loginAttempts.value++;
  };

  // 计时器处理
  const startCountdown = (seconds = 2) => {
    clearTimer();
    count.value = seconds;
    timer = setInterval(() => {
      count.value--;
      if (count.value <= 0) {
        clearTimer();
        router.push('/teams');
      }
    }, 1000);
  };

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // 登录处理
  const handleSubmit = async (formData) => {
    try {
      if (isLoading.value) return;
      isLoading.value = true;

      checkLoginAttempts();
      await clearLocalDB('LoginPage submitLogin event');

      start.value = true;
      strapi_loading.value = true;

      const { strapiResult, mmResult } = await authService.login({
        identifier: formData.identifier,
        password: formData.password
      });
      // console.log(strapiResult, mmResult);

      if (strapiResult?.data) {
        strapi_loading.value = false;
        store.logged = true;
        store.needRefetch = true;
        userStore.me = strapiResult.data.user
        if (mmResult?.data) {
          userStore.mm_profile = mmResult.data
          useFetchAvatar(mmResult.data.id, 'force');
          mm_loading.value = false;
          start.value = false;
          startCountdown();
          loginAttempts.value = 0;
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      isLoading.value = false;
    }
  };

  // 其他功能处理
  const reLogin = () => {
    errorStats.value = null;
    hasError.value = false;
    store.logged = false;
  };

  const redirectNow = () => {
    count.value = 0;
    store.needRefetch = true;
    router.push('/teams');
  };

  const resetError = () => {
    uiStore.axiosStauts = undefined;
    uiStore.axiosStautsCode = undefined;
    uiStore.axiosError = undefined;
    errorStats.value = null;
    hasError.value = false;
    uiStore.serverResfused = false;
  };

  const setServer = () => {
    resetError();
    uiStore.setServer = true;
  };

  const setCompleted = () => {
    uiStore.setServer = false;
    localStorage.clear();
  };

  // 定义事件处理函数
  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && !isLoading.value) {
      handleSubmit({
        identifier: identifier.value,
        password: password.value
      });
    }
  };

  // 生命周期钩子
  onMounted(() => {
    if (isLoggedIn.value) {
      userStore.logged = true;
      router.push('/teams');
    } else {
      localStorage.clear();
      userStore.$reset();
    }

    // 添加回车监听
    window.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    clearTimer();
    // 正确移除事件监听器
    window.removeEventListener('keyup', handleKeyUp);
  });
</script>

<style scoped>
  .focus-form {
    max-width: 48rem;
    margin: auto;
  }
</style>
