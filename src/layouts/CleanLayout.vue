<template>
  <q-layout view="hHh lpR fff">
    <q-header v-if="uiStore.topbarShow || $q.platform.is.electron" class="transparent">
      <q-bar class="transparent q-pr-none" :class="$q.platform.is.electron ? 'q-electron-drag' : ''">
        <template v-if="is_development">
          <q-btn
            flat
            dense
            icon="dark_mode"
            color="primary"
            @click="$q.dark.toggle()"
          />
          <q-space />
          {{ uiStore?.pageTitle }}
        </template>
        <q-space />
        <template v-if="$q.platform.is.electron">
          <section class="full-height row no-wrap items-center" style="padding: 2px">
            <q-btn dense square size="sm" icon="mdi-window-minimize"
              class="full-height" padding="0 12px"
              @click="minimize()"
            />
            <q-btn dense square size="sm" class="full-height" padding="0 12px" @click="toggleMaximize()">
              <WindowToggle v-if="isMax" :color="$q.dark.mode ? 'white' : 'black'" />
              <q-icon v-else name="mdi-window-maximize" />
            </q-btn>
            <q-btn dense square size="sm" icon="close"
              class="full-height" padding="0 12px"
              @mouseenter="hoverClose = true"
              :class="hoverClose ? 'bg-negative' : ''"
              @mouseleave="hoverClose = false"
              @click="closeApp()"
            />
          </section>
        </template>
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page class="overflow-hidden">
        <!-- <BgEffects v-if="$q.screen.gt.xs && !uiStore.disableBgEffects" /> -->
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer> </q-footer>
  </q-layout>
</template>
<script setup>
import {computed, onBeforeMount, ref, onMounted} from "vue";
import { uiStore } from "src/hooks/global/useStore.js";
import WindowToggle from "pages/team/components/widgets/icons/WindowToggle.vue";
import {useQuasar} from "quasar";
// import BgEffects from './BgEffects.vue'

const $q = useQuasar();
const is_development = ref(import.meta.env.DEV);
onBeforeMount(() => {
  uiStore.topbarShow = false
  uiStore.pageLoaded = true
})

const isMax = ref(false);
const isElectron = computed(() => $q.platform.is.electron);
function minimize() {
  if (isElectron.value) {
    window.windowAPI.minimize();
  }
}
function toggleMaximize() {
  if (isElectron.value) {
    window.windowAPI.toggleMaximize(isMax.value);
    isMax.value = !isMax.value
  }
}
const hoverClose = ref(false);
function closeApp() {
  if (isElectron.value) {
    window.windowAPI.close();
  }
}

</script>
<style>
.q-field--standard .q-field__control:before {
  border-bottom: 1px solid rgba(0, 0, 0, 0);
}
</style>
