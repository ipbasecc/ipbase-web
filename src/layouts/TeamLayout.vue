<template>
  <q-layout
    v-if="!needLogin"
    v-bind="$attrs"
    view="lHr LpR lfr"
    class="absolute-full border-negative"
  >
    <q-drawer
      v-if="$q.screen.gt.xs"
      side="left"
      v-model="uiStore.appDrawer"
      :breakpoint="640"
      :width="appListWidth"
      :class="`${
        $q.dark.mode ? 'bg-darker' : 'bg-primary-darker text-grey-1'
      } ${$q.screen.gt.md ? 'q-pa-sm' : 'q-pa-xs'}`"
      class="border-right"
    >
      <div class="fit column no-wrap gap-md items-center q-py-md">
        <AppList />
        <q-space
          class="full-width"
          :class="$q.platform.is.electron ? 'q-electron-drag' : ''"
        />
        <AppUtils />
        <AccountMenu
          menu_anchor="bottom end"
          menu_self="bottom left"
          :menu_offset="[10, 0]"
          :avatarSize="$q.screen.gt.md ? 36 : 28"
          show="slide-up"
          hide="slide-down"
          :vertical="true"
          :revers="true"
        />
      </div>
    </q-drawer>
    <q-page-container>
      <q-page>
        <RouterView />
      </q-page>
    </q-page-container>
    <q-footer
      v-if="!$q.screen.gt.xs && !uiStore.hide_footer"
      class="transparent border-top q-pa-xs"
    >
      <AppList />
    </q-footer>
  </q-layout>
  <div v-else class="absolute-full column flex-center">
    <q-card bordered class="focus-form" style="min-width: 16rem">
      <q-card-section
        class="font-xx-large font-bold-600 flex flex-center q-py-mg"
      >
        请先登陆
      </q-card-section>
      <q-card-section class="q-pa-sm border-top">
        <q-btn
          color="primary"
          icon="login"
          label="点此登陆"
          class="full-width"
          @click="toLogin()"
        />
      </q-card-section>
    </q-card>
  </div>
  <q-dialog v-model="connect_refused" persistent>
    <q-card bordered>
      <q-card-section class="row items-center border-bottom">
        <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
        <div class="q-ml-sm column no-wrap gap-sm">
          <span class="font-large">{{ $t('connect_refused_header') }}</span>
          <span class="op-6">{{ $t('connect_refused_caption') }}</span>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn dense padding="xs md" :label="$t('connect_refused_btn_label')" color="primary" v-close-popup @click="serverRefusedHandler()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccountMenu from "../pages/team/components/AccountMenu.vue";
import AppList from "components/VIewComponents/AppList.vue";
import { teamStore, uiStore, userStore } from "src/hooks/global/useStore";
import shortcut from "src/pages/team/hooks/useShortcut.js";
import { fetch_MmMe, fetch_StrapiMe } from "src/hooks/global/useFetchme";
import localforage from "localforage";
import { init_user } from "src/api/strapi/project";
import { useQuasar } from "quasar";
import useWatcher from "src/pages/team/wsWatcher.js";
import { _ws, closeWs } from "src/pages/team/ws.js";
import AppUtils from "src/components/VIewComponents/AppUtils.vue";
import {clearLocalDB} from "pages/team/hooks/useUser";

const $q = useQuasar();

const appListWidth = ref(64);
watchEffect(() => {
  if (!$q.screen.gt.xs) {
    uiStore.appDrawer = false;
  }
});

const todogroups = ref();
const init = async () => {
  const process = (res) => {
    teamStore.init = res.data;
    teamStore.team = res.data?.default_team;
    teamStore.mm_team = res.data?.default_team?.mm_team;
    teamStore.need_refecth_projects = false;

    todogroups.value = res.data.todogroups;
  };
  const cache = await localforage.getItem("init");
  if (cache) {
    let res = {};
    res.data = cache;
    process(res);
  }
  const _res = await init_user();
  if (_res) {
    process(_res);
    await localforage.setItem("init", JSON.parse(JSON.stringify(_res?.data)));
  }
};

const needLogin = computed(() => 
  uiStore.axiosError?.response?.data?.id === 'api.context.session_expired.app_error'
  || uiStore.axiosError?.response?.data?.error?.name === 'UnauthorizedError'
);
let strapiLoged;
let mmLoged;
fetch_StrapiMe().then(() => {
  strapiLoged = true;
  init();
});
fetch_MmMe().then(() => {
  mmLoged = true;
});
watchEffect(() => {
  if(strapiLoged && mmLoged) {
    userStore.logged = true;
  }
});

const need_show_footer = ["teams", "AffairsPage", "team_threads_homepage"];
const route = useRoute();
const router = useRouter();
const routeName = computed(() => route.name);
watchEffect(() => {
  uiStore.hide_footer = !need_show_footer.includes(routeName.value);
});
const toLogin = async () => {
  uiStore.axiosStautsCode = void 0;
  await clearLocalDB('TeamLayout.vue');
  window.location.reload();
};

const connect_refused = computed(() => uiStore.serverResfused);
const serverRefusedHandler = () => {
  localStorage.clear();
  userStore.logged=false
  uiStore.axiosStautsCode = void 0;
  router.push('/login')
}

onMounted(() => {
  shortcut();
  _ws();
  useWatcher();
});
onUnmounted(() => {
  closeWs();
});
</script>
