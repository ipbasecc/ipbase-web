<template>
    <q-btn flat dense :round="round" icon="translate">
      <q-menu anchor="bottom right" self="bottom left" class="transparent q-electron-drag--exception">
        <q-list
          dense
          bordered
          class="radius-sm q-pa-xs"
          :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-1'"
        >
          <q-item
            v-for="i in uiStore.localeOptions"
            :key="i.val"
            clickable
            v-close-popup
            @click="setLocale(i.val)"
            class="radius-xs"
            :class="locale === i.val ? 'bg-primary' : ''"
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
      <q-tooltip class="border text-no-wrap" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
        {{ $t('switch_language') }}
      </q-tooltip>
    </q-btn>
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { uiStore } from 'src/hooks/global/useStore';
import { useI18n } from "vue-i18n";
import localforage from 'localforage';
import "/node_modules/flag-icons/css/flag-icons.min.css";

const { round = true } = defineProps(['round'])
const { locale } = useI18n({ useScope: "global" });

const setLocale = async (val) => {
  locale.value = val;
  await localforage.setItem("locale", val);
};
const restoreLocal = async () => {
  const _init = await localforage.getItem("init");
  if(_init?.config?.lang){
    locale.value = _init?.config?.lang
    // console.log('locale.value', locale.value);
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
</script>
