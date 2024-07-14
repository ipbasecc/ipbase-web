<template>
  <div
    v-if="msg"
    class="row no-wrap gap-md q-pa-xs hovered-item"
    :class="`${is_sameUser ? '' : 'q-mt-sm'} ${
      curThreadId === msg.id ? 'active' : ''
    }
    ${!msg?.root_id ? 'mm_message' : ''}`"
  >
    <UserAvatar
      v-if="(!is_sameUser && avatar) || isFirstOne"
      :user_id="msg.user_id"
      :size="avatar_size"
      :status="member_status"
      :class="MsgOnly ? '' : 'q-ml-xl'"
    />
    <div
      v-else
      class="hover-show transition"
      :style="`min-width: ${avatar_size + (MsgOnly ? 0 : 32)}px;`"
    >
      <span v-if="!MsgOnly" class="op-3">{{ time }}</span>
    </div>
    <div
      class="column no-wrap justify-between q-space"
      @mouseover="wiget_show = true"
      @mouseleave="wiget_show = false"
    >
      <span v-if="!is_sameUser || isFirstOne" class="op-5"
        >{{ member?.username }} · {{ time_avatar }}</span
      >
      <div
        v-html="html"
        :class="!msg?.root_id ? 'cursor-pointer' : ''"
        @click="enterThread(msg)"
      ></div>
      <div class="row no-wrap gap-xs items-center">
        <q-icon
          v-if="msg.is_pinned && container != 'pinned'"
          color="primary"
          name="push_pin"
          class="cursor-pointer"
          @click="togglePowerpannel('pinneds')"
        />
        <div
          v-if="flagged(msg) && container != 'flagged'"
          class="row no-wrap gap-xs items-center cursor-pointer"
          @click="togglePowerpannel('flaggeds')"
        >
          <q-icon name="bookmark" color="primary" />
          <span class="hover-height transition">已收藏</span>
        </div>
        <template v-if="msg?.reply_count > 0 && !msg?.root_id">
          <q-chip icon="mdi-reply" dense :label="msg.reply_count" />
        </template>
      </div>
      <div
        v-if="(wiget_show || menu_expend) && !MsgOnly"
        class="absolute transition blur-sm mm_message_wiget radius-sm border overflow-hidden"
        style="right: 10%"
      >
        <div class="row no-wrap gap-xs text-white q-pa-xs mm_message_wiget">
          <q-btn
            dense
            flat
            icon="bookmark"
            size="0.7rem"
            :color="flagged(msg) ? 'primary' : 'gery-3'"
            @click="toggle_flagged(msg)"
          />
          <q-btn
            dense
            flat
            icon="push_pin"
            size="0.7rem"
            :color="msg.is_pinned ? 'deep-orange' : 'gery-3'"
            @click="toggle_pin(msg)"
          />
          <q-btn
            dense
            flat
            icon="reply"
            size="0.7rem"
            :color="flagged(msg) ? 'primary' : 'gery-3'"
            @click="enterThread(msg)"
          />
          <q-btn dense flat icon="more_vert" size="0.7rem">
            <q-menu v-model="menu_expend">
              <q-list
                bordered
                dense
                style="min-width: 100px"
                class="radius-sm q-pa-xs"
              >
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="enterThread(msg)"
                >
                  <q-item-section side><q-icon name="reply" /></q-item-section>
                  <q-item-section>回复</q-item-section>
                </q-item>
                <!-- 在项目模块暂时未集成独立的Thread，所以暂时不启用此功能 <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="followThreadFn(msg)"
                >
                  <q-item-section side
                    ><q-icon name="mdi-heart-pulse"
                  /></q-item-section>
                  <q-item-section>关注主题</q-item-section>
                </q-item> -->
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="toggle_flagged(msg)"
                >
                  <q-item-section side
                    ><q-icon name="mdi-book-plus"
                  /></q-item-section>
                  <q-item-section>{{
                    flagged(msg) ? "取消收藏" : "收藏消息"
                  }}</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="toggle_pin(msg)"
                >
                  <q-item-section side
                    ><q-icon name="mdi-pin"
                  /></q-item-section>
                  <q-item-section>{{
                    msg.is_pinned ? "取消置顶" : "置顶消息"
                  }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ref, toRefs } from "vue";
import { date } from "quasar";
import { useGenBlob } from "src/hooks/utilits.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import { useFetch_mmMember } from "src/hooks/mattermost/api.js";
import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import useMmStore from "src/stores/mmstore.js";

import {
  followThread,
  updateUserPreferences,
  deleteUserPreferences,
  pinPost,
  unpinPost,
} from "src/api/mattermost.js";
import { fetch_userPreferences } from "src/hooks/mattermost/useMattermost.js";

import { marked } from "marked";

const mmStore = useMmStore();

const props = defineProps({
  msg: {
    type: Object,
    default() {
      return {};
    },
  },
  prev: {
    type: Object,
    default() {
      return {};
    },
  },
  index: {
    type: Number,
    default: NaN,
  },
  container: {
    type: String,
    default: "channel",
  },
  isFirstOne: {
    type: Boolean,
    default: false,
  },
  curThreadId: {
    type: String,
    default: null,
  },
  MsgOnly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["togglePowerpannel", "enterThread"]);
const { msg, prev, index, inThread, container, curThreadId, showTime } =
  toRefs(props);

const html = msg.value?.message && marked.parse(msg.value.message);
const avatar = ref();
const calc_avatar = async () => {
  let buffer = await useFetchAvatar(msg.value.user_id);
  if (buffer) {
    let blob = useGenBlob(buffer);
    avatar.value = blob;
    return blob;
  }
};
calc_avatar();
const member = ref();
useFetch_mmMember(msg.value?.user_id).then((res) => {
  member.value = res;
});
const member_status = computed(
  () => mmStore.members.find((i) => i.user_id === msg.value?.user_id)?.status
);

const avatar_size = ref(32);
const is_sameUser = computed(
  () => prev.value && prev.value.user_id === msg.value?.user_id
);
let _ =
  (date.formatDate(msg.value.create_at, "DD") === "AM" && "上午") || "下午";
let __ = date.formatDate(msg.value.create_at, "HH:mm");
const time = computed(() => _ + " / " + __);
const time_avatar = computed(() => _ + __);

const togglePowerpannel = (val) => {
  emit("togglePowerpannel", val);
};

// 当前用户操作 - 开始
const cur_mmUser = localStorage.getItem("mmUserId");
const wiget_show = ref();
const menu_expend = ref();
const flagged = (i) => {
  let isFlagged = mmStore?.preferences?.map((i) => i.name).includes(i.id);
  return isFlagged;
};

const flagged_post = async (i) => {
  console.log("添加收藏");
  let parmars = [
    {
      user_id: cur_mmUser,
      category: "flagged_post",
      name: i.id,
      value: "true",
    },
  ];
  let res = await updateUserPreferences(cur_mmUser, parmars);
  if (res) {
    console.log("flagged_post", res);
    await fetch_userPreferences();
  }
};
const unFlagged_post = async (i) => {
  console.log("删除收藏");
  let parmars = [
    {
      user_id: cur_mmUser,
      category: "flagged_post",
      name: i.id,
    },
  ];
  let res = await deleteUserPreferences(cur_mmUser, parmars);
  if (res) {
    console.log("flagged_post", res);
    await fetch_userPreferences();
  }
};
// 切换消息收藏状态
const toggle_flagged = (i) => {
  if (flagged(i)) {
    unFlagged_post(i);
  } else {
    flagged_post(i);
  }
};

//切换消息置顶状态
const toggle_pin = (i) => {
  if (i.is_pinned) {
    unpinPost(i.id);
    msg.value.is_pinned = false;
  } else {
    pinPost(i.id);
    msg.value.is_pinned = true;
  }
};

//关注主题
const followThreadFn = async (i) => {
  try {
    await followThread(cur_mmUser, mmStore.current_team_id, i.id);
  } catch (error) {
    console.log(error);
  }
};
// 当前用户操作 - 结束

const enterThread = (msg) => {
  emit("enterThread", msg);
};
</script>

<style lang="scss">
.mm_message hr {
  margin: 8px 0 16px 0;
  opacity: 0.1;
}
</style>
