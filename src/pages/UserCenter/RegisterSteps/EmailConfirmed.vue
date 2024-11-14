<template>
  <div class="absolute-full column flex-center">
    <q-card bordered flat style="width: 420px; min-height: 320px">
      <div v-if="loading" class="absolute-full column no-wrap flex-center">
        <div class="absolute-full bg-white op-5"></div>
        正在登陆，请稍等...
      </div>
      <template v-else>
        <q-card-section class="border-bottom">
          <div class="column no-wrap gap-sm items-center">
            <span
              class="row no-wrap items-center gap-md text-orange font-xx-large"
            >
              <q-icon name="info" />
              激活成功！
            </span>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="column no-wrap gap-md">
            <span>请输入邮箱与密码登陆</span>
            <form class="column no-wrap gap-md">
              <q-input
                v-model="loginParams.identifier"
                flat
                square
                filled
                type="text"
                prefix="邮箱："
                autocomplete="email"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>
              <q-input
                v-model="loginParams.password"
                flat
                square
                filled
                type="password"
                prefix="密码："
                autocomplete="current-password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </form>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-sm border-top row">
          <q-space />
          <q-btn
            v-if="!logged"
            color="primary"
            padding="xs lg"
            label="登陆"
            @click="loginFn()"
          />
          <q-btn
            v-else
            color="primary"
            :label="`立即跳转 ${count}`"
            @click="redirectNow()"
          />
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "src/api/strapi.js";
import { login as mmLogin } from "src/api/mattermost.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import { init_mm } from "src/hooks/chat/useInitChatservice.js";
import useUserStore from "src/stores/user.js";
import { uiStore } from "src/hooks/global/useStore.js";
uiStore.topbarClass = "transparent";

const userStore = useUserStore();
const router = useRouter();
const me = ref();
const loginParams = ref({
  identifier: "",
  password: "",
});
const logged = ref(false);
const initMm = async () => {
  if (!me.value) return;
  console.log("start mm");
  try {
    const params = {
      login_id: loginParams.value.identifier,
      password: loginParams.value.password,
    };
    let res = await mmLogin(params);
    if (res?.data) {
      await useFetchAvatar(res.data.id, "force");
      logged.value = true;
      startCountdown();
    }
  } catch (error) {
    console.log(error);
  }
};
const loading = ref(false);
const loginFn = async () => {
  if (loading.value) return;
  loading.value = true;
  const res = await login(loginParams.value);
  if (res?.data) {
    me.value = res.data?.user;
    await initMm();
    loading.value = false;
  }
};
const redirectNow = () => {
  userStore.needRefetch = true;
  router.push("/teams");
};
const count = ref(2);
let intervalId = null;
const startCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      redirectNow();
    }
  }, 1000);
};
</script>
