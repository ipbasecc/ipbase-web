<template>
  <div class="app-utils column no-wrap gap-sm">
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
    </q-btn>
    <q-btn
      v-if="is_development"
      flat
      dense
      round
      icon="dark_mode"
      @click="$q.dark.toggle()"
    />
    <q-btn flat dense round icon="translate">
      <q-menu anchor="bottom right" self="bottom left" class="transparent">
        <q-list
          dense
          bordered
          class="radius-sm q-pa-xs"
          :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-1'"
        >
          <q-item
            v-for="i in localeOptions"
            :key="i.val"
            clickable
            v-close-popup
            @click="setLocale(i.val)"
            class="radius-xs"
          >
            <q-item-section side>
              <span :class="`fi fi-${i.flag_key}`"></span>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ i.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-dialog v-model="infoDlg" full-height>
      <q-card bordered class="column" style="min-width: 60vw">
        <q-bar class="transparent border-bottom q-py-xs">
          <q-space />
          <q-btn dense round icon="close" @click="helpItem = void 0"></q-btn>
        </q-bar>
        <q-card-section class="q-space">
          <AppManual v-if="helpItem === 'manual'" class="fit" />
          <AppShortcut v-if="helpItem === 'shortcut'" class="fit" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import AppManual from "src/components/VIewComponents/AppManual.vue";
import AppShortcut from "src/components/VIewComponents/AppShortcut.vue";
import localforage from "localforage";
import "/node_modules/flag-icons/css/flag-icons.min.css";

const is_development = process.env.DEV;
const { locale } = useI18n({ useScope: "global" });

const localeOptions = [
  { val: "zh-CN", label: "中文", flag_key: 'cn' },
  { val: "en-US", label: "English", flag_key: 'gb' },
  { val: "de-DE", label: "Deutsch", flag_key: 'de' },
];
const setLocale = async (val) => {
  locale.value = val;
  await localforage.setItem("locale", val);
};
const restoreLocal = async () => {
  const _init = await localforage.getItem("init");
  if(_init?.config?.lang){
    locale.value = _init?.config?.lang
    console.log('locale.value', locale.value);
    await setLocale(locale.value)
  } else {
    const _locale = await localforage.getItem("locale");
    if (_locale) {
      locale.value = _locale;
    }
  }
};
onBeforeMount(() => {
  restoreLocal();
});

const helpItem = ref();
const helpItems = [
  { val: "manual", label: "manual", icon: "support" },
  { val: "shortcut", label: "shortcut", icon: "keyboard_command_key" },
];
const infoDlg = computed(() => helpItem.value !== void 0);
</script>
