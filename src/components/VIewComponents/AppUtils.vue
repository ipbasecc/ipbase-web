<template>
  <div class="app-utils column no-wrap gap-sm">
    <NotifyContainer />
    <q-btn flat dense round icon="info">
      <q-menu anchor="bottom right" self="bottom left" class="transparent">
        <q-list
          dense
          bordered
          class="radius-sm q-pa-xs"
          :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-1'"
        >
          <q-item
            v-for="i in helpItems"
            :key="i.val"
            clickable
            v-close-popup
            @click="helpItem = i.val"
            class="radius-xs text-no-wrap"
          >
            <q-item-section side>
              <q-icon :name="i.icon"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t(i.label) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-tooltip class="border text-no-wrap" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
        使用手册、快捷键
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="is_development"
      flat
      dense
      round
      icon="dark_mode"
      @click="$q.dark.toggle()"
    />
    <q-btn
      v-if="!$q.platform.is.electron"
      flat
      dense
      round
      icon="browser_updated"
      @click="showDownloadApp = true"
    >
      <q-tooltip class="border text-no-wrap" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
        下载桌面版
      </q-tooltip>
    </q-btn>
    <LocalToggler />
    <q-dialog v-model="infoDlg" full-height>
      <q-card bordered class="column" style="min-width: 60vw">
        <q-toolbar class="transparent border-bottom q-py-xs">
          <q-space />
          <q-btn dense round flat icon="close" @click="helpItem = void 0"></q-btn>
        </q-toolbar>
        <q-card-section class="q-space">
          <AppManual v-if="helpItem === 'manual'" class="fit" />
          <AppShortcut v-if="helpItem === 'shortcut'" class="fit" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDownloadApp" persistent maximized class="z-max">
      <div class="flex flex-center overflow-hidden">
        <DownloadApp />
      </div>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import AppManual from "src/components/VIewComponents/AppManual.vue";
import AppShortcut from "src/components/VIewComponents/AppShortcut.vue";
import DownloadApp from './DownloadApp.vue'
import LocalToggler from './LocalToggler.vue'
import NotifyContainer from './NotifyContainer.vue'
const is_development = import.meta.env.DEV;
const showDownloadApp = ref(false);


const helpItem = ref();
const helpItems = [
  { val: "manual", label: "manual", icon: "support" },
  { val: "shortcut", label: "shortcut", icon: "keyboard_command_key" },
];
const infoDlg = computed(() => helpItem.value !== void 0);
</script>
