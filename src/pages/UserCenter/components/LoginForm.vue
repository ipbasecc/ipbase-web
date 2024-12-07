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
    <!-- <q-btn color="info" icon="mdi-server-network" :label="$t('set_server_address')" unelevated class="full-width"
      @click="setServer()" /> -->
    <RouterLink class="q-pr-xs q-mt-sm text-primary text-right" :to="`/register`">{{ $t('no_account') }}</RouterLink>
    <RouterLink class="q-pr-xs text-primary text-right" :to="`/forgot-password`">{{ $t('forgot_password') }}</RouterLink>
    <span class="q-pr-xs text-primary cursor-pointer text-right" @click="clearCache()">{{ $t('clear_cache') }}</span>
  </q-form>
</template>

<script setup>
  import { reactive } from 'vue';
  import { clearCache } from 'src/hooks/utilits';
  import { uiStore } from 'src/hooks/global/useStore';

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
    uiStore.logging = true;
    emit('submit', { ...form });
  };  
  const setServer = () => {
    emit('setServer');
  };
</script>
