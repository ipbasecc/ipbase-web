<template>
  <div
    v-if="
      $route.name !== 'login' &&
      $route.name !== 'register' &&
      teamStore.init
    "
    class="cursor-pointer"
  >
    <UserAvatar
      v-if="mmUser.user?.id"
      :user_id="mmUser.user?.id"
      :size="avatarSizeRef"
      :status="mmUser.status"
      :disable_card="true"
      :indicator_size="'10px'"
      :image="teamStore.init?.wechat_profile?.avatar || teamStore.init?.profile?.avatar?.url || null"
    />
    <q-avatar v-else :size="avatarSizeRef.toString()">
      <q-img
        :src="avatar"
        :ratio="1"
        spinner-color="primary"
        :spinner-size="`${avatarSizeRef - 12}px`"
      />
    </q-avatar>
    <q-menu
      :anchor="menu_anchor"
      :self="menu_self"
      :offset="menu_offset"
      :transition-show="show"
      :transition-hide="hide"
      transition-duration="100"
      @show="confirmOut = false"
      @hide="confirmOut = false"
      class="z-max"
    >
      <q-list
        bordered
        dense
        style="min-width: 14rem"
        class="q-pa-xs radius-sm"
        :class="$q.dark.mode ? 'text-grey-1' : 'bg-white text-grey-10'"
      >
        <q-item clickable class="radius-xs q-pa-lg">
          <q-item-section avatar class="q-pa-xs">
            <UserAvatar
              :user_id="mm_user.id"
              :size="48"
              :status="mmUser.status"
              :image="teamStore.init?.wechat_profile?.avatar || teamStore.init?.profile?.avatar?.url || null"
            />
          </q-item-section>
          <q-item-section class="font-bold-600 font-medium q-pl-sm"
            >@ {{ teamStore.init?.username }}</q-item-section
          >
        </q-item>
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
          <q-item-section>{{ $t('user_settings')}}</q-item-section>
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
          <q-item-section>{{ $t('clear_cache') }}</q-item-section>
        </q-item>
        <q-item
          v-if="!confirmOut"
          clickable
          v-close-popup
          @click="confirmOut = true"
          class="radius-xs"
        >
          <q-item-section side>
            <q-icon
              name="mdi-exit-to-app"
              :color="confirmOut ? 'white' : ''"
            />
          </q-item-section>
          <q-item-section>{{ $t('logout')}}</q-item-section>
        </q-item>
        <q-item
          v-else
          clickable
          v-close-popup
          @click="logout"
          class="radius-xs bg-negative text-white"
        >
          <q-item-section side>
            <q-icon
              name="mdi-exit-to-app"
              :color="confirmOut ? 'white' : ''"
            />
          </q-item-section>
          <q-item-section>{{ $t('logout_confirm')}}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
  <template
    v-if="
      !teamStore?.init && $route.name !== 'login' && $route.name !== 'register'
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
  <q-btn v-if="!teamStore?.init && vertical" round outline icon="person">
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
    :maximized="!$q.screen.gt.xs"
    :full-height="$q.screen.gt.xs"
    transition-show="slide-down"
    transition-hide="slide-up"
    transition-duration="500"
    class="z-max"
  >
    <UserSettings />
  </q-dialog>
</template>

<script setup>
import {computed, ref, toRef, watchEffect} from "vue";
import { useRouter } from "vue-router";
import {
  logout as mmlogout,
  updateUserStatus,
  getUserStatus,
} from "src/api/mattermost.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue"; // Mattermost
import UserSettings from "./user/UserSettings.vue";
import localforage from "localforage";
import TeamList from "./TeamList.vue";
import {
  mmUser,
  channelStore,
  teamStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import {clearLocalDB} from "pages/team/hooks/useUser";
import { useI18n } from 'vue-i18n'
import { clearCache } from 'src/hooks/utilits';

const { t } = useI18n()

const props = defineProps({
  avatarSize: {
    type: Number,
    default: 26,
  },
  menu_anchor: {
    type: String,
    default: "bottom right",
  },
  menu_self: {
    type: String,
    default: "top end",
  },
  menu_offset: {
    type: Array,
    default() {
      return [-8, -8];
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
  revers: {
    type: Boolean,
    default: false,
  },
});

const avatarSizeRef = toRef(props, "avatarSize");

const avatar = computed(() => teamStore.init?.wechat_profile?.avatar || teamStore.init?.profile?.avatar?.url);
const userChannelId = computed(() => teamStore.init?.user_channel?.id);

const router = useRouter();

const ipbase_uri = computed(() => {
  return `/brand/${userChannelId.value}/posts` || "/";
});

const getUserStatusFn = async () => {
  if (!teamStore.init) return;
  const mmUserId = localStorage.getItem("mmUserId");
  if (!mmUserId) return;
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
  channelStore.$reset();
  teamStore.$reset_project();
  teamStore.$reset();
  await mmlogout();
  confirmOut.value = false;
  await clearLocalDB('AccountMenu.vue');
  await router.push("/login");
};
// 注销动作结束

const mm_user = computed(() => mmUser.user);
const is_development = ref(import.meta.env.DEV);

const statuses = ref([
  {
    status: "online",
    name: 'status_online',
    color: "positive",
    icon: "mdi-checkbox-marked-circle",
  },
  { status: "away", name: 'status_away', color: "orange", icon: "schedule" },
  {
    status: "dnd",
    name: 'status_dnd',
    color: "deep-orange-9",
    icon: "mdi-minus-circle",
  },
  {
    status: "offline",
    name: 'status_offline',
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

const toStudioHome = () => {
  uiStore.app = 'studio'
  router.push(`/studio`)
};

const toBusinessPage = () => {
  uiStore.app = 'business'
  router.push(`/business`)
}

const emit = defineEmits(["createTeam"]);
const createTeam = () => {
  emit("createTeam");
};

const show_settings = ref(false);

</script>

<style lang="scss" scoped></style>
