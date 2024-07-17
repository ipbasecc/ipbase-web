<template>
  <div class="absolute-full column flex-center">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
    <q-card v-if="!code" style="width: 420px"
            :bordered="$q.screen.gt.xs"
      :flat="!$q.screen.gt.xs"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'">
      <template v-if="!resetSuccess">
        <q-card-section class="border-bottom font-large">
          重设你的密码
        </q-card-section>
        <q-card-section class="column no-wrap gap-xs">
          <q-input
            v-model="resetPasswordParmas.password"
            square
            filled
            type="password"
            label="密码"
            hide-bottom-space
            :rules="[(val) => val?.length >= 6 || '密码不能小于6位数']"
            class="border radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock-outline" />
            </template>
          </q-input>
          <q-input
            v-model="resetPasswordParmas.passwordConfirmation"
            square
            filled
            type="password"
            label="确认密码"
            hide-bottom-space
            :rules="[
              (val) => val.length >= 6 || '密码不能小于6位数',
              (val) =>
                val === resetPasswordParmas.password || '两次输入密码必须相同',
            ]"
            class="border radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="row no-wrap q-pa-sm border-top">
          <q-btn
              padding="xs md"
              label="返回登陆"
              @click="back"
          />
          <q-space />
          <q-btn
            padding="xs md"
            color="primary"
            icon="check"
            label="确认"
            @click="reset"
          />
        </q-card-section>
      </template>
      <template v-else>
        <q-card-section class="border-bottom">
          你好，{{ username }}
        </q-card-section>
        <q-card-section class="border-bottom">
          <q-spinner-orbit color="primary" size="2rem" :thickness="5" />
          密码重设成功，正在前往登陆页面 <span>{{ count }}</span> ...
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-btn
            color="primary"
            label="立即转到登陆页面"
            class="full-width"
            @click="redirectNow()"
          />
        </q-card-section>
      </template>
    </q-card>
    <q-card v-else style="width: 420px"
      :bordered="$q.screen.gt.xs"
      :flat="!$q.screen.gt.xs"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'">
      <q-card-section class="column no-wrap gap-xs">
        <span class="font-x-large font-bold-600">密码重设地址无效</span>
        <span class="font-large font-bold-400"
          >请重新点击忘记密码链接并接收新的重设邮件！</span
        >
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPassword } from "src/api/strapi.js";
import useUserStore from "src/stores/user.js";
import { useQuasar } from "quasar";
import { uiStore } from "src/hooks/global/useStore.js";
uiStore.topbarClass = "transparent";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const code = route?.query.code || null;

const userStore = useUserStore();
const username = ref();
const resetPasswordParmas = ref({
  password: null,
  passwordConfirmation: null,
  code: code,
});
const resetSuccess = ref(false);

const reset = async () => {
  if (!code) return;
  if (
    resetPasswordParmas.value.password !==
    resetPasswordParmas.value.passwordConfirmation
  ) {
    $q.notify({
      message: "两次输入的密码不一致",
      position: "top",
      color: "red",
    });
    return;
  }
  try {
    const res = await resetPassword(resetPasswordParmas.value);
    if (res?.data) {
      resetSuccess.value = true;
      const user = res?.data?.user;
      username.value = user.username;
      localStorage.setItem("jwt", JSON.stringify(user.jwt));
      startCountdown();
    }
  } catch (error) {
    console.log(error);
    $q.notify({
      message: "发生未知错误，请检查网络并刷新后再试。",
      position: "center",
      color: "negative",
      actions: [
        {
          label: "知道了",
          color: "yellow",
          handler: () => {
            /* ... */
          },
        },
      ],
    });
  }
};

const redirectNow = () => {
  userStore.needRefetch = true;
  router.push("/login");
};
const count = ref(2);

const startCountdown = () => {
  let intervalId = setInterval(() => {
    console.log("开始倒计时");
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      redirectNow();
    }
  }, 1000);
};
const back = () => {
  router.push('/login');
}
</script>

<style lang="scss" scoped></style>
