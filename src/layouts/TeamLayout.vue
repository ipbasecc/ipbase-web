<template>
  <template v-if="teamStore.init">
    <div v-if="!teamStore.init.initialization" class="absolute-full radius-xs overflow-hidden"
      :style="$q.screen.gt.md ? 'padding: 10vh 10vw' : 'padding: 0'">
      <InitializationUser class="fit" @Initialized="Initialized" />
    </div>
    <template v-else>
      <q-layout v-if="!needLogin" view="hHh LpR lFr" class="absolute-full border-negative radius-xs overflow-hidden">
        <q-header v-if="uiStore.showAppNotification" class="transparent">
          <AppNotification />
        </q-header>
        <q-drawer v-if="$q.screen.gt.xs" side="left" v-model="uiStore.appDrawer" :breakpoint="640" :width="appListWidth"
          :class="`${$q.dark.mode ? 'bg-darker' : 'bg-primary-darker text-grey-1'
            } ${$q.screen.gt.md ? 'q-pa-sm' : 'q-pa-xs'}`" class="border-right">
          <div class="fit column no-wrap gap-md items-center q-py-md">
            <AppList />
            <q-space class="full-width" :class="$q.platform.is.electron ? 'q-electron-drag' : ''" />
            <AppUtils />
            <AccountMenu menu_anchor="bottom end" menu_self="bottom left" :menu_offset="[10, 0]"
              :avatarSize="$q.screen.gt.md ? 36 : 28" show="slide-up" hide="slide-down" :vertical="true"
              :revers="true" />
          </div>
        </q-drawer>
        <q-page-container>
          <q-page :class="$q.screen.gt.sm ? '' : 'font-large'">
            <RouterView />
          </q-page>
        </q-page-container>
        <q-footer v-if="!$q.screen.gt.xs && !uiStore.hide_footer" class="transparent border-top q-pb-lg">
          <AppList />
        </q-footer>
      </q-layout>
      <div v-else class="absolute-full column flex-center">
        <q-card bordered class="focus-form" style="min-width: 16rem">
          <q-card-section class="font-xx-large font-bold-600 flex flex-center q-py-mg">
            {{ $t('please_login') }}
          </q-card-section>
          <q-card-section class="q-pa-sm border-top">
            <q-btn color="primary" icon="login" :label="$t('login_now')" class="full-width" @click="toLogin()" />
          </q-card-section>
        </q-card>
      </div>
      <MeetPage v-if="uiStore.init_meet" v-show="uiStore.show_meet" />
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
        <q-btn flat dense padding="xs md" :label="$t('connect_refused_btn_label')" v-close-popup
          @click="serverRefusedHandler()" />
        <q-space />
        <q-btn dense padding="xs md" :label="$t('connect_refused_btn_pageRefresh_label')" color="primary"
          @click="pageRefresh()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <DialogNotify />
</template>

<script setup>
  import { watch, computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
  import { loginAndInit } from 'src/hooks/init.js'
  import { useRoute, useRouter } from "vue-router";
  import AccountMenu from "../pages/team/components/AccountMenu.vue";
  import AppList from "components/VIewComponents/AppList.vue";
  import shortcut from "src/pages/team/hooks/useShortcut.js";
  import { useQuasar } from "quasar";
  import useWatcher from "src/pages/team/wsWatcher.js";
  import { _ws, closeWs } from "src/pages/team/ws.js";
  import AppUtils from "src/components/VIewComponents/AppUtils.vue";
  import { clearLocalDB } from "pages/team/hooks/useUser";
  import InitializationUser from 'src/pages/team/settings/initialization/InitializationUser.vue'
  import { teamStore, uiStore, userStore, dealStore } from "src/hooks/global/useStore";

  import { getUserData } from "src/hooks/global/useGetMyMatedata.js";
  import { serverInfo } from 'src/boot/server.js'
  import localforage from "localforage";
  import { toggleTeam } from "src/pages/team/hooks/useTeam.js";
  import AppNotification from 'src/pages/team/components/AppNotification.vue'
  import { useSocket } from 'src/pages/team/hooks/useSocket.js'

  import { isTokenExpired } from 'src/hooks/utilits.js'
  import MeetPage from 'src/pages/team/meet/MeetPage.vue'
  import DialogNotify from 'src/components/VIewComponents/DialogNotify.vue'

  getUserData();
  useSocket();

  const $q = useQuasar();
  const appListWidth = ref(64);

  watchEffect(() => {
    if (!$q.screen.gt.xs) {
      uiStore.appDrawer = false;
    }
  });

  const stopWatches = [];

  const checkJWTExpiration = () => {
    const jwt = localStorage.getItem('jwt');
    return jwt ? isTokenExpired(jwt) : true;
  };

  const initFn = async () => {
    try {
      // if (checkJWTExpiration()) {
      //   await toLogin();
      //   return;
      // }

      uiStore.pageLoaded = true;

      if (!teamStore.init || !teamStore.team || uiStore.reINIT) {
        await loginAndInit();
        await restoreDefaultTeam();
        dealStore.verified = teamStore.init.by_certification?.verified || false
      }

      await checkNotification();
    } catch (error) {
      console.error('Initialization failed:', error);
      // 处理错误...
    }
  };

  const checkNotification = async () => {
    try {
      if (!serverInfo.value?.notification) {
        uiStore.showAppNotification = false;
        return;
      }

      const _cacheKey = `showAppNotification`;
      const notificationCache = await localforage.getItem(_cacheKey);
      uiStore.showAppNotification = !notificationCache ||
        notificationCache?.content !== serverInfo.value?.notification;
    } catch (error) {
      console.error('Failed to check notification:', error);
      uiStore.showAppNotification = false;
    }
  };

  const setupWatchers = () => {
    stopWatches.push(
      watch(inited, initFn, { immediate: true, deep: true }),
      watch(reInit, async () => {
        if (reInit.value) {
          await initFn();
          uiStore.reINIT = false;
        }
      })
    );
  };

  onUnmounted(() => {
    stopWatches.forEach(stop => stop());
    closeWs();
  });

  onMounted(() => {
    setupWatchers();
    shortcut();
    _ws();
    useWatcher();
    uiStore.$pageloaded();
  });

  const toLogin = async () => {
    uiStore.axiosStautsCode = void 0;
    await clearLocalDB('TeamLayout.vue');
    window.location.reload();
  };

  const inited = computed(() => teamStore.init);

  const reInit = computed(() => uiStore.reINIT);

  // 开发环境下，关闭 仅electron可用模式
  onMounted(async () => {
    if (import.meta.env.NODE_ENV === 'development') {
      // uiStore.only_electron = [];
    }
  })
  const Initialized = (val) => {
    console.log('Initialized', val);

    teamStore.init.initialization = val;
  }
  const needLogin = computed(() =>
    uiStore.axiosError?.response?.data?.id === 'api.context.session_expired.app_error'
    || uiStore.axiosError?.response?.data?.error?.name === 'UnauthorizedError'
  );

  const need_show_footer = ["teams", "AffairsPage", "team_threads_homepage", "ChatsPage", "NotebookPage", "NotebookDetial"];
  const need_show_top = ["teams"];
  const route = useRoute();
  const router = useRouter();
  const routeName = computed(() => route.name);
  watchEffect(() => {
    uiStore.hide_footer = !need_show_footer.includes(routeName.value);
    uiStore.hide_top = !need_show_top.includes(routeName.value);
  });

  const connect_refused = computed(() => uiStore.serverResfused);
  const serverRefusedHandler = () => {
    localStorage.clear();
    userStore.logged = false
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

  const restoreDefaultTeam = async () => {
    try {
      const lastTeamId = localStorage.getItem('lastTeamId');
      if (lastTeamId) {
        await toggleTeam(lastTeamId);
      } else if (teamStore.teams?.length > 0) {
        // 如果没有上次的团队记录，使用第一个可用的团队
        await toggleTeam(teamStore.teams[0].id);
      }
    } catch (error) {
      console.error('Failed to restore default team:', error);
      // 可以在这里添加错误处理逻辑
    }
  };

</script>
