<template>
  <q-layout v-if="!needLogin" v-bind="$attrs" view="hHh LpR lFr" class="absolute-full border-negative radius-xs overflow-hidden">
    <q-header v-if="uiStore.showAppNotification" class="transparent">
      <AppNotification />
    </q-header>
    <NavigatorHeader v-else-if="$q.screen.gt.xs || !uiStore.hide_top" />
    <q-drawer v-if="$q.screen.gt.xs" side="left" v-model="uiStore.appDrawer" :breakpoint="640" :width="appListWidth"
      :class="`${$q.dark.mode ? 'bg-darker' : 'bg-primary-darker text-grey-1'
        } ${$q.screen.gt.md ? 'q-pa-sm' : 'q-pa-xs'}`" class="border-right">
      <div class="fit column no-wrap gap-md items-center q-py-md">
        <TeamList />
        <q-space class="full-width" :class="$q.platform.is.electron ? 'q-electron-drag' : ''" />
        <AppUtils />
      </div>
    </q-drawer>
    <q-page-container>
      <q-page v-if="teamStore.team" :class="$q.screen.gt.sm ? '' : 'font-large'">
        <RouterView />
      </q-page>
    </q-page-container>
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
  <AgreementCard v-model="showAgreement" @agreeAgreement="agreeAgreement" :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-1'" />
</template>

<script setup>
  import { watch, computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
  import { loginAndInit } from 'src/hooks/init.js'
  import { useRoute, useRouter } from "vue-router";
  import shortcut from "src/pages/team/hooks/useShortcut.js";
  import { useQuasar } from "quasar";
  import useWatcher from "src/pages/team/wsWatcher.js";
  import { _ws, closeWs } from "src/pages/team/ws.js";
  import AppUtils from "src/components/VIewComponents/AppUtils.vue";
  import { clearLocalDB } from "pages/team/hooks/useUser";
  import { teamStore, uiStore, dealStore, mm_wsStore, chatStore } from "src/hooks/global/useStore";
  import { serverInfo } from 'src/boot/server.js'
  import localforage from "localforage";
  import { toggleTeam } from "src/pages/team/hooks/useTeam.js";
  import AppNotification from 'src/pages/team/components/AppNotification.vue'
  import { useSocket } from 'src/pages/team/hooks/useSocket.js'

  import { isTokenExpired } from 'src/hooks/utilits.js'
  import MeetPage from 'src/pages/team/meet/MeetPage.vue'
  import DialogNotify from 'src/components/VIewComponents/DialogNotify.vue'
  import AgreementCard from '../components/VIewComponents/AgreementCard.vue'
  import { updateUser } from 'src/api/strapi.js'
  import { clearCache } from 'src/hooks/utilits';
  import TeamList from 'src/pages/team/components/TeamList.vue'
import NavigatorHeader from 'src/pages/team/components/NavigatorHeader.vue'

  useSocket();

  const $q = useQuasar();
  const appListWidth = ref(64);
  const showAgreement = ref(false);
  const agreeAgreement = async () => {
    showAgreement.value = false;
    const _params = {
      data: {
        agreeAgreementAt: new Date().getTime()
      }
    }
    const {data} = await updateUser(teamStore.init?.id, _params);
    teamStore.init.agreeAgreementAt = data.agreeAgreementAt;
  }
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

      if(!teamStore.init.agreeAgreementAt) {
        showAgreement.value = true;
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
  const serverRefusedHandler = async () => {
    localStorage.clear();
    uiStore.axiosStautsCode = void 0;
    await clearCache();
    router.push('/login')
  }
  const pageRefresh = async () => {
    await clearCache();
    window.location.reload();
  };

  const restoreDefaultTeam = async () => {
    try {
      const defaultTeam = await localforage.getItem('default_team')
      
      if (defaultTeam) {
        console.log('defaultTeam', defaultTeam.id);
        await toggleTeam(defaultTeam);
      } else if (teamStore.teams?.length > 0) {
        // 如果没有上次的团队记录，使用第一个可用的团队
        await toggleTeam(teamStore.teams[0].id);
      }
    } catch (error) {
      console.error('Failed to restore default team:', error);
      // 可以在这里添加错误处理逻辑
    }
  };
  watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);
        if(message.message !== '') {
          if(chatStore.unread[message.props.strapi_user_id]) {
            chatStore.unread[message.props.strapi_user_id]++
          } else {
            chatStore.unread[message.props.strapi_user_id] = 1
          }
          chatStore.unread[teamStore.direct_user?.id] = 0
        }
      }
    },
    { immediate: true, deep: true }
);

</script>
