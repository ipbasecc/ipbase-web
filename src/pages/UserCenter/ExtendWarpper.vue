<template>
  <div class="absolute-full column flex-center relative-position">
    <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
    <q-card :bordered="$q.screen.gt.xs" :flat="!$q.screen.gt.xs" class="q-electron-drag--exception"
      :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10 fit'" :style="$q.screen.gt.xs ? 'width: 32rem' : ''">
      <q-card-section :horizontal="$q.screen.gt.sm">
        <div class="row justify-end absolute-top-right z-fab q-pa-sm">
          <LocalToggler :round="false" />
        </div>
        <div class="column no-wrap q-space">
          <slot />
          <WechatLogin v-if="!uiStore.logging" class="q-px-md q-pb-md" />
        </div>
        <!-- <ExtendedInfo /> -->
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue';
  import LocalToggler from 'src/components/VIewComponents/LocalToggler.vue'
  import WechatLogin from './components/WechatLogin.vue'
  import { uiStore } from 'src/hooks/global/useStore';
  // import ExtendedInfo from './components/ExtendedInfo.vue';
  onMounted(() => {
    uiStore.logging = false;
  });
</script>
