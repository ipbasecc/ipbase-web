<template>
  <q-form @submit.prevent="handleSubmit" class="column gap-sm">
    <div class="text-h2 q-py-lg q-mb-md flex flex-center">{{ $t('login') }}</div>

    <q-input v-model="form.identifier" :rules="[
      (val) => !!val || 'Email is missing',
      (val) =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
          val
        ) || $t('invalid_email'),
    ]" :label="$t('email')" hide-bottom-space :disable="loading" class="border radius-xs overflow-hidden">
      <template v-slot:prepend>
        <q-icon name="mdi-email-outline" size="sm" class="q-px-sm" />
      </template>
    </q-input>

    <q-input v-model="form.password" :rules="[(val) => !!val || $t('please_enter_account_password')]" :label="$t('password')"
      type="password" hide-bottom-space :disable="loading" class="border radius-xs overflow-hidden">
      <template v-slot:prepend>
        <q-icon name="mdi-lock-outline" size="sm" class="q-px-sm" />
      </template>
    </q-input>


    <q-btn :loading="loading" type="submit" color="primary" class="full-width" :label="$t('login')" />
    <q-separator spaced class="op-5 full-width" />
    <q-btn color="info" icon="mdi-server-network" :label="$t('set_server_address')" unelevated class="full-width"
      @click="setServer()" />
    <RouterLink class="q-pr-xs q-mt-sm text-primary q-mt-xl" :to="`/register`">{{ $t('no_account') }}</RouterLink>
    <RouterLink class="q-pr-xs text-primary" :to="`/forgot-password`">{{ $t('forgot_password') }}</RouterLink>
  </q-form>
</template>

<script setup>
  import { reactive } from 'vue';

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['submit', 'setServer']);

  const form = reactive({
    identifier: '',
    password: ''
  });

  const handleSubmit = () => {
    emit('submit', { ...form });
  };
  const setServer = () => {
    emit('setServer');
  };
</script>