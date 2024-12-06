<template>
    <div class="column items-center q-pa-md">
      <div class="text-h6 q-mb-md">{{ $t('logging_in') }}</div>
      
      <div class="row items-center q-gutter-x-md">
        <q-spinner v-if="strapiLoading" color="primary" size="2em" />
        <span :class="{ 'text-positive': !strapiLoading }">
          {{ $t('authorization_verification') }} {{ strapiLoading ? $t('verifying') : $t('verification_completed') }}
        </span>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    strapiLoading: {
      type: Boolean,
      default: false
    }
  });
  </script>