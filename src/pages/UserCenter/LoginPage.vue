<template>
  <div class="absolute-full column flex-center relative-position">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
    <q-card
      v-if="uiStore.setServer"
      :bordered="$q.screen.gt.sm"
      style="width: 420px"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'"
    >
      <ServerList :useDialog="false" @setCompleted="setCompleted()" />
    </q-card>
    <q-card
      v-else
      :bordered="$q.screen.gt.xs"
      :flat="!$q.screen.gt.xs"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'"
      style="width: 420px"
    >
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

      <q-card-section v-else-if="errorStats === 'wrongPassword'"
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

      <q-card-section v-else-if="errorStats === 'wrongAuth'"
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
      <template v-else-if="errorStats === 'ERR_NETWORK'">
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
        class="row no-wrap flex-center border-top q-py-xl q-px-lg"
      >
        <div class="relative-position q-mr-md">
          <q-spinner-oval color="primary" size="2rem" />
          <div class="absolute-full flex flex-center">{{ count }}</div>
        </div>
        <span>跳转中，请稍等<span class="q-px-sm"></span>...</span>
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
  onBeforeMount,
} from "vue";
import { useRouter } from "vue-router";
import { login } from "src/apollo/api/api.js";
import { login as mmLogin } from "src/api/mattermost.js";
import useUserStore from "src/stores/user.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import { uiStore } from "src/hooks/global/useStore.js";
import ServerList from "pages/team/settings/ServerList.vue";

uiStore.topbarClass = "transparent";
const store = useUserStore();
const router = useRouter();
const me = ref();

const isLogined = ref(false);

onBeforeMount(() => {
  let strapi_jwt = computed(() => localStorage.getItem("jwt"));
  let mm_token = computed(() => localStorage.getItem("mmtoken"));
  if (strapi_jwt.value && mm_token.value) {
    isLogined.value = true;
    router.push("/teams");
  } else {
    localStorage.clear();
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
const Rsps = ref();
const hasError = ref(false);
const errorStats = ref();
const start = ref(false);
const strapi_loading = ref(false);
const mm_loading = ref(false);
//提交登录数据登录方法
const {
  mutate: loginMutate,
  onDone: loginOnDone,
  onError: loginError,
} = login(loginParams);
// 登录动作
const submitLogin = async () => {
  start.value = true;
  loginParams.value.password = password.value;
  loginParams.value.identifier = identifier.value;

  try {
    strapi_loading.value = true;
    // 提交登录数据并拿回Apollo返回数据
    const { data, error } = await loginMutate();
    // 填充本地JWT数据，填充store数据
    if (data) {
      strapi_loading.value = false;
      Rsps.value = data;
      localStorage.setItem("jwt", JSON.stringify(data.login.jwt));
      me.value = data.login.user;
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
          startCountdown();
        }
      } catch (error) {
        console.log(error);
      }
    }
    if(error){
      console.log('error', error);
    }
  } catch (error) {
    hasError.value = true;
    if (error === "ApolloError: Your account email is not confirmed") {
      errorStats.value = "noneConfirmed";
    } else if (error === "ApolloError: Invalid identifier or password") {
      errorStats.value = "wrongPassword";
    } else if(error.code === 'ERR_NETWORK' || connect_refused.value) {
      errorStats.value = "ERR_NETWORK";
    } else {
      errorStats.value = "wrongAuth";
    }
    console.log(error);
    Rsps.value = error;
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
