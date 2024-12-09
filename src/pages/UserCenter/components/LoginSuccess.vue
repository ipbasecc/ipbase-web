<template>
  <div class="column items-center q-pa-md">
    <q-icon name="check_circle" color="positive" size="4em" />
    <div class="text-h6 q-mt-md">{{ $t('login_success') }}</div>
    <div class="text-subtitle1 q-mt-sm">
      {{ $t('welcome_back') }}, {{ username }}
    </div>
    <transition name="fade-height" mode="out-in">
      <div v-if="count" class="redirect-container">
        <div class="text-caption q-mt-sm">
          {{ $t('auto_redirect') }} {{ count }} {{ $t('seconds') }}
        </div>
        <q-btn flat color="primary" :label="$t('redirect_now')" class="q-mt-md" @click="redirect()" />
      </div>
    </transition>
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

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 过渡动画 */
.fade-height-enter-active,
.fade-height-leave-active {
  transition: all 0.3s ease;
  max-height: 100px;
  opacity: 1;
}

.fade-height-enter-from,
.fade-height-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
}
</style>
