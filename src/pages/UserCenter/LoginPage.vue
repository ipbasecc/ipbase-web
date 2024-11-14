<template>
  <div class="absolute-full column flex-center relative-position">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
    <q-card
      :bordered="$q.screen.gt.xs"
      :flat="!$q.screen.gt.xs"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10 fit'"
      :style="$q.screen.gt.xs ? 'width: 48rem' : ''"
    >
      <q-card-section :horizontal="$q.screen.gt.sm">
        <q-card-section :class="$q.screen.gt.sm ?  showExtanInfo ? 'col-6' : 'col-12' : ''" :style="$q.screen.gt.sm ? 'order: 99;' : ''">
          <template v-if="!hasError">
            <template v-if="!store.logged">
              <q-card-section class="q-mt-lg">
                <div class="text-h3 text-center font-bold-600">登陆您的账户</div>
              </q-card-section>
              <q-card-section class="q-pa-md q-mt-lg">
                <form class="column gap-md no-wrap">
                  <q-input
                    v-model="identifier"
                    :standout="$q.dark.mode"
                    hide-bottom-space
                    autocomplete="off"
                    type="text"
                    :rules="[
                      (val) => !!val || 'Email is missing',
                      (val) =>
                        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
                          val
                        ) || '邮箱输入有误，请检查输入！',
                    ]"
                    class="border radius-xs overflow-hidden"
                  >
                    <template v-slot:prepend>
                      <q-icon name="mdi-email-outline" size="sm" class="q-px-sm" />
                    </template>
                  </q-input>
                  <q-input
                    v-model="password"
                    :standout="$q.dark.mode"
                    hide-bottom-space
                    type="password"
                    autocomplete="off"
                    :rules="[(val) => !!val || '请输入账号密码!']"
                    class="border radius-xs overflow-hidden"
                  >
                    <template v-slot:prepend>
                      <q-icon name="mdi-lock-outline" size="sm" class="q-px-sm" />
                    </template>
                  </q-input>
                </form>
              </q-card-section>
              <q-card-section class="column no-wrap gap-sm items-end">
                <q-btn
                  color="primary"
                  icon="login"
                  label="登陆"
                  unelevated
                  class="full-width"
                  @click="submitLogin()"
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
                <RouterLink class="q-pr-xs q-mt-sm text-primary" :to="`/register`"
                  >没有账号？点此注册</RouterLink
                >
                <RouterLink class="q-pr-xs text-primary" :to="`/forgot-password`"
                  >忘记密码？</RouterLink
                >
              </q-card-section>
            </template>
            <template v-else-if="start">
              <q-card-section
                v-if="strapi_loading"
                class="row no-wrap gap-sm items-center"
              >
                <span>正在验证账号，请稍等...</span>
              </q-card-section>
              <q-card-section
                v-else-if="mm_loading"
                class="row no-wrap gap-sm items-center"
              >
                <span>正在链接通讯服务，请稍等...</span>
              </q-card-section>
            </template>
            <template v-else-if="isLogined">
              <q-card-section class="row no-wrap items-center">
                <div class="font-medium">
                  {{
                    store.logged && me ? "欢迎回来：" : "您已成功登陆，无须再次登陆"
                  }}
                  <span class="font-medium font-bold-600">{{
                    me?.username || store.me?.username
                  }}</span>
                </div>
              </q-card-section>
              <q-card-section
                class="row no-wrap flex-center border-top q-py-xl q-px-lg"
              >
                <div class="relative-position q-mr-md">
                  <q-spinner-oval color="primary" size="2rem" />
                  <div class="absolute-full flex flex-center">{{ count }}</div>
                </div>
                <span
                  >您已经登陆，正在跳转到首页<span class="q-px-sm"></span>...</span
                >
              </q-card-section>
              <q-card-section class="q-pa-sm border-top">
                <q-btn
                  unelevated
                  color="primary"
                  label="点击立即跳转"
                  class="full-width"
                  @click="redirectNow()"
                />
              </q-card-section>
            </template>
          </template>
          <q-card-section v-else-if="errorStats === 'noneConfirmed'">
            账号未激活，请检查您的注册邮箱，接收来自
            <span class="text-red font-bild-600">“易乎APP“</span>
            的邮件，点击其中的激活链接！
          </q-card-section>

          <q-card-section v-else-if="errorStats === 'ValidationError'"
            class="row no-wrap gap-sm items-center"
          >
            <span>账号或密码错误！</span
            ><q-btn
              color="primary"
              padding="xs md"
              dense
              flat
              label="重新登录"
              @click="reLogin"
            />
          </q-card-section>

          <q-card-section v-else-if="errorStats === 'Unauthorized'"
            class="row no-wrap gap-sm items-center"
          >
            <span>授权已过期，请重新登陆</span
            ><q-btn
              color="primary"
              padding="xs md"
              dense
              flat
              label="重新登录"
              @click="reLogin"
            />
          </q-card-section>
          <template v-else-if="errorStats === 'ERR_NETWORK' || connect_refused">
            <q-card-section class="column no-wrap gap-sm">
              <span class="font-larger">{{ $t('connect_refused_header') }}</span>
              <span class="op-6">{{ $t('connect_refused_login_caption') }}</span>
            </q-card-section>
            <q-card-section class="border-top">
              <q-btn
                color="primary"
                padding="xs md"
                dense
                class='full-width'
                :label="$t('connect_refused_login_btn_label')"
                @click="setServer()"
              />
            </q-card-section>
          </template>

          <q-card-section
            v-if="count"
            class="row no-wrap flex-center q-py-xl q-px-lg"
          >
            <div class="relative-position q-mr-md">
              <q-spinner-oval color="primary" size="2rem" />
              <div class="absolute-full flex flex-center">{{ count }}</div>
            </div>
            <span>跳转中，请稍等<span class="q-px-sm"></span>...</span>
          </q-card-section>
        </q-card-section>
        <q-card-section v-if="showExtanInfo" class="column no-wrap flex-center" :class="$q.screen.gt.sm ? 'col-6 border-right' : ''">
          <template v-if="uiStore.setServer" >
            <ServerList :useDialog="false" @setCompleted="setCompleted()" />
          </template>
          <ExtendInfo v-else />
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { login as strapi_login } from 'src/api/strapi.js'
import { login as mmLogin } from "src/api/mattermost.js";
import useUserStore from "src/stores/user.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import { uiStore, userStore } from "src/hooks/global/useStore.js";
import ServerList from "pages/team/settings/ServerList.vue";
import ExtendInfo from './ExtendInfo.vue'
import { clearLocalDB } from "src/pages/team/hooks/useUser.js";

uiStore.topbarClass = "transparent";
const store = useUserStore();
const router = useRouter();
const me = ref();

const isLogined = ref(false);

onMounted(async() => {
  let strapi_jwt = localStorage.getItem("jwt");
  let mm_token = localStorage.getItem("mmtoken");
  await nextTick();
  if (strapi_jwt && mm_token) {
    isLogined.value = true;
    router.push("/teams");
  } else {
    localStorage.clear();
    userStore.$reset();
  }
});

const connect_refused = computed(() => uiStore.serverResfused);

// 开始登录
// 定义登录表单数据
const identifier = ref();
const password = ref();

// 定义登录提交数据结构
const loginParams = ref({
  password: "",
  identifier: "",
});

const hasError = ref(false);
const errorStats = ref();
const start = ref(false);
const strapi_loading = ref(false);
const mm_loading = ref(false);
const showExtanInfo = ref(true);

// 登录动作
const submitLogin = async () => {
  await clearLocalDB("LoginPage submitLogin event");
  start.value = true;
  loginParams.value.password = password.value;
  loginParams.value.identifier = identifier.value;

  strapi_loading.value = true;
  const res = await strapi_login(loginParams.value);
  if (res?.data) {      
    strapi_loading.value = false;
    
    store.logged = true;
    store.needRefetch = true;
    // 登录mattermost
    try {
      mm_loading.value = true;
      const loginParmars = ref({
        login_id: identifier.value,
        password: password.value,
      });
      let res = await mmLogin(loginParmars.value);
      if (res?.data) {
        await useFetchAvatar(res.data.id, "force");
        mm_loading.value = false;
        start.value = false;
        showExtanInfo.value = false
        startCountdown();
      }
    } catch (error) {
      console.log(error);
    }
  } else if (res?.response?.data?.error) {
    const err = res.response.data.error;
    if(err.name === 'ValidationError'){
      errorStats.value = "ValidationError";
    } else if (err.name === "Unauthorized") {
      errorStats.value = "Unauthorized";
    } else if (err.name === "Forbidden") {
      errorStats.value = "Forbidden";
    } else {
      errorStats.value = err.message;
    }
    hasError.value = true;
    strapi_loading.value = false;
    start.value = false;
  }
};
const enterListener = (event) => {
  if (event.keyCode === 13) {
    submitLogin();
  }
};

onMounted(() => {
  window.addEventListener("keyup", enterListener);
});

onUnmounted(() => {
  window.removeEventListener("keyup", enterListener);
});
const reLogin = () => {
  errorStats.value = null;
  hasError.value = false;
  store.logged = false;
};
const redirectNow = () => {
  store.needRefetch = true;
  router.push("/teams");
};
const count = ref();
let intervalId = null;
const startCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  resetError();
  count.value = 2;
  intervalId = setInterval(() => {
    count.value--;
    if (count.value === 1) {
      clearInterval(intervalId);
      router.push("/teams");
    }
  }, 1000);
};
const resetError = () => {
  uiStore.axiosStauts = void 0;
  uiStore.axiosStautsCode = void 0;
  uiStore.axiosError = void 0;
  errorStats.value = null;
  hasError.value = false;
  uiStore.serverResfused = false;
}
const setServer = () => {
  resetError();
  uiStore.setServer = true;
};
const setCompleted = () => {
  uiStore.setServer = false;
  localStorage.clear();
};

</script>
<style>
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset !important;
  background-color: rgba(16, 16, 18, 0.194) !important;
}
</style>
