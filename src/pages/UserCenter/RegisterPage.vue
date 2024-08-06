<template>
  <div class="absolute-full column flex-center">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
      <q-card
        v-if="(step === 0 && logged) || step === 2"
        style="width: 420px"
        :bordered="$q.screen.gt.xs"
        :flat="!$q.screen.gt.xs"
        class="q-electron-drag--exception"
        :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'"
      >
        <q-card-section
          v-if="step === 2"
          class="row no-wrap gap-md items-center q-pa-lg"
        >
          <q-icon name="check" color="primary" size="1.5rem" />
          <span>
            正在跳转，请稍后
            <span class="q-px-sm">{{ count }}</span>
            ...
          </span>
        </q-card-section>
        <q-card-section class="border-top q-pa-sm">
          <q-btn
            unelevated
            color="primary"
            label="立刻跳转"
            class="full-width"
            @click="redirectNow()"
          />
        </q-card-section>
      </q-card>
      <q-card
        v-else-if="step === 0"
        class="overflow-hidden ipbase q-electron-drag--exception"
        :bordered="$q.screen.gt.xs"
        :flat="!$q.screen.gt.xs"
        :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'"
        style="width: 48rem"
      >
        <q-card-section :horizontal="$q.screen.gt.sm">
          <q-card-section :class="$q.screen.gt.sm ? logged ? 'col-12' : 'col-6' : ''" :style="$q.screen.gt.sm ? 'order: 99;' : ''">
            <!-- <q-card-section v-show="!credible" class="border-bottom flex flex-center q-py-xl">
                      <Turnstile
                          :sitekey="cf_site_key"
                          @verify="verify"
                      />
                  </q-card-section> -->
            <form v-if="credible">
              <q-card-section class="text-h3 text-center font-bold-600 q-mt-lg">
                用户注册
              </q-card-section>
              <q-card-section class="q-mt-lg">
                <q-input
                  v-model="username"
                  :standout="$q.dark.mode"
                  type="text"
                  label="用户名"
                  hide-bottom-space
                  :rules="[(val) => val?.length >= 6 || '请输入至少6位，且由字母开头，仅包含字母或数字的用户名']"
                  class="border radius-xs overflow-hidden"
                >
                  <template v-slot:prepend>
                    <q-icon
                      name="mdi-account-box-outline"
                      size="sm"
                      class="q-px-sm"
                    />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input
                  v-model="email"
                  :standout="$q.dark.mode"
                  type="text"
                  label="邮箱"
                  hide-bottom-space
                  :rules="[
                    (val) => !!val || '邮箱地址不能缺少',
                    (val) =>
                      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val) ||
                      '邮箱输入有误，请检查输入！',
                  ]"
                  class="border radius-xs overflow-hidden"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-email-outline" size="sm" class="q-px-sm" />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input
                  v-model="password"
                  :standout="$q.dark.mode"
                  type="password"
                  label="密码"
                  hide-bottom-space
                  autocomplete
                  :rules="[(val) => val?.length >= 8 || '密码不能小于8位数']"
                  class="border radius-xs overflow-hidden"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-lock-outline" size="sm" class="q-px-sm" />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input
                  v-model="confirmPassword"
                  :standout="$q.dark.mode"
                  type="password"
                  label="确认密码"
                  hide-bottom-space
                  autocomplete
                  :rules="[
                    (val) => val?.length >= 8 || '密码不能小于8位数',
                    (val) => val === password || '两次输入密码必须相同',
                  ]"
                  class="border radius-xs overflow-hidden"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-lock" size="sm" class="q-px-sm" />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-section class="column no-wrap gap-sm items-end">
                <q-btn
                  unelevated
                  color="primary"
                  icon="check"
                  label="提交注册"
                  class="full-width"
                  @click="submitRegister()"
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
                <RouterLink class="q-pr-xs text-primary" :to="`/login`"
                  >已有账号？点此登陆</RouterLink
                >
              </q-card-section>
              <template v-if="loading">
                <div
                  class="absolute-full op-8"
                  :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
                ></div>
                <div class="absolute-full row no-wrap gap-sm flex-center">
                  <q-spinner-orbit color="primary" size="3rem" :thickness="5" />
                  <span>请稍后...</span>
                </div>
              </template>
            </form>
          </q-card-section>
          <q-card-section v-if="!logged" class="column no-wrap flex-center" :class="$q.screen.gt.sm ? 'col-6 border-right' : ''">
            <template v-if="uiStore.setServer" >
              <ServerList :useDialog="false" @setCompleted="setCompleted()" />
            </template>
            <ExtendInfo v-else />
          </q-card-section>
        </q-card-section>
      </q-card>
      <div v-if="me && step === 1" class="column no-wrap gap-sm q-electron-drag--exception">
        <LoginStep
          :me
          :email="email"
          :password="password"
          @emitLoginData="emitLoginData"
        />
      </div>
    <template v-if="bingWallpaper">
      <div
        class="absolute-full blur-md z-unfab"
        :style="`background-image: url(${bingWallpaper});background-size: cover;`"
      ></div>
      <div class="absolute-full blur-md z-unfab"></div>
    </template>
  </div>
</template>
<script setup>
// import Turnstile from 'cfturnstile-vue3'
import { useRouter } from "vue-router";
import { inject, ref, watch } from "vue";
import { register } from "src/api/strapi.js";
import LoginStep from "src/pages/UserCenter/RegisterSteps/LoginStep.vue";
import useUserStore from "src/stores/user.js";
import { useQuasar } from "quasar";
import { uiStore } from "src/hooks/global/useStore.js";
import ServerList from "src/pages/team/settings/ServerList.vue";
import ExtendInfo from './ExtendInfo.vue'

uiStore.topbarClass = "transparent";

const router = useRouter();
if (localStorage.getItem("jwt")) {
  router.push("/teams");
}

const $q = useQuasar();

const store = useUserStore();

const logged = ref(store.logged);
const bingWallpaper = inject("bingWallpaper");

const username = ref();
const email = ref();
const password = ref();
const confirmPassword = ref();

const step = ref(0);

const me = ref();
const error = ref();
const loading = ref(false);
// 提交注册信息
const submitRegister = async () => {
  loading.value = true;

  let _params = {
    email: email.value,
    password: password.value,
    username: username.value,
  };
  try {
    const res = await register(_params);
    if (res?.data) {
      const data = res.data;
      me.value = data.user;
      store.logged = true;
      store.needRefetch = true;
      step.value = 1;
      loading.value = false;
    }
  } catch (e) {
    error.value = e;
  }
};
watch(
  error,
  () => {
    if (error.value) {
      $q.notify(error.value);
    }
  },
  { immediate: true, deep: false }
);

const redirectNow = () => {
  store.needRefetch = true;
  router.push("/teams");
};

const count = ref(2);
let intervalId = null;
const startCountdown = () => {
  intervalId = setInterval(() => {
    console.log("开始倒计时");
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      store.needRefetch = true;
      router.push("/teams");
    }
  }, 1000);
};

// 获取登陆信息
const emitLoginData = async () => {
  if (me.value?.confirmed) {
    step.value = 2;
    startCountdown();
  } else {
    step.value = 3;
  }
};

const cf_site_key = process.env.CF_SITE_KEY;
const cf_site_token = ref();
const credible = ref(true);
const verify = (token) => {
  cf_site_token.value = token;
  credible.value = true;
};

const setServer = () => {
  uiStore.setServer = true
}
const setCompleted = () => {
  uiStore.setServer = false
}
</script>
<style>
input:-webkit-autofill.q-field__native {
  -webkit-box-shadow: 0 0 0 1000px rgba(19, 19, 19, 0.087) inset !important;
}
input:-webkit-autofill.q-field__native,
input:-webkit-autofill.q-field__native:focus {
  transition: background-color 0s 600000s, color 0s 600000s !important;
}
</style>
