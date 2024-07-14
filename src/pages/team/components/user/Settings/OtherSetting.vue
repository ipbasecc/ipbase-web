<template>
  <q-list>
    <q-item-label header>修改密码</q-item-label>
    <q-item>
      <q-item-section>
        <div class="column no-wrap gap-sm">
          <q-input
            outline
            flat
            square
            filled
            v-model="changePasswordParams.currentPassword"
            type="text"
            label="原始密码"
            class="radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock-outline" size="sm" />
            </template>
          </q-input>
          <q-input
            outline
            flat
            square
            filled
            v-model="changePasswordParams.password"
            type="text"
            label="新密码"
            class="radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock-outline" size="sm" />
            </template>
          </q-input>
          <q-input
            outline
            flat
            square
            filled
            v-model="changePasswordParams.passwordConfirmation"
            type="text"
            label="确认密码"
            class="radius-xs overflow-hidden"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock" size="sm" />
            </template>
          </q-input>
        </div>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section class="q-pa-sm">
        <q-btn color="primary" label="确认" @click="changePasswordFn()" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { ref } from "vue";
import { changePassword } from "src/api/strapi.js";
import { useQuasar } from "quasar";
const $q = useQuasar();
const changePasswordParams = ref({
  currentPassword: "",
  password: "",
  passwordConfirmation: "",
});
const changePasswordFn = async () => {
  if (
    changePasswordParams.value.passwordConfirmation !==
    changePasswordParams.value.password
  ) {
    $q.notify("密码与确认密码不同");
  } else if (
    changePasswordParams.value.currentPassword ===
    changePasswordParams.value.password
  ) {
    $q.notify("新密码与旧密码相同，没有必要更新");
  } else {
    try {
      const res = await changePassword(changePasswordParams.value);
      console.log("res", res);
      if (res?.data) {
        const jwt = res.data.jwt;
        localStorage.setItem("jwt", JSON.stringify(jwt));
      }
      if (
        res.response?.data?.error?.message ===
        "Your new password must be different than your current password"
      ) {
        $q.notify("新密码不能与旧密码相同");
      }
    } catch (error) {
      console.log("error", error);
      $q.notify(error);
    }
  }
};
</script>
