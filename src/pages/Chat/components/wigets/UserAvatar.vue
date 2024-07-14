<template>
  <q-avatar
    v-if="avatar"
    :size="`${size}px`"
    @click="fetch_user"
    @mouseenter="fetchStatuse(user_idRef)"
  >
    <q-img
      :src="avatar"
      :ratio="1"
      :loading-show-delay="500"
      spinner-color="primary"
      :spinner-size="`${size - 12}px`"
      loading="lazy"
    />
    <q-popup-proxy
      v-if="!disable_cardRef"
      transition-show="fade"
      transition-hide="fade"
      @show="force_fetch"
    >
      <q-card v-if="fetched_user" bordered>
        <q-card-section class="column no-wrap flex-center">
          <div
            v-if="fetched_user.roles.includes('system_user')"
            class="absolute-top-left q-pa-sm"
          >
            系统管理员
          </div>
          <div class="absolute-top-right q-pa-sm">
            <q-btn flat round dense size="sm" icon="close" v-close-popup />
          </div>
          <div class="q-pa-lg">
            <q-avatar size="100px">
              <q-img
                :src="avatar"
                :ratio="1"
                spinner-color="primary"
                spinner-size="64px"
              />
              <StatusIndicator
                v-if="statusRef"
                :status="statusRef"
                size="32px"
              />
            </q-avatar>
          </div>
          <span class="font-larger font-bold-600"
            >@{{ fetched_user.nickname || fetched_user.username }}</span
          >
          <span class="font-larger font-bold-600">{{
            fetched_user.email
          }}</span>
        </q-card-section>
        <q-card-section class="border-top q-pa-sm">
          <q-btn
            color="primary"
            dense
            icon="chat"
            :label="user_idRef === self_user_id ? '给自己留言' : '发送消息'"
            class="full-width"
            @click="createDirectChannel(user_idRef, self_user_id)"
          />
        </q-card-section>
      </q-card>
    </q-popup-proxy>
    <StatusIndicator
      v-if="member?.status"
      :status="member?.status"
      :size="indicator_size"
    />
  </q-avatar>
</template>

<script setup>
import { ref, toRef, watch, computed } from "vue";
import {
  createDirect,
  getUser,
  updateUserPreferences,
  getUserStatus,
} from "src/api/mattermost.js";
import StatusIndicator from "src/pages/Chat/components/wigets/StatusIndicator.vue";

import localforage from "localforage";

import { useRouter } from "vue-router";

import useMmws from "src/stores/mmws.js";
import useMmuser from "src/stores/mmuser.js";
import mmMmStore from "src/stores/mmstore.js";
const mmStore = mmMmStore();

import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";

let router = useRouter();
const mm_wsStore = useMmws();
const mmUserStore = useMmuser();

const props = defineProps({
  user_id: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 48,
  },
  indicator_size: {
    type: String,
    default: "14px",
  },
  disable_card: {
    type: Boolean,
    default: false,
  },
});
const user_idRef = toRef(props, "user_id");
const disable_cardRef = toRef(props, "disable_card");
const self_user_id = ref(localStorage.getItem("mmUserId"));
const self_avatar = computed(() => mmUserStore.current_user_avatar);

const member = computed(() =>
  mmStore.members.find((i) => i.user_id === user_idRef.value)
);

const avatar = ref(
  user_idRef.value === self_user_id.value && self_avatar.value
);
const fetchStatuse = async (mm_user_id) => {
  const res = await getUserStatus(mm_user_id);
  if (res) {
    mmStore.members.find((i) => i.user_id === user_idRef.value).status = res;
  }
};

const fetchAvatar = async (val) => {
  let res = await useFetchAvatar(user_idRef.value, val);
  if (res) {
    avatar.value = res;
  }
};
fetchAvatar();
const force_fetch = () => {
  fetchAvatar("force");
};

watch(
  self_user_id,
  () => {
    if (self_user_id.value) {
      fetchAvatar();
    }
  },
  { immediate: false, deep: false }
);

const fetched_user = ref();
const fetch_user = async () => {
  // console.log('请求用户数据');
  let __mm_user_key = `__mm_user__${user_idRef.value}`;
  let user = await localforage.getItem(__mm_user_key);
  if (user) {
    fetched_user.value = user;
    // console.log('用户数据来自缓存');
  } else {
    let res = await getUser(user_idRef.value);
    if (res) {
      fetched_user.value = res.data;
      localforage.setItem(__mm_user_key, res.data);
      // console.log('用户数据来自后端');
    }
  }
};
// 处理点击 "发送消息" 后跳转到私聊频道的逻辑
const directChannelId = ref();
const createDirectChannel_fn = async (a, b) => {
  const res = await createDirect(a, b);
  // 显示私聊频道
  const showDirectChat = async (self_user_id, name, direct_channel_id) => {
    const parmars = [
      {
        user_id: self_user_id,
        category: "direct_channel_show",
        name: name,
        value: "true",
      },
      {
        user_id: self_user_id,
        category: "channel_open_time",
        name: direct_channel_id,
        value: `${new Date().getTime()}`,
      },
    ];
    let res = await updateUserPreferences(self_user_id, parmars);
    if (res) {
      return res;
    }
  };
  if (res) {
    directChannelId.value = res.data.id;
    await showDirectChat(
      self_user_id.value,
      res.data.name.replace(self_user_id.value, "").replace("__", ""),
      res.data.id
    );
    mmStore.current_channel_id = res.data.id;
    router.push(`/chat/${mmStore.current_teamName}/${directChannelId.value}`);
  }
};
// a: 聊天对象ID
const createDirectChannel = async (a, b) => {
  await createDirectChannel_fn(a, b);
};
watch(
  mm_wsStore,
  () => {
    if (
      mm_wsStore.event &&
      mm_wsStore.event.event == "user_updated" &&
      mm_wsStore.event.data.user.id === user_idRef.value
    ) {
      fetchAvatar();
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
