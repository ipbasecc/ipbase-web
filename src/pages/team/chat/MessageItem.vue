<template>
  <div v-if="msg?.message" v-bind="$attrs"
    ref="dragRef"
    class="row no-wrap gap-md q-py-xs q-px-md message"
    :class="`
      ${is_sameUser ? '' : 'q-mt-sm'}
      ${msg.type.includes('system_') ? '' : 'hovered-item'}
      ${curThreadId === msg.id ? 'active' : ''}
      ${!msg?.root_id && !msg.type.includes('system_') && msg.props?.strapi?.event !== 'class_publish' ? 'mm_message' : msg.props?.strapi ? 'unselected' : ''}
    `"
  >
    <div v-if="msg.type.includes('system_')" class="row no-wrap gap-md items-center text-grey-6">
      <div class="transition row items-center justify-end"
        :class="pannel_mode ? '' : 'hover-hide transition'"
        :style="`min-width: ${pannel_mode ? 32 : avatar_size + (!MsgOnly ? 48 : 0)}px;height: 25px`">
        <q-icon name="mdi-information-outline" />
      </div>
      <span>{{ msg.message }}</span>
    </div>
    <template v-else>
      <template v-if="show_avatar">
        <template v-if="isExternal">
          <q-avatar v-if="!isMe"
            :size="`${avatar_size}px`"
            color="teal"
            icon="mdi-account"
          />
          <q-avatar v-else :size="`${avatar_size}px`" color="primary">
            {{$t('you')}}
          </q-avatar>
        </template>
        <UserAvatar v-else
          :user_id="msg.user_id"
          :size="avatar_size"
          :status="member_status"
          :strapi_member
          :class="!MsgOnly && $q.screen.gt.xs && !pannel_mode ? 'q-ml-xl' : ''"
        />
      </template>
      <template v-else>
        <div class="hover-show transition row items-center justify-end text-grey-6"
          :style="`min-width: ${pannel_mode ? 32 : avatar_size + (!MsgOnly ? 48 : 0)}px;`"
        >
          <TimeAgo v-if="!MsgOnly && !pannel_mode" :time="msg.create_at" />
        </div>
        <div v-if="msg.props?.strapi" class="transition absolute row items-center justify-end text-grey-6"
          :class="pannel_mode ? '' : 'hover-hide transition'"
          :style="`min-width: ${pannel_mode ? 32 : avatar_size + (!MsgOnly ? 48 : 0)}px;height: 25px`">
          <q-icon name="mdi-information-outline" />
        </div>
      </template>
      <div class="column no-wrap gap-xs justify-between q-space relative-position"
        @mouseover="wiget_show = true"
        @mouseleave="wiget_show = false"
      >
        <span v-if="show_avatar" class="op-5">
          <template v-if="!isExternal"> {{ member?.username }}</template>
          <template v-if="!MsgOnly"> · 
            <TimeAgo :time="msg.create_at" />
          </template>
        </span>
        <div
          v-html="html"
          class="message_body"
          :class="`
            ${!msg?.root_id && msg.props?.strapi?.event !== 'class_publish' ? 'cursor-pointer' : ''}
            ${msg.props.strapi ? 'text-grey-6' : ''}
          `"
          @click="enterThread(msg)"
        ></div>
        <template v-if="msg.metadata?.files?.length > 0">
          <showFile :files="msg.metadata?.files" />
        </template>
        <!-- bottom info-->
        <div class="row no-wrap gap-xs items-center op-3">
          <div
            v-if="msg.is_pinned && container !== 'pinned'"
            class="row no-wrap gap-xs items-center cursor-pointer"
            @click="togglePowerpannel('pinneds')"
          >
            <q-icon name="push_pin" color="primary" />
            <span class="hover-height transition">{{ $t('pinned') }}</span>
          </div>
          <div
            v-if="flagged(msg) && container !== 'flagged'"
            class="row no-wrap gap-xs items-center cursor-pointer"
            @click="togglePowerpannel('flaggeds')"
          >
            <q-icon name="bookmark" color="primary" />
            <span class="hover-height transition">{{ $t('favorited') }}</span>
          </div>
          <template v-if="msg?.reply_count > 0 && !msg?.root_id">
            <q-chip icon="mdi-reply" dense :label="msg.reply_count" clickable @click="enterThread(msg)" />
          </template>
        </div>
        <!-- float action btns-->
        <div v-if="!hide_float_bar && (wiget_show || menu_expend)"
          class="absolute transition blur-sm mm_message_wiget radius-sm border overflow-hidden"
          style="right: 10%; bottom: 0"
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
                    <q-item-section>{{$t('reply')}}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    class="radius-xs"
                    @click="followThreadFn(msg)"
                  >
                    <q-item-section side
                      ><q-icon name="mdi-heart-pulse"
                    /></q-item-section>
                    <q-item-section>{{$t('follow_thread')}}</q-item-section>
                  </q-item>
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
                      flagged(msg) ? $t('unfavorite_message') : $t('favorite_message')
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
                      msg.is_pinned ? $t('unpin_message') : $t('pin_message')
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>
      <div v-if="MsgOnly && container === 'flagged'">
        <q-btn
          dense
          size="sm"
          flat
          round
          icon="mdi-bookmark-remove"
          color="primary"
          class="hover-show transition"
          @click="toggle_flagged(msg)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import {computed, ref, toRefs, nextTick, onMounted} from "vue";
import {useFetch_mmMember} from "src/hooks/mattermost/api.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import showFile from "src/pages/Chat/components/wigets/showFile.vue";

import {deleteUserPreferences, followThread, pinPost, unpinPost, updateUserPreferences,} from "src/api/mattermost.js";
import {fetch_userPreferences} from "src/hooks/mattermost/useMattermost.js";
import { useQuasar } from "quasar";

import {marked} from "marked";
import {mmstore, mmUser, teamStore} from "src/hooks/global/useStore.js";
import TimeAgo from "pages/team/components/widgets/TimeAgo.vue";
import { useDrag, useBoolean } from 'vue-hooks-plus'
import { useAuths } from "../hooks/useAuths";

import { useImagePreview } from 'src/hooks/useImagePreview.js'
const { preview } = useImagePreview()

const props = defineProps({
  msg: {
    type: Object,
    default: void 0,
  },
  prev: {
    type: Object,
    default: void 0,
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
  showUnreadAfterCache: {
    type: Boolean,
    default: false,
  },
  after: {
    type: String,
    default: "channel",
  },
  pannel_mode: {
    type: Boolean,
    default: false,
  },
});
const { msg, prev, container, curThreadId, pannel_mode, MsgOnly } = toRefs(props);
const emit = defineEmits([
  "togglePowerpannel",
  "enterThread",
  "getUnreadAfterCache",
  "toggle_flagged",
]);
const $q = useQuasar();

const [dragging, { set: setDragging }] = useBoolean(false)
const dragRef = ref(null)

let auth, is_kanban, is_system_message, is_strapi_message, cant_drag, hide_float_bar;
onMounted(async () => {
  await nextTick();
  auth = useAuths('create', ['project']);
  is_kanban = teamStore.navigation === 'kanban';
  is_system_message = msg.value.type.includes('system_')
  is_strapi_message = !!msg.value.props?.strapi;
  cant_drag = !auth || !is_kanban || is_system_message || is_strapi_message;
  hide_float_bar = is_system_message || is_strapi_message || MsgOnly.value || dragging.value;
})
useDrag(msg.value, dragRef, {
  onDragStart: async (event) => {
    if(cant_drag){
      event.preventDefault() // 阻止拖拽
      return;
    }
    setDragging(true)
    await nextTick();
    
    // 计算鼠标与拖拽元素的相对位置
    const rect = dragRef.value.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top

    // 创建一个透明的占位符
    const transparentPlaceholder = document.createElement('div')
    transparentPlaceholder.style.width = '1px'
    transparentPlaceholder.style.height = '1px'
    transparentPlaceholder.style.opacity = '0'
    document.body.appendChild(transparentPlaceholder)

    // 创建自定义拖拽图像
    const dragImage = dragRef.value.cloneNode(true)
    const computedStyle = window.getComputedStyle(dragRef.value)
    dragImage.style.opacity = '1'
    dragImage.style.backgroundColor = computedStyle.backgroundColor
    dragImage.style.width = computedStyle.width
    dragImage.style.height = computedStyle.height
    dragImage.style.position = 'fixed'  // 改为 fixed 定位
    dragImage.style.top = `${event.clientY - offsetY}px`
    dragImage.style.left = `${event.clientX - offsetX}px`
    dragImage.style.zIndex = '9999'
    dragImage.style.pointerEvents = 'none'
    dragImage.classList.add($q.dark.mode ? 'bg-grey-10' : 'bg-grey-1')
    dragImage.classList.add('border')
    dragImage.classList.add('radius-sm')
    dragImage.classList.add('shadow-24')
    document.body.appendChild(dragImage)    

    // 设置透明占位符为拖拽影像
    event.dataTransfer.setDragImage(transparentPlaceholder, 0, 0)
    event.dataTransfer.effectAllowed = 'move'

    // 更新拖拽图像位置
    const updateDragImagePosition = (moveEvent) => {
      requestAnimationFrame(() => {
        dragImage.style.top = `${moveEvent.clientY - offsetY}px`
        dragImage.style.left = `${moveEvent.clientX - offsetX}px`
      })
    }

    // 监听 drag 事件而不是 mousemove
    document.addEventListener('drag', updateDragImagePosition)

    // 移除事件监听和克隆节点
    const cleanup = () => {
      document.removeEventListener('drag', updateDragImagePosition)
      if (dragImage.parentNode) {
        dragImage.parentNode.removeChild(dragImage)
      }
      if (transparentPlaceholder.parentNode) {
        transparentPlaceholder.parentNode.removeChild(transparentPlaceholder)
      }
    }

    // 在拖拽结束时清理
    document.addEventListener('dragend', cleanup, { once: true })
  },
  onDragEnd: () => {
    setDragging(false)
  },
})

const isExternal = computed(() => teamStore.isExternal);

const html = msg.value?.message && marked.parse(msg.value.message);
const member = ref();
const strapi_member = computed(() => {  
  return teamStore.team?.members?.find((i) => i.by_user?.mm_profile?.id === msg.value?.user_id);
})
useFetch_mmMember(msg.value?.user_id).then((res) => {
  member.value = res;
  const exits = mmstore.members.map((i) => i.id);
  if (!exits.includes(msg.value?.user_id)) {
    mmstore.members.push(res);
  } else {
    mmstore.members = mmstore.members.map((i) =>
      i.id === msg.value?.user_id ? res : i
    );
  }
});
const member_status = computed(
  () => mmstore.members?.find((i) => i.user_id === msg.value?.user_id)?.status
);

const avatar_size = ref(32);
const is_sameUser = computed(
  () => prev.value && prev.value.user_id === msg.value?.user_id
);
const isMe = computed(() => msg.value?.user_id === mmUser.user_id);
const show_avatar = computed(() => {
  return !msg.value.props.strapi && (!is_sameUser.value || props.isFirstOne || prev.value?.props?.strapi);
})

const togglePowerpannel = (val) => {
  emit("togglePowerpannel", val);
};

// 当前用户操作 - 开始
const cur_mmUser = computed(() => localStorage.getItem("mmUserId"));
const wiget_show = ref();
const menu_expend = ref();
const flagged = (i) => {
  return mmstore?.preferences?.map((i) => i.name).includes(i.id);
};

const flagged_post = async (i) => {
  // console.log("添加收藏");
  let parmars = [
    {
      user_id: cur_mmUser.value,
      category: "flagged_post",
      name: i.id,
      value: "true",
    },
  ];
  let res = await updateUserPreferences(cur_mmUser.value, parmars);
  if (res) {
    // console.log("flagged_post", res);
    await fetch_userPreferences();
  }
};
const unFlagged_post = async (i) => {
  // console.log("删除收藏");
  let parmars = [
    {
      user_id: cur_mmUser.value,
      category: "flagged_post",
      name: i.id,
    },
  ];
  let res = await deleteUserPreferences(cur_mmUser.value, parmars);
  if (res) {
    // console.log("flagged_post", res);
    await fetch_userPreferences();
  }
};
// 切换消息收藏状态
const toggle_flagged = (i) => {
  if (flagged(i)) {
    unFlagged_post(i);
    emit("toggle_flagged", { action: "remove", flag: i });
  } else {
    flagged_post(i);
    emit("toggle_flagged", { action: "add", flag: i });
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
  // console.log("followThreadFn", i);
  await followThread(cur_mmUser.value, teamStore.mm_team?.id, i.id);
};

const enterThread = (msg) => {
  const isImageClick = event?.target?.tagName?.toLowerCase() === 'img';
  const imgSrc = event?.target?.getAttribute('src');
  
  if (isImageClick && imgSrc) {
    preview({url:imgSrc,clickMaskCLose: true});
    return;
  }
  // console.log("enterThread", msg);
  if(msg.props?.strapi?.event === "class_publish"){
    return;
  }
  emit("enterThread", msg);
};
</script>

<style lang="scss">
.mm_message hr {
  margin: 8px 0 16px 0;
  opacity: 0.1;
}
</style>
