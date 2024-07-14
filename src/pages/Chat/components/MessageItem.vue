<template>
  <!-- {{ MsgRef }} -->
  <TimeBlock
    v-if="prevRef && MsgRef"
    :t1="prevRef.create_at"
    :t2="MsgRef.create_at"
  />
  <div
    class="row no-wrap hovered-item q-py-xs"
    :class="`
            ${
              MsgRef.type == ''
                ? 'gap-md q-px-md'
                : `${
                    $q.dark.mode ? 'op-3' : 'hover-height transition'
                  } q-py-sm flex flex-center unselected`
            }
                ${!Msg_only() ? 'q-mt-sm q-pt-sm' : ''}
        `"
    @click.stop="getThreadFn()"
    @mouseover="wiget_show = true"
    @mouseleave="wiget_show = false"
  >
    <SystemMsg v-if="MsgRef.type" :Msg="MsgRef.message" />
    <template v-else>
      <UserAvatar
        v-if="!Msg_only() || !asCtxRef"
        :user_id="MsgRef.user_id"
        :size="36"
        :status="member_status"
        style="margin-left: 30px"
        @mouseover="dont_gothread = true"
        @mouseleave="dont_gothread = false"
      />
      <span
        v-else
        style="width: 68px"
        class="full-height hover-show transition text-center"
      >
        <span class="hover-height transition">
          {{ useTimeDisplay(MsgRef.create_at) }}
        </span>
      </span>
      <div class="column no-wrap q-space">
        {{ member_status }}
        <div class="row no-wrap gap-xs items-center">
          <q-icon
            v-if="MsgRef.is_pinned && containerRef != 'pinned'"
            color="primary"
            name="push_pin"
            class="cursor-pointer"
            @click="mmStore.extend_pannel_target = 'pinneds'"
            @mouseover="dont_gothread = true"
            @mouseleave="dont_gothread = false"
          />
          <div
            v-if="flagged(MsgRef) && containerRef != 'flagged'"
            class="row no-wrap gap-xs items-center cursor-pointer"
            @click="mmStore.extend_pannel_target = 'flaggeds'"
            @mouseover="dont_gothread = true"
            @mouseleave="dont_gothread = false"
          >
            <q-icon name="bookmark" color="primary" />
            <span class="hover-height transition">已收藏</span>
          </div>
        </div>
        <div
          v-if="!Msg_only() || !asCtxRef"
          class="row no-wrap gap-xs items-center"
        >
          <span class="hover-height transition unselected">
            {{
              MsgRef.profile?.nickname || MsgRef.profile?.username || "no name"
            }}
          </span>
          <span class="hover-height transition unselected">
            {{ useTimeDisplay(MsgRef.create_at) }}
          </span>
        </div>
        <!-- 消息主体 -->
        <div class="column no-wrap tiptap">
          <!-- 来自项目管理 - 动态 的消息需要提取消息主体，因此v-html的内容需要判断 -->
          <span
            class="font-medium"
            :class="dont_getThread() ? '' : 'cursor-pointer'"
            v-html="
              isJSON(MsgRef.message)
                ? extract_MsgBody(MsgRef.message)
                : md.render(MsgRef.message)
            "
            @click="getThreadFn()"
          />
          <div
            v-if="MsgRef.participants && MsgRef.participants.length > 0"
            class="row no-wrap items-center gap-xs"
          >
            <UserAvatar
              :user_id="MsgRef.participants[MsgRef.participants.length - 1].id"
              :size="22"
              :status="reply_user_status"
              class="q-mr-sm"
            />
            <span class="cursor-pointer hover-height transition"
              ><q-icon name="reply" />{{ ` ${MsgRef.reply_count} 回复` }}</span
            >
            <template v-if="MsgRef.reply_count > 0">
              <span class="op-5">·</span>
              <span class="cursor-pointer hover-height transition">{{
                `最后回复于 ${useTimeDisplay(MsgRef.last_reply_at)}`
              }}</span>
            </template>
          </div>
          <!-- 表情、文件、图片等 -->
          <!-- {{ MsgRef.metadata }} -->
          <!-- <div class="q-space"></div> -->
          <div class="matedata">
            <showFile
              v-if="MsgRef.metadata?.files?.length > 0"
              :files="MsgRef.metadata?.files"
            />
          </div>
        </div>
      </div>
      <div
        v-if="(wiget_show || menu_expend) && !inThreadRef"
        class="absolute transition blur-sm mm_message_wiget radius-sm border overflow-hidden"
        style="right: 10%"
        @mouseover="dont_gothread = true"
        @mouseleave="dont_gothread = false"
      >
        <div class="row no-wrap gap-xs text-white q-pa-xs mm_message_wiget">
          <!-- 表情 -->
          <!-- <q-btn
            dense
            flat
            icon="bookmarks"
            size="0.7rem"
            :color="flagged(MsgRef) ? 'primary' : 'gery-3'"
            @click="addReactionFn"
          /> -->
          <q-btn
            dense
            flat
            icon="bookmark"
            size="0.7rem"
            :color="flagged(MsgRef) ? 'primary' : 'gery-3'"
            @click="toggle_flagged(MsgRef)"
          />
          <q-btn
            dense
            flat
            icon="push_pin"
            size="0.7rem"
            :color="MsgRef.is_pinned ? 'deep-orange' : 'gery-3'"
            @click="toggle_pin(MsgRef)"
          />
          <q-btn
            dense
            flat
            icon="reply"
            size="0.7rem"
            :color="flagged(MsgRef) ? 'primary' : 'gery-3'"
            @click="(dont_gothread = false), getThreadFn()"
          />
          <q-btn dense flat icon="more_vert" size="0.7rem">
            <q-menu v-model="menu_expend">
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="getThreadFn()">
                  <q-item-section>回复</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="followThreadFn(MsgRef)">
                  <q-item-section>关注主题</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="toggle_flagged(MsgRef)">
                  <q-item-section>{{
                    flagged(MsgRef) ? "取消收藏" : "收藏消息"
                  }}</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="toggle_pin(MsgRef)">
                  <q-item-section>{{
                    MsgRef.is_pinned ? "取消置顶" : "置顶消息"
                  }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, toRef, watch, computed } from "vue";
import useMmUserStore from "src/stores/mmuser.js";
import useMmStore from "src/stores/mmstore.js";
import SystemMsg from "src/pages/Chat/components/wigets/SystemMsg.vue";
import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import TimeBlock from "src/pages/Chat/components/wigets/TimeBlock.vue";
import showFile from "src/pages/Chat/components/wigets/showFile.vue";

import MarkdownIt from "markdown-it";

import { useTimeDisplay } from "src/hooks/global/useTimeDisplay.js";

import {
  followThread,
  updateUserPreferences,
  deleteUserPreferences,
  pinPost,
  unpinPost,
  addReaction,
  getUserStatus,
} from "src/api/mattermost.js";

import { date } from "quasar";

const mmUserStore = useMmUserStore();
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
    default: 0,
  },
  inThread: {
    type: Boolean,
    default: false,
  },
  asCtx: {
    type: Boolean,
    default: true,
  },
  container: {
    type: String,
    default: "",
  },
});

let md = new MarkdownIt();

const MsgRef = toRef(props, "msg");

// 如果消息是项目管理中项目数据修改的动态消息，需要用此方法来判断消息主体是否为json
function isJSON(str) {
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}

const extract_MsgBody = (Msg) => {
  if (isJSON(Msg)) {
    return JSON.stringify(JSON.parse(Msg).message);
  } else {
    return Msg;
  }
};

const inThreadRef = toRef(props, "inThread");
const prevRef = toRef(props, "prev");
const asCtxRef = toRef(props, "asCtx");
const containerRef = toRef(props, "container");
const currentUerId = localStorage.getItem("mmUserId");
const isMe = MsgRef.value.user_id === currentUerId && MsgRef.value.type == "";

const dont_gothread = ref(false);
const member_status = computed(
  () => mmStore.members.find((i) => i.user_id === MsgRef.value?.user_id)?.status
);

const dont_getThread = () => {
  if (
    MsgRef.value.type ||
    inThreadRef.value ||
    MsgRef.value.root_id ||
    dont_gothread.value
  ) {
    return true;
  } else {
    return false;
  }
};
const getThreadFn = async () => {
  if (dont_getThread()) return;
  mmStore.extend_pannel_target = "threads";
  mmStore.thread = MsgRef.value;
  mmStore.actived_thread = MsgRef.value.id;
  if (
    mmStore.extend_pannel_target_history[
      mmStore.extend_pannel_target_history.length - 1
    ] != "threads"
  ) {
    mmStore.extend_pannel_target_history.push(mmStore.extend_pannel_target);
  }
};

let reply_user_status = ref();
const get_user_status = async () => {
  let res = await getUserStatus(
    MsgRef.value.participants[MsgRef.value.participants.length - 1].id
  );
  if (res) {
    reply_user_status.value = res;
  }
};
watch(
  MsgRef,
  () => {
    if (MsgRef.value.participants?.length > 0) {
      get_user_status();
    }
  },
  { immediate: true, deep: true }
);

const diff_Day = (t1, t2) => {
  let t1_str = date.formatDate(t1, "YYYY-MM-DD");
  let t2_str = date.formatDate(t2, "YYYY-MM-DD");
  return t1_str != t2_str;
};

// 判断标准 - 没有上一条  或者 与上一条相比：有上一条 且 （与上一条ID相同 或 上一条没有type 或 与上一条创建时间相差大于5分钟）
const Msg_only = () => {
  if (
    prevRef.value &&
    prevRef.value.user_id === MsgRef.value.user_id &&
    prevRef.value.type == "" &&
    MsgRef.value.reply_count === 0 &&
    MsgRef.value.create_at - prevRef.value.create_at < 30 * 60 * 1000
  ) {
    return true;
  } else {
    return false;
  }
};

const flagged = (i) => {
  let isFlagged = mmStore?.preferences?.map((i) => i.name).includes(i.id);
  return isFlagged;
};

const flagged_post = async (i) => {
  console.log("添加收藏");
  let parmars = [
    {
      user_id: currentUerId,
      category: "flagged_post",
      name: i.id,
      value: "true",
    },
  ];
  let res = await updateUserPreferences(currentUerId, parmars);
  if (res) {
    console.log("flagged_post", res);
  }
};
const unFlagged_post = async (i) => {
  console.log("删除收藏");
  let parmars = [
    {
      user_id: currentUerId,
      category: "flagged_post",
      name: i.id,
    },
  ];
  let res = await deleteUserPreferences(currentUerId, parmars);
  if (res) {
    console.log("flagged_post", res);
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
    MsgRef.value.is_pinned = false;
  } else {
    pinPost(i.id);
    MsgRef.value.is_pinned = true;
  }
};

//关注主题
const followThreadFn = async (i) => {
  try {
    await followThread(currentUerId, mmStore.current_team_id, i.id);
  } catch (error) {
    console.log(error);
  }
};

const wiget_show = ref();
const menu_expend = ref();

const addReactionFn = async () => {
  let params = {
    user_id: currentUerId,
    post_id: MsgRef.value.id,
    emoji_name: "white_check_mark",
  };
  let res = await addReaction(params);
  if (res) {
  }
};
</script>

<style lang="scss" scoped>
.matedata {
  max-width: 61.8%;
}
</style>
