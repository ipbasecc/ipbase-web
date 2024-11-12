<template>
  <q-list>
    <q-item-label header>{{ $t('update_password') }}</q-item-label>
    <q-item>
      <q-item-section>
        <div class="column no-wrap gap-sm">
          <q-input
            outline
            flat
            square
            filled
            v-model="changePasswordParams.currentPassword"
            type="password"
            :label="$t('old_password')"
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
            type="password"
            :label="$t('new_password')"
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
            type="password"
            :label="$t('confirm_password')"
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
        <q-btn color="primary" :label="$t('confirm')" @click="changePasswordFn()" />
      </q-item-section>
    </q-item>
    <div v-if="success" class="absolute-full flex flex-center">
      <div class="absolute-full bg-black op-5" />
      <span class="q-pa-md radius-sm bg-positive text-white z-fab">{{ $t('change_success') }}</span>
    </div>
  </q-list>
</template>

<script setup>
import { ref } from "vue";
import { changePassword } from "src/api/strapi.js";
import { useQuasar } from "quasar";
import { i18n } from 'src/boot/i18n.js';
import { login as mmLogin } from "src/api/mattermost.js";

const $t = i18n.global.t;

const $q = useQuasar();
const changePasswordParams = ref({
  currentPassword: "",
  password: "",
  passwordConfirmation: "",
});
const success = ref(false)
const changePasswordFn = async () => {
  if (
    changePasswordParams.value.passwordConfirmation !==
    changePasswordParams.value.password
  ) {
    $q.notify($t('password_not_same'));
  } else if (
    changePasswordParams.value.currentPassword ===
    changePasswordParams.value.password
  ) {
    $q.notify($t('password_is_same'));
  } else {
    try {
      const res = await changePassword(changePasswordParams.value);
      console.log("res", res);
      if (res?.data) {
        const jwt = res.data.jwt;
        localStorage.setItem("jwt", JSON.stringify(jwt));

        const loginParmars = ref({
          login_id: res.data.user.email,
          password: changePasswordParams.value.password,
        });
        await mmLogin(loginParmars.value);
        success.value = true
        changePasswordParams.value.currentPassword = ''
        changePasswordParams.value.password = ''
        changePasswordParams.value.passwordConfirmation = ''
      }
      if (
        res.response?.data?.error?.message ===
        "Your new password must be different than your current password"
      ) {
        $q.notify($t('password_cant_same'));
      }
    } catch (error) {
      console.log("error", error);
      $q.notify(error);
    }
  }
};
</script>
