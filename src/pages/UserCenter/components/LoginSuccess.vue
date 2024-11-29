<template>
  <div class="column items-center q-pa-md">
    <q-icon name="check_circle" color="positive" size="4em" />
    <div class="text-h6 q-mt-md">{{ $t('login_success') }}</div>
    <div class="text-subtitle1 q-mt-sm">
      {{ $t('welcome_back') }}, {{ username }}
    </div>
    <div v-if="count" class="text-caption q-mt-sm">
      {{ $t('auto_redirect') }} {{ count }} {{ $t('seconds') }}
    </div>
    <q-btn flat color="primary" :label="$t('redirect_now')" class="q-mt-md" @click="redirect()" />
  </div>
</template>

<script setup>
  defineProps({
    username: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: null
    }
  });

  const emit = defineEmits(['redirect']);
  const redirect = () => {
    emit('redirect');
  }
</script>
