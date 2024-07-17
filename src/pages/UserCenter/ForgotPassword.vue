<template>
  <div class="absolute-full column flex-center">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
    <q-card
      style="width: 420px"
      :bordered="$q.screen.gt.xs"
      :flat="!$q.screen.gt.xs"
      class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10'"
    >
      <template v-if="!forgotSuccess && !isLoading">
        <q-card-section class="border-bottom">
          请输入你的注册邮箱地址
        </q-card-section>
        <q-card-section class="column no-wrap gap-xs">
          <q-input
            v-model="forgotPasswordParmas.email"
            square
            filled
            type="text"
            prefix="邮箱"
            hide-bottom-space
            :rules="[
              (val) => !!val || '邮箱地址地址不能为空',
              (val) =>
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val) ||
                '邮箱输入有误，请检查输入！',
            ]"
            class="border radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-email-outline" />
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
            :disable="!forgotPasswordParmas.email"
            @click="forgot"
          />
        </q-card-section>
      </template>
      <template v-if="!forgotSuccess && isLoading">
        <q-card-section class="row no-wrap gap-sm items-center">
          <q-spinner-orbit color="primary" size="2rem" :thickness="5" />
          <span>正在合验邮件，请稍后...</span>
        </q-card-section>
      </template>
      <template v-if="forgotSuccess && !isLoading">
        <q-card-section class="row no-wrap items-center gap-sm">
          <q-icon name="check" size="md" />
          <span>请检查邮件，点击邮件中的重设链接来设置新的密码！</span>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { forgotPassword } from "src/apollo/api/api.js";
import { uiStore } from "src/hooks/global/useStore.js";
import {useRouter} from "vue-router";

const router = useRouter();
uiStore.topbarClass = "transparent";

const forgotPasswordParmas = ref({
  email: null,
});
const forgotSuccess = ref(false);
const {
  mutate: forgotPasswordMutate,
  onDone: forgotPasswordOnDone,
  onError: forgotPasswordError,
} = forgotPassword(forgotPasswordParmas);

const isLoading = ref(false);
const isOk = ref(false);
const forgot = async () => {
  isLoading.value = true;
  try {
    const { data } = await forgotPasswordMutate();
    if (data) {
      isLoading.value = false;
      forgotSuccess.value = true;
      isOk.value = data.forgotPassword.ok;
    }
  } catch (error) {
    console.log(error);
  }
};
const back = () => {
  router.push('/login');
}
</script>
