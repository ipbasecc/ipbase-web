<template>
  <template v-if="teamStore.init">
    <div v-if="!teamStore.init.initialization && hasToken" class="absolute-full radius-xs overflow-hidden"
    :style="$q.screen.gt.md ? 'padding: 10vh 10vw' : 'padding: 0'">
        <InitializationUser class="fit" @Initialized="Initialized" />
    </div>
    <template v-else>
      <q-layout
        v-if="!needLogin"
        view="hHh LpR lFr"
        class="absolute-full border-negative radius-xs overflow-hidden"
      >
        <q-header v-if="uiStore.showAppNotification" class="transparent">
          <AppNotification />
        </q-header>
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
          <q-page :class="$q.screen.gt.sm ? '' : 'font-large'">
              <RouterView />
          </q-page>
        </q-page-container>
        <q-footer
          v-if="!$q.screen.gt.xs && !uiStore.hide_footer"
          class="transparent border-top q-pb-lg"
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
        <q-btn flat dense padding="xs md" :label="$t('connect_refused_btn_label')" v-close-popup @click="serverRefusedHandler()" />
        <q-space />
        <q-btn dense padding="xs md" :label="$t('connect_refused_btn_pageRefresh_label')" color="primary" @click="pageRefresh()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {watch, computed, onBeforeMount, onMounted, onUnmounted, ref, watchEffect} from "vue";
import {loginAndInit} from 'src/hooks/init.js'
import {useRoute, useRouter} from "vue-router";
import AccountMenu from "../pages/team/components/AccountMenu.vue";
import AppList from "components/VIewComponents/AppList.vue";
import shortcut from "src/pages/team/hooks/useShortcut.js";
import {useQuasar} from "quasar";
import useWatcher from "src/pages/team/wsWatcher.js";
import {_ws, closeWs} from "src/pages/team/ws.js";
import AppUtils from "src/components/VIewComponents/AppUtils.vue";
import {clearLocalDB} from "pages/team/hooks/useUser";
import InitializationUser from 'src/pages/team/settings/initialization/InitializationUser.vue'
import {teamStore, uiStore, userStore} from "src/hooks/global/useStore";

import {getUserData} from "src/hooks/global/useGetMyMatedata.js";
import { serverInfo } from 'src/boot/server.js'
import localforage from "localforage";
import {toggleTeam} from "src/pages/team/hooks/useTeam.js";
import AppNotification from 'src/pages/team/components/AppNotification.vue'
import { useSocket } from 'src/pages/team/hooks/useSocket.js'

import { isTokenExpired } from 'src/hooks/utilits.js'

getUserData();
useSocket();

const $q = useQuasar();
const appListWidth = ref(64);

watchEffect(() => {
  if (!$q.screen.gt.xs) {
    uiStore.appDrawer = false;
  }
});
const checkNotification = async () => {
  if (!serverInfo.value?.notification || serverInfo.value?.notification === '') {
    uiStore.showAppNotification = false;
  } else {
    const _cacheKey = `showAppNotification`;
    const notificationCache = await localforage.getItem(_cacheKey);
    if(!notificationCache || notificationCache?.content !== serverInfo.value?.notification){
      uiStore.showAppNotification = true;
    }
  }
}

// 必须有token时才判断要不要显示初始化用户组件
const hasToken = computed(() => {
  let _strapi_jwt = localStorage.getItem('jwt');
  let _mm_token = localStorage.getItem('mmtoken');
  return _strapi_jwt && _mm_token
})
onBeforeMount(async() => {
  // 检查jwt是否过期
  // 过期后：electron发送清理消息并跳转到登陆，其他直接清理并登陆
  let isExpired
  const jwt = localStorage.getItem('jwt');
  if(jwt){
    isExpired = isTokenExpired(jwt)
  }
  if(isExpired){
    toLogin();
  } else {
    uiStore.pageLoaded = true;
    if(!teamStore.init){
      await loginAndInit();
      if(teamStore.init && !teamStore.init.default_team){
        const cache = await localforage.getItem('default_team');
        if(cache){
          // 不要直接赋值，方法内部有更多事件处理
          await toggleTeam(cache)
        }
      }
    }
    await checkNotification();
  }
})

// 开发环境下，关闭 仅electron可用模式
onMounted(async () => {
  if (process.env.NODE_ENV === 'development') {
    // uiStore.only_electron = [];
  }
})
const Initialized = (val) => {
  teamStore.init.initialization = val;
}
const needLogin = computed(() => 
  uiStore.axiosError?.response?.data?.id === 'api.context.session_expired.app_error'
  || uiStore.axiosError?.response?.data?.error?.name === 'UnauthorizedError'
);

const need_show_footer = ["teams", "AffairsPage", "team_threads_homepage", "ChatsPage"];
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
const pullDownRefresh = (done) => {
  done();
  pageRefresh();
}

onMounted(() => {
  shortcut();
  _ws();
  useWatcher();
  uiStore.$pageloaded();
});
onUnmounted(() => {
  closeWs();
});

</script>
