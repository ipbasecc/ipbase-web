<template>
  <q-layout view="hHh lpR fff" class="bg-black">
    <q-header v-if="uiStore.topbarShow || $q.platform.is.electron" class="transparent">
      <q-bar class="transparent" :class="$q.platform.is.electron ? 'q-electron-drag' : ''">
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
        <div v-if="$q.platform.is.electron" class="row no-wrap items-center gap-sm q-pl-md">
          <q-btn dense flat round :color="$q.dark.mode ? 'white' : 'black'" size="sm" icon="mdi-window-minimize" @click="minimize()" />
          <q-btn dense flat round :color="$q.dark.mode ? 'white' : 'black'" size="sm" @click="toggleMaximize()">
            <WindowToggle
                v-if="isMax"
                :color="$q.dark.mode ? 'white' : 'black'"
            />
            <q-icon v-else name="mdi-window-maximize" />
          </q-btn>
          <q-btn
              dense
              round
              size="sm"
              icon="close"
              :class="hoverClose ? 'bg-red' : $q.dark.mode ? 'bg-black' : 'bg-negative'"
              @mouseenter="hoverClose = true"
              @mouseleave="hoverClose = false"
              @click="closeApp()"
          />
        </div>
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page class="overflow-hidden">
        <BgEffects v-if="$q.screen.gt.xs && !uiStore.disableBgEffects" />
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
import BgEffects from './BgEffects.vue'

const $q = useQuasar();
const is_development = ref(process.env.DEV);
onBeforeMount(() => {
  uiStore.topbarShow = false
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
