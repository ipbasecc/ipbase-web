<template>
  <ExtendWarpper>
    <q-card-section class="q-space" :style="$q.screen.gt.sm ? 'order: 99;' : ''">
      <template v-if="!hasError">
        <LoginForm v-if="!store.logged" :loading="isLoading" @submit="handleSubmit" @setServer="setServer" />

        <LoadingStatus v-else-if="start" :strapi-loading="strapi_loading" />

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
  import useUserStore from 'src/stores/user';
  import { uiStore, userStore } from 'src/hooks/global/useStore';
  import { clearLocalDB } from 'src/pages/team/hooks/useUser';
  import { useFetchAvatar } from 'src/pages/Chat/hooks/useFetchAvatar';
  import { login as strapi_login } from 'src/api/strapi.js';

  // 组件导入
  import LoginForm from './components/LoginForm.vue';
  import LoadingStatus from './components/LoadingStatus.vue';
  import LoginSuccess from './components/LoginSuccess.vue';
  import ErrorDisplay from './components/ErrorDisplay.vue';
  import ExtendWarpper from './ExtendWarpper.vue'

  const loginType = ref('wechat')

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
        count.value = 0;
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
      const credentials = {
        identifier: formData.identifier,
        password: formData.password
      }
      const res = await strapi_login(credentials);

      if (res?.data) {
        strapi_loading.value = false;
        store.logged = true;
        store.needRefetch = true;
        userStore.me = res.data.user
        if (res?.data?.user?.mm_profile) {
          userStore.mm_profile = res.data.user.mm_profile
          useFetchAvatar(res.data.user.mm_profile.id, 'force');
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

  const handleWechatLogin = async () => {
    try {
      // 生成状态码防止CSRF攻击
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('wechat_state', state);
      
      // 构建微信授权URL
      const authUrl = `https://open.weixin.qq.com/connect/qrconnect?` +
        `appid=${process.env.WECHAT_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.WECHAT_REDIRECT_URI)}&` +
        `response_type=code&scope=snsapi_login&state=${state}`;

      if (process.env.MODE === 'electron') {
        // 打开微信登录窗口
        window.wechatAPI.openAuthWindow(authUrl);
        
        // 监听回调
        window.wechatAPI.onCallback(async ({ code, state: returnedState }) => {
          try {
            // 验证状态码
            if (returnedState !== localStorage.getItem('wechat_state')) {
              throw new Error('Invalid state');
            }
            
            // 显示加载状态
            isLoading.value = true;
            
            // 处理登录
            await handleWechatCallback(code);
          } catch (error) {
            $q.notify({
              type: 'negative',
              message: '微信登录验证失败，请重试'
            });
          } finally {
            isLoading.value = false;
          }
        });
      } else {
        // Web 环境下直接跳转
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Wechat login error:', error);
      $q.notify({
        type: 'negative',
        message: '微信登录失败，请重试'
      });
    }
  };

  // 处理微信回调的函数保持不变
  const handleWechatCallback = async (code) => {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URI}api/auth/wechat/callback?code=${code}`
      );
      const data = await response.json();
      
      if (data.jwt) {
        await storeUserData({ data });
        router.push('/');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw new Error('登录失败，请重试');
    }
  };
</script>

<style scoped>
  .focus-form {
    max-width: 48rem;
    margin: auto;
  }
</style>
