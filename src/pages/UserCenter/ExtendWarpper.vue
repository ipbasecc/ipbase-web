<template>
    <div class="absolute-full column flex-center relative-position">
      <div v-if="$q.platform.is.electron" class="absolute-full q-electron-drag" />
      <q-card :bordered="$q.screen.gt.xs" :flat="!$q.screen.gt.xs" class="q-electron-drag--exception"
        :class="$q.screen.gt.xs ? 'focus-form' : 'bg-grey-10 fit'" :style="$q.screen.gt.xs ? 'width: 32rem' : ''">
        <q-card-section :horizontal="$q.screen.gt.sm">
          <slot />
          <!-- <ExtendedInfo /> -->
        </q-card-section>
      </q-card>
    </div>
</template>

<script setup>
  // import ExtendedInfo from './components/ExtendedInfo.vue';
</script>
