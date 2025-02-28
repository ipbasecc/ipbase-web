<template>
  <div
    v-if="
      userStore?.logged &&
      $route.name !== 'login' &&
      $route.name !== 'register' &&
      teamStore?.init
    "
    class="cursor-pointer"
  >
    <UserAvatar
      :image="avatar"
      :user_id="mmUser.user?.id"
      :size="avatarSizeRef"
      :status="mmUser.status"
      :disable_card="true"
      :indicator_size="'10px'"
    />
    <q-menu
      :anchor="menu_anchor"
      :self="menu_self"
      :offset="menu_offset"
      :transition-show="show"
      :transition-hide="hide"
      @show="confirmOut = false"
      @hide="confirmOut = false"
      class="z-max"
    >
      <q-list dense bordered style="min-width: 14rem" class="q-pa-xs radius-sm">
        <q-item
          clickable
          v-close-popup
          class="radius-xs q-pa-lg"
          @click="toUserCenter()"
        >
          <q-item-section avatar class="q-pa-xs">
            <UserAvatar
              :user_id="mm_user.id"
              :size="48"
              :status="mmUser.status"
            />
          </q-item-section>
          <q-item-section class="font-bold-600 font-medium q-pl-sm"
            >@ {{ mm_user.nickname || mm_user.username }}</q-item-section
          >
          <q-tooltip
            class="z-max"
            :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
            >{{ $t('user_center') }}</q-tooltip
          >
        </q-item>
        <q-separator spaced class="op-3" />

        <template v-if="mmUser.user?.id">
          <q-item
            v-for="i in statuses"
            :key="i.status"
            clickable
            v-close-popup
            class="radius-xs"
            @click="setStatus(i.status)"
          >
            <q-item-section side>
              <q-icon :name="i.icon" size="24" :color="i.color" />
            </q-item-section>
            <q-item-section>{{ i.name }}</q-item-section>
          </q-item>
        </template>
        <q-separator spaced class="op-3" />
        <q-item
          clickable
          v-close-popup
          class="radius-xs"
          @click="show_settings = true"
        >
          <q-item-section side>
            <q-icon name="toggle_on" />
          </q-item-section>
          <q-item-section>{{ $t('user_settings') }}</q-item-section>
        </q-item>
        <q-item
          v-if="!$q.platform.is.electron"
          clickable
          v-close-popup
          class="radius-xs"
          @click="clearCacheFn"
        >
          <q-item-section side>
            <q-icon name="mdi-refresh" />
          </q-item-section>
          <q-item-section>{{ $t('reload_app') }}</q-item-section>
        </q-item>
        <q-item
          v-if="!confirmOut"
          clickable
          v-close-popup
          @click="confirmOut = true"
          class="radius-xs"
        >
          <q-item-section side>
            <q-icon name="mdi-exit-to-app" />
          </q-item-section>
          <q-item-section>{{ $t('logout') }}</q-item-section>
        </q-item>
        <q-item
          v-else
          clickable
          v-close-popup
          @click="logout"
          class="radius-xs bg-negative text-white"
        >
          <q-item-section side>
            <q-icon name="mdi-exit-to-app" />
          </q-item-section>
          <q-item-section>{{ $t('logout_confirm') }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
  <template
    v-if="
      !userStore?.logged && $route.name !== 'login' && $route.name !== 'register'
    "
  >
    <q-btn
      flat
      unelevated
      padding="xs md"
      color="primary"
      :label="$t('login')"
      @click="$router.push('/login')"
    />
    <q-btn
      unelevated
      padding="xs md"
      class="q-ml-sm"
      color="primary"
      :label="$t('regist')"
      @click="$router.push('/register')"
    />
  </template>
  <q-btn v-if="!userStore?.logged && vertical" round outline icon="person">
    <q-menu
      :anchor="menu_anchor"
      :self="menu_self"
      :offset="menu_offset"
      :transition-show="show"
      :transition-hide="hide"
      class="z-max"
    >
      <q-list dense bordered style="min-width: 7rem" class="q-pa-xs radius-sm">
        <q-item
          clickable
          v-close-popup
          class="radius-xs"
          @click="$router.push('/login')"
        >
          <q-item-section side>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>{{ $t('login') }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          class="radius-xs"
          @click="$router.push('/register')"
        >
          <q-item-section side>
            <q-icon name="person_add" />
          </q-item-section>
          <q-item-section>{{ $t('regist') }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <q-dialog
    v-model="show_settings"
    full-height
    transition-show="slide-down"
    transition-hide="slide-up"
    transition-duration="500"
    class="z-max"
  >
    <UserSettings />
  </q-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  logout as mmlogout,
  updateUserStatus,
  getUserStatus,
} from "src/api/mattermost.js";
import { teamStore, userStore } from "src/hooks/global/useStore";

import useChannelStore from "src/stores/channel.js";

import UserAvatar from "src/pages/team/components/user/UserAvatar.vue"; // Mattermost

import UserSettings from "src/pages/Chat/components/user/UserSettings.vue";
import { toRef } from "vue";
import localforage from "localforage";
import mmUserStore from "src/stores/mmuser.js";
import useProjectStore from "src/stores/project.js";
import { clearLocalDB } from 'src/pages/team/hooks/useUser.js'
import { useI18n } from 'vue-i18n'
import { clearCache } from 'src/hooks/utilits';

const { t } = useI18n()

const props = defineProps({
  avatarSize: {
    type: Number,
    default: 38,
  },
  menu_anchor: {
    type: String,
    default: "bottom end",
  },
  menu_self: {
    type: String,
    default: "top end",
  },
  menu_offset: {
    type: Array,
    default() {
      return [0, 0];
    },
  },
  show: {
    type: String,
    default: "fade",
  },
  hide: {
    type: String,
    default: "fade",
  },
  vertical: {
    type: Boolean,
    default: false,
  },
});

const avatarSizeRef = toRef(props, "avatarSize");
const avatar = computed(() => teamStore.init?.wechat_profile?.avatar || teamStore.init?.profile?.avatar?.url);
const router = useRouter();
const channelStore = useChannelStore();
const mmUser = mmUserStore();
const projectStore = useProjectStore();

const getUserStatusFn = async () => {
  const mmUserId = localStorage.getItem("mmUserId");
  const res = await getUserStatus(mmUserId);
  if (res) {
    mmUser.status = res;
  }
};
getUserStatusFn();
const clearCacheFn = async () => {
  await clearCache();
}
// 注销动作开始
const confirmOut = ref(false);
const logout = async () => {
  await mmlogout();
  await clearLocalDB('AcciuntMenu');
  localStorage.setItem(
    "isViewedIds",
    JSON.stringify(userStore.viewed.map((i) => i.id))
  ); //将userStore中已阅读ID清单存入本地存储
  userStore.$reset(); //重置store
  channelStore.$reset();
  projectStore.$reset_project();
  projectStore.$reset_person();
  confirmOut.value = false;
  await router.push("/");
};
// 注销动作结束

const me_profile = ref(null);
async function getData() {
  try {
    const _value = await localforage.getItem("mm_me");
    if(_value){
      me_profile.value = _value;
    }
  } catch (err) {
    console.log(err);
  }
}
getData();

const mm_user = computed(() => mmUser.user);

localforage
  .getItem("mm_profile")
  .then(async function (res) {
    if (res?.id) {
      // console.log('搞到mm_id了',res);
      mmUser.user = res;
      mmUser.user_id = res?.id;
    }
  })
  .catch(function (err) {
    console.error(err);
  });

const statuses = ref([
  {
    status: "online",
    name: t('status_online'),
    color: "positive",
    icon: "mdi-checkbox-marked-circle",
  },
  { status: "away", name: t('status_away'), color: "orange", icon: "schedule" },
  {
    status: "dnd",
    name: t('status_dnd'),
    color: "deep-orange-9",
    icon: "mdi-minus-circle",
  },
  {
    status: "offline",
    name: t('status_offline'),
    color: "grey",
    icon: "radio_button_unchecked",
  },
]);

const setStatus = async (val) => {
  let parmars = {
    user_id: mm_user.value.id,
    status: val,
  };
  let _setRes = await updateUserStatus(mm_user.value.id, parmars);
  if (_setRes) {
    mmUser.status = _setRes;
  }
};

const toUserCenter = () => {
  localforage.setItem("last_module", "user_center").then(() => {
    router.push("/userinfo");
  });
};

const show_settings = ref(false);
</script>

<style lang="scss" scoped></style>
