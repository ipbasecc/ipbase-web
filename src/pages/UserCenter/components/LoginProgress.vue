<template>
    <q-card-section class="login-progress">
      <div class="row items-center q-gutter-x-md">
        <q-spinner
          v-if="loading"
          color="primary"
          size="2em"
        />
        <span>
          {{ loading ? $t('user_created_successfully_logging_in') : $t('login_success') }}
        </span>
      </div>
    </q-card-section>
  </template>
  
  <script setup>
  defineProps({
    loading: {
      type: Boolean,
      default: false
    }
  });
  </script>