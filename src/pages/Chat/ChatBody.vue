<template>
  <div class="absolute-full column no-wrap" ref="chat_body">
    <q-toolbar class="border-bottom">
      <q-tabs
        v-if="idRef !== 'threads'"
        v-model="current_tab"
        dense
        stretch
        no-caps
        inline-label
      >
        <q-route-tab
          v-for="i in tabs"
          :key="i.name"
          :name="i.name"
          :label="i.label"
          :to="i.to"
        />
      </q-tabs>
      <q-space />
      <div class="row q-px-md flex-center">
        <q-btn
          flat
          icon="group"
          :color="mmStore.extend_pannel_target === 'members' ? 'primary' : ''"
          dense
          size="sm"
          @click="toggle_extend_pannel('members')"
        />
        <q-btn
          flat
          icon="push_pin"
          :color="mmStore.extend_pannel_target === 'pinneds' ? 'primary' : ''"
          dense
          size="sm"
          @click="toggle_extend_pannel('pinneds')"
        />
        <q-btn
          flat
          icon="info"
          :color="mmStore.extend_pannel_target === 'attribute' ? 'primary' : ''"
          dense
          size="sm"
          @click="toggle_extend_pannel('attribute')"
        />
        <q-btn
          flat
          icon="bookmarks"
          :color="mmStore.extend_pannel_target === 'flaggeds' ? 'primary' : ''"
          dense
          size="sm"
          @click="toggle_extend_pannel('flaggeds')"
        />
      </div>
    </q-toolbar>
    <template v-if="current_tab === 'chat' && idRef">
      <div class="q-space">
        <MessagesContainer :channel_id="idRef" :key="idRef" />
      </div>
      <SendmsgBox :channel_id="idRef" />
    </template>
    <RouterView v-else />
  </div>
</template>

<script setup>
import {
  getChannelByID,
  getChannelMembers,
  getUser,
  getAvatar,
  sendPost,
  createDirect,
  viewChannel,
} from "src/api/mattermost.js";
import {
  ref,
  toRef,
  watch,
  onBeforeUnmount,
  onUnmounted,
  onMounted,
} from "vue";
import localforage from "localforage";

import MessagesContainer from "src/pages/Chat/components/MessagesContainer.vue";
import SendmsgBox from "src/pages/Chat/components/wigets/SendmsgBox.vue";

import useMmuser from "src/stores/mmuser.js";
import useMmStore from "src/stores/mmstore.js";

const mmuser = useMmuser();
const mmStore = useMmStore();

const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
  channel_name: {
    type: String,
    default: "",
  },
});
const emit = defineEmits("changeChannel", "channel_id");

// channelID
const idRef = toRef(props, "channel_id");
const channel_nameRef = toRef(props, "channel_name");
const channel_attribute = ref();

const msg = ref();
const currentUerId = localStorage.getItem("mmUserId");

const members = ref([]);
const getMembers = async () => {
  if (!idRef.value) return;
  // 定义一个异步函数来发送请求并获取uid
  const fetchUser = async (id) => {
    let user;
    try {
      let res = await getUser(id);
      if (res?.data) {
        user = res.data;
      }
    } catch (error) {
      console.error(error);
    }
    return user;
  };

  const res = await getChannelMembers(idRef.value);
  if (res) {
    let obj = res.data;
    let member_with_avatar = [];

    for (let member of obj) {
      let member_id = member.user_id;
      member.profile = await fetchUser(member_id);
      await getAvatar(member_id)
        .then((response) => {
          if (response) {
            const blob = new Blob([response]);
            member.avatar = window.URL.createObjectURL(blob);
          }
        })
        .catch((error) => {
          console.error(error);
        });
      member_with_avatar.push(member);
      if (member_with_avatar.length === obj.length) {
        members.value = member_with_avatar;
        mmuser.members = members.value;
      }
    }
  }
};

const current_tab = ref("chat");
const router_base = ref();
const tabs = ref([]);

const channel_display_name = ref();
const fetchChannel = async () => {
  if (!idRef.value) return;
  channel_display_name.value = "";
  // 根据name判断是不是自己的留言
  function toSelf(str) {
    // 判断字符串是否包含"__"，如果不包含，返回false
    if (!str.includes("__")) {
      return false;
    }
    // 用"__"分割字符串，得到两个子字符串
    let parts = str.split("__");
    // 判断两个子字符串是否相等，如果相等，返回true，否则返回false
    return parts[0] === parts[1];
  }
  await getChannelByID(idRef.value).then((res) => {
    channel_attribute.value = res.data;
    mmStore.channel = res.data;
    localforage.setItem(`__channel_${idRef.value}`, res.data);
    channel_display_name.value = res.data.display_name;
    if (!channel_display_name.value) {
      if (toSelf(res.data.name)) {
        channel_display_name.value = "给自己留言";
      } else {
        let target_user_id = res.data.name
          .replace(currentUerId, "")
          .replace("__", "");
        // todo 需要加一个先从缓存读取的方法
        getUser(target_user_id).then((res) => {
          channel_display_name.value = `与 ${
            res.data.nickname || res.data.username
          } 的对话`;
        });
      }
    }
  });
};

const toggle_extend_pannel = (val) => {
  mmStore.extend_pannel_target =
    mmStore.extend_pannel_target === val ? null : val;
  mmStore.extend_pannel_target_history.push(mmStore.extend_pannel_target);
};

watch(
  idRef,
  async () => {
    if (idRef.value) {
      await fetchChannel();
      await getMembers();
    }
  },
  { immediate: true, deep: true }
);

const scrollModel = ref(100);
const thumbStyle = {
  right: "4px",
  borderRadius: "5px",
  backgroundColor: "rgb(100 100 100)",
  width: "5px",
  opacity: 0.75,
};

const barStyle = {
  right: "2px",
  borderRadius: "9px",
  width: "9px",
  opacity: 0,
};

// 在组件卸载后重置各种数据
onUnmounted(() => {
  msg.value = "";
  channel_display_name.value = null;
});
</script>

<style lang="scss" scoped></style>
