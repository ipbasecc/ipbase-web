<template>
  <template v-if="teamStore.init">
    <div v-if="!isInititalized && hasToken" class="absolute-full radius-xs overflow-hidden"
    :style="$q.screen.gt.md ? 'padding: 10vh 10vw' : 'padding: 0'">
        <InitializationUser class="fit" />
    </div>
    <template v-else>
      <q-layout
        v-if="!needLogin"
        view="lHr LpR lfr"
        class="absolute-full border-negative radius-xs overflow-hidden"
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
    </template>
  </template>
  <q-dialog v-model="connect_refused" persistent v-bind="$attrs">
    <q-card bordered>
      <q-card-section class="row items-center border-bottom">
        <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
        <div class="q-ml-sm column no-wrap gap-sm">
          <span class="font-large">{{ $t('connect_refused_header') }}</span>
          <span class="op-6">{{ $t('connect_refused_caption') }}</span>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat dense padding="xs md" :label="$t('connect_refused_btn_pageRefresh_label')" @click="pageRefresh()" />
        <q-space />
        <q-btn dense padding="xs md" :label="$t('connect_refused_btn_label')" color="primary" v-close-popup @click="serverRefusedHandler()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, onUnmounted, onBeforeMount } from "vue";
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
import InitializationUser from 'src/pages/team/settings/initialization/InitializationUser.vue'

const $q = useQuasar();

const appListWidth = ref(64);

watchEffect(() => {
  if (!$q.screen.gt.xs) {
    uiStore.appDrawer = false;
  }
});

const isInititalized = ref(true);
// 必须有token时才判断要不要显示初始化用户组件
const hasToken = computed(() => {
  let _strapi_jwt = localStorage.getItem('jwt');
  let _mm_token = localStorage.getItem('mmtoken');
  return _strapi_jwt && _mm_token
})

const init = async () => {
  const process = (res, _from) => {
    // console.log(_from, res);
    isInititalized.value = res.initialization;
    if(res.config?.theme === 'lighter'){
      $q.dark.set(false);
    } else if(res.config?.theme === 'dark'){
      $q.dark.set(true);
    } else {
      $q.dark.set($q.dark.isActive);
    }
    teamStore.init = res;
    if(res.default_team){
      teamStore.team = res.default_team;
      teamStore.mm_team = res.default_team?.mm_team;
    }
    userStore.todogroups = res.todogroups;
    teamStore.need_refecth_projects = false;
  };
  const cache = await localforage.getItem("init");
  if (cache) {
    // console.log('cache', cache);
    process(cache, 'cache');
  }
  const _res = await init_user();
  if (_res?.data) {
    process(_res.data, 'fetch');
    await localforage.setItem("init", JSON.parse(JSON.stringify(_res?.data)));
  }
};
const loginAndInit = async () => {
  let strapiLoged;
  let mmLoged;

  const _strapi_me =await fetch_StrapiMe();
  if(_strapi_me) {
    strapiLoged = true;
  }

  const _mm_me = await fetch_MmMe();
  if(_mm_me) {
    mmLoged = true;
  }

  if(strapiLoged && mmLoged) {
    userStore.logged = true;
    init();
  }
}
onMounted(async() => {
  await loginAndInit();
  setTimeout(async() => {
    if(!hasToken.value || !teamStore.init){
      await loginAndInit();
    }
  }, 1000);
});
const needLogin = computed(() => 
  uiStore.axiosError?.response?.data?.id === 'api.context.session_expired.app_error'
  || uiStore.axiosError?.response?.data?.error?.name === 'UnauthorizedError'
);

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
const pageRefresh = () => {
  window.location.reload();
};

onMounted(() => {
  shortcut();
  _ws();
  useWatcher();
});
onUnmounted(() => {
  closeWs();
});
</script>
