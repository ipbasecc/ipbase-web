<template>
  <q-card v-if="me" bordered flat style="width: 420px">
    <template v-if="!me.confirmed">
      <q-card-section class="border-bottom">
        <div class="column no-wrap gap-sm items-center">
          <span
            class="row no-wrap items-center gap-md text-orange font-xx-large"
          >
            <q-icon name="info" />
            注册成功！
          </span>
        </div>
      </q-card-section>
      <q-card-section>
        请检查您的注册邮箱，接收来自
        <span class="text-red font-bild-600">易乎APP</span>
        的邮件，点击其中的激活链接！
      </q-card-section>
    </template>
    <q-card-section v-else>
      <span>用户创建成功，正在登录，请稍后...</span>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { ref, toRefs, watch } from "vue";
import { login as mmLogin } from "src/api/mattermost.js";
import { init_mm } from "src/hooks/chat/useInitChatservice.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";

const props = defineProps({
  me: {
    type: Object,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
});
const { me, email, password } = toRefs(props);
const emit = defineEmits(["emitLoginData"]);

// 登录动作
const initLogin = async () => {
  if (!me.value) return;
  console.log("me.value", me.value?.id);
  try {
    const loginParmars = ref({
      login_id: email.value,
      password: password.value,
    });
    let res = await mmLogin(loginParmars.value);
    if (res?.data) {
      emit("emitLoginData");
      await useFetchAvatar(res.data.id, "force");
    }
  } catch (error) {
    console.log(error);
  }
};
watch(
  me,
  () => {
    if (me.value?.confirmed) {
      initLogin();
    }
  },
  { immediate: true, deep: false }
);
</script>
