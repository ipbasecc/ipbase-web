<template>
  <q-avatar @click="fetch_user"
    :size="`${size}px`"
    @mouseenter="fetchStatuse(user_idRef)"
  >
    <img v-if="avatar" :src="avatar" alt="avatar" />
    <q-popup-proxy
      v-if="!disable_cardRef && !teamStore.direct_user"
      transition-show="fade"
      transition-hide="fade"
      @show="force_fetch"
    >
      <q-card v-if="fetched_user" bordered style="min-width: 22rem;">
        <q-card-section class="row no-wrap q-py-xs q-px-sm">
          <q-space />
          <div>
            <q-btn flat round dense size="sm" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="column no-wrap flex-center">
          <div class="q-pa-lg">
            <q-avatar size="100px">
              <q-img
                :src="avatar"
                :ratio="1"
                spinner-color="primary"
                spinner-size="64px"
              />
              <StatusIndicator
                v-if="member?.status"
                :status="member?.status"
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
        <q-card-section v-if="strapi_member?.by_user?.id !== userStore.me?.id" class="border-top q-pa-sm">
          <q-btn
            v-if="is_friend"
            color="primary"
            dense
            icon="chat"
            :label="user_idRef === self_user_id ? $t('send_to_self') : $t('send_message')"
            class="full-width"
            @click="createDirectChannel(user_idRef, self_user_id)"
          />
          <q-btn
            v-else
            color="primary"
            dense
            icon="mdi-send"
            :disable="disable_addFriend"
            :label="$t('send_friend_request')"
            class="full-width"
            @click="addFriendDlg = true"
          />
        </q-card-section>
      </q-card>
    </q-popup-proxy>
    <StatusIndicator
      v-if="member?.status"
      :status="member?.status"
      :size="indicator_size"
    />
    <q-dialog v-model="addFriendDlg" persistent @hide="addFriendResult = null">
      <q-card bordered style="min-width: 22rem;">
        <template v-if="!addFriendResult">
          <q-card-actions>
            {{ $t('send_friend_dlog_title') }}
            <q-space />
            <q-btn flat round dense size="sm" icon="close" v-close-popup />
          </q-card-actions>
          <q-card-section class="column gap-sm q-pa-lg">
            <q-input v-model="addFriendMsg" type="text" :label="$t('add_friend_msg_label')" />
            <q-input v-if="strapi_member.contact?.friend_request_question?.question" v-model="addFriendReqAnswer" type="text" :label="$t('add_friend_reqAnswer_label')" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn dense :label="$t('send_friend_request')" color="primary" icon="mdi-send" v-close-popup
              @click="sendFriendReq(strapi_member.by_user?.contact?.id)"
            />
          </q-card-actions>
        </template>
        <div v-else class="absolute-full column flex-center">
          <q-spinner-orbit
            v-if="addFriendLoading"
            color="primary"
            size="2em"
          />
          <div v-if="addFriendResult" class="">
            {{ $t('send_friend_request_completed') }}
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-avatar>
</template>

<script setup>
import { ref, toRefs, toRef, watch, computed, watchEffect } from "vue";
import {
  createDirect,
  getUser,
  updateUserPreferences,
  getUserStatus,
} from "src/api/mattermost.js";
import StatusIndicator from "src/pages/Chat/components/wigets/StatusIndicator.vue";

import localforage from "localforage";
import { useRouter } from "vue-router";

import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import {
  mmstore,
  mm_wsStore,
  mmUser,
  uiStore,
  teamStore,
  userStore
} from "src/hooks/global/useStore.js";
import { addFriend } from 'src/api/strapi.js'
import { useCheckBlocked, findStrapiUser_by_mmID_inTeam } from 'src/pages/team/chat/hooks/useMm.js'

let router = useRouter();

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
  strapi_member: {
    type: Object,
    default: null,
  },
});
const { strapi_member } = toRefs(props);
const user_idRef = toRef(props, "user_id");
const disable_cardRef = toRef(props, "disable_card");
const self_user_id = ref(localStorage.getItem("mmUserId"));

const member = computed(() =>
  mmstore.members.find((i) => i.user_id === user_idRef.value)
);

const member_roles = computed(() =>{
  return strapi_member.value?.member_roles.map((i) => i.subject)
});
const disable_addFriend = computed(() =>{
  return !strapi_member.value
    || !strapi_member.value?.by_user?.contact
    || strapi_member.value.by_user?.contact?.accept_friend === false
    || strapi_member.value?.by_user?.id === userStore.me?.id
});

const avatar = ref();
watchEffect(() => {
  if (user_idRef.value === self_user_id.value) {
    avatar.value = mmUser.current_user_avatar;
  }
});
const fetchStatuse = async (mm_user_id) => {
  const res = await getUserStatus(mm_user_id);
  if (res) {
    if (mmstore.members.find((i) => i.user_id === user_idRef.value)?.status) {
      mmstore.members.find((i) => i.user_id === user_idRef.value).status = res;
    }
  }
};

const fetchAvatar = async (val) => {
  let res = await useFetchAvatar(user_idRef.value, val);
  if (res) {
    avatar.value = res;
  }
};

const force_fetch = () => {
  fetchAvatar("force");
  uiStore.avatarChange = user_idRef.value;
};

watch(
  [self_user_id, user_idRef],
  () => {
    if (self_user_id.value && user_idRef.value) {
      fetchAvatar();
    }
  },
  { immediate: true, deep: false }
);

const avatarChange = computed(() => uiStore.avatarChange);
watch(
  avatarChange,
  () => {
    if (avatarChange.value === user_idRef.value) {
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
      await localforage.setItem(__mm_user_key, res.data);
      // console.log('用户数据来自后端');
    }
  }
};
const contact = computed(() => teamStore.init?.contact);
const all_contacters = computed(() => [...contact.value?.contacters, ...contact.value?.blockeds]);
const is_friend = computed(() => {
  return all_contacters.value.find((i) => i.mm_profile?.id === user_idRef.value);
})
// 处理点击 "发送消息" 后跳转到私聊频道的逻辑
const directChannelId = ref();
const createDirectChannel_fn = async (a, b, _wasBlocked, isblocked) => {
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
    mmstore.current_channel_id = res.data.id;
    teamStore.mm_channel.wasblocked = _wasBlocked;
    teamStore.mm_channel.isblocked = isblocked;
    await router.push(`/chats/${res.data.id}`);
  }
};
// a: 对方ID
const createDirectChannel = async (a, b) => {
  const _strapiUser = findStrapiUser_by_mmID_inTeam(a)
  
  const { wasBlock, isBlock } = await useCheckBlocked(_strapiUser);
  console.log('wasBlock, isBlock', wasBlock, isBlock);
  teamStore.direct_user = _strapiUser;    
  await createDirectChannel_fn(a, b, wasBlock, isBlock);
};

const addFriendDlg = ref(false);
const addFriendMsg = ref();
const addFriendReqAnswer = ref();
const addFriendResult = ref();
const addFriendLoading = ref(false);

const sendFriendReq = async (contact_id) => {
  addFriendLoading.value = true;
  const params = {
    data: {
      message: addFriendMsg.value,
      contact_id: contact_id,
      request_answer: addFriendReqAnswer.value
    }
  }
  const { data } = await addFriend(params);
  if(data){
    addFriendResult.value = data;
    addFriendLoading.value = false;
    addFriendDlg.value = false;
  }
}

watch(
  mm_wsStore,
  () => {
    if (
      mm_wsStore.event &&
      mm_wsStore.event.event === "user_updated" &&
      mm_wsStore.event.data.user.id === user_idRef.value
    ) {
      fetchAvatar();
    }
  },
  { immediate: false, deep: true }
);

import { __dict } from "src/hooks/dict.js";
const dict = __dict();
const translate = (i) => {
  return dict.find((item) => item.key === i)?.value || i;
};
</script>

<style lang="scss" scoped></style>
