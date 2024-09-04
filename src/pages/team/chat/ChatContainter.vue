<!-- 项目聊天主体页面 -->
<template>
  <div class="absolute-full column no-wrap overflow-hidden" :class="$q.dark.mode ? 'bg-darker text-grey-1' : 'bg-grey-1 text-grey-10'">
    <q-bar
      class="border-bottom"
      :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
    >
      <q-btn
        flat
        dense
        v-if="!$q.screen.gt.sm"
        size="sm"
        icon="mdi-chevron-left"
        :color="$q.dark.mode ? 'white' : 'black'"
        @click="backList()"
      />
      <q-btn
        flat
        dense
        size="sm"
        icon="mdi-refresh"
        :color="$q.dark.mode ? 'white' : 'black'"
        @click="cleanCacheReInit(channel_id)"
      >
        <q-tooltip> {{ $t('clean_cache') }} </q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
        dense
        flat
        :color="uiStore.chat_pannel === 'pinneds' ? 'green' : ''"
        :icon="uiStore.chat_pannel === 'pinneds' ? 'mdi-pin-off' : 'mdi-pin'"
        @click="togglePowerpannel('pinneds')"
      >
        <q-tooltip> {{ $t('pinned_messages') }} </q-tooltip>
      </q-btn>
      <q-btn
        v-if="strapi_channel_id && useAuths('manageMember', ['channel'])"
        dense
        flat
        :color="uiStore.chat_pannel === 'MemberManager' ? 'green' : ''"
        icon="manage_accounts"
        @click="togglePowerpannel('MemberManager')"
      />
      <q-btn
        v-if="teamStore?.direct_user"
        dense
        flat
        :color="uiStore.chat_pannel === 'MemberManager' ? 'green' : ''"
        icon="info"
        @click="togglePowerpannel('directMemberInfo')"
      />
    </q-bar>
    <q-splitter
      v-if="$q.screen.gt.xs"
      v-model="splitterModel"
      :limits="limits"
      :separator-style="uiStore.chat_pannel ? '' : 'display: none'"
      class="q-space"
      ref="separatorRef"
    >
      <template v-slot:before>
        <div class="fit column">
          <q-scroll-area
            v-model="scrollModel"
            :thumb-style="thumbStyle"
            :bar-style="barStyle"
            class="q-space"
            ref="scrollAreaRef"
          >
            <q-resize-observer @resize="onResize" />
            <q-infinite-scroll
              v-if="messages?.order?.length > 0"
              reverse
              class="column justify-end"
              :style="`min-height: ${scrollContainer?.height}px`"
              :debounce="300"
              :offset="100"
              :disable="!hasMore"
              @load="onLoad"
            >
              <div class="column no-wrap relative-position article">
                <template v-for="(i, index) in messages.order" :key="i">
                  <MessageItem
                    v-if="!messages.posts[i]?.root_id"
                    :msg="messages.posts[i]"
                    :prev="messages.posts[messages.order[index - 1]]"
                    :index="index"
                    :inThread="false"
                    :curThreadId="thread?.id"
                    :showUnreadAfterCache
                    :after
                    :MsgOnly="!$q.screen.gt.xs"
                    container="channel"
                    @togglePowerpannel="togglePowerpannel"
                    @enterThread="enterThread"
                    @getUnreadAfterCache="getMore(channel_id)"
                  />
                </template>
              </div>
            </q-infinite-scroll>
          </q-scroll-area>
          <div v-if="teamStore.mm_channel?.wasblocked || teamStore.mm_channel?.isblocked" class="full-width q-pa-xl border flex flex-center">
            {{ `${teamStore.mm_channel?.wasblocked ? '您已被对方屏蔽' : '您已屏蔽对方'}，不能发送消息` }}
          </div>
          <SendmsgBox v-else :channel_id="channel_id" />
        </div>
      </template>
      <template v-if="uiStore.chat_pannel" v-slot:separator>
        <div class="fit" :class="isEnter ? 'bg-primary' : ''"></div>
      </template>
      <template v-if="uiStore.chat_pannel" v-slot:after>
        <div class="absolute-full"
          :class="$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'"
        >
          <ThreadContainer
            v-if="uiStore.chat_pannel === 'thread' && thread"
            :chatInfo
            :fullHeight="false"
            @closeThread="closeThread"
          />
          <PinnedsContainder
            v-if="uiStore.chat_pannel === 'pinneds'"
            :channel_id="channel_id"
            :key="channel_id"
          />
          <MemberManager
            v-if="uiStore.chat_pannel === 'MemberManager'"
            :byInfo
            class="absolute-full"
          />
          <DirectMemberInfo v-if="teamStore?.direct_user && uiStore.chat_pannel === 'directMemberInfo'"
            :directMember="teamStore.direct_user"
          />
        </div>
      </template>
    </q-splitter>
    <template v-else>
      <div class="q-space column">
        <template v-if="uiStore.chat_pannel">
          <div
            class="absolute-full"
            :class="
              $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
            "
          >
            <ThreadContainer
              v-if="uiStore.chat_pannel === 'thread' && thread"
              :chatInfo
              :fullHeight="false"
              @closeThread="closeThread"
            />
            <PinnedsContainder
              v-if="uiStore.chat_pannel === 'pinneds'"
              :channel_id="channel_id"
              :key="channel_id"
            />
            <MemberManager
              v-if="uiStore.chat_pannel === 'MemberManager'"
              :byInfo
              class="absolute-full"
            />
          </div>
        </template>
        <template v-else>
          <q-scroll-area
            v-model="scrollModel"
            :thumb-style="thumbStyle"
            :bar-style="barStyle"
            class="q-space q-pb-lg"
            ref="scrollAreaRef"
          >
            <q-resize-observer @resize="onResize" />
            <q-infinite-scroll
              v-if="messages?.order?.length > 0"
              reverse
              class="column justify-end q-pt-xl"
              :style="`min-height: ${scrollContainer?.height}px`"
              :debounce="300"
              :offset="100"
              :disable="!hasMore"
              @load="onLoad"
            >
              <div class="column no-wrap relative-position article">
                <template v-for="(i, index) in messages.order" :key="i">
                  <MessageItem
                    v-if="!messages.posts[i]?.root_id"
                    :msg="messages.posts[i]"
                    :prev="messages.posts[messages.order[index - 1]]"
                    :index="index"
                    :inThread="false"
                    :curThreadId="thread?.id"
                    :showUnreadAfterCache
                    :after
                    :MsgOnly="!$q.screen.gt.xs"
                    container="channel"
                    @togglePowerpannel="togglePowerpannel"
                    @enterThread="enterThread"
                    @getUnreadAfterCache="getMore(channel_id)"
                  />
                </template>
              </div>
            </q-infinite-scroll>
          </q-scroll-area>
          <SendmsgBox :channel_id="channel_id">
            <template v-slot:disableTip>
              <div class="absolute-full bg-black op-5"></div>
              <div class="absolute-full column flex-center">
                {{ $t('chose_a_channel') }}
              </div>
            </template>
          </SendmsgBox>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  computed,
  watch,
  onMounted,
  onUnmounted,
  watchEffect,
  nextTick
} from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { db } from "src/boot/dexie.js";

import MessageItem from "./MessageItem.vue";
import ThreadContainer from "./ThreadContainer.vue";
import SendmsgBox from "src/pages/Chat/components/wigets/SendmsgBox.vue";
import PinnedsContainder from "src/pages/Chat/components/PinnedsContainder.vue";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";

import { getPostsOfChannel, getUsersByIDs, getChannelByID as getMmChannelByID } from "src/api/mattermost.js";
import { getChannelByID } from "src/api/strapi/team.js";
import {
  mergePosts,
  __viewChannel,
} from "src/hooks/mattermost/useMattermost.js";
import { uniqueById } from "src/hooks/utilits.js";

import MemberManager from "../settings/MemberManager.vue";
import { mmUser, teamStore, uiStore } from "src/hooks/global/useStore.js";
import useMmws from "src/stores/mmws.js";
import { removeLastChannel } from "pages/team/chat/TeamChat";
import { i18n } from 'src/boot/i18n.js';
import DirectMemberInfo from './components/DirectMemberInfo.vue'

const $t = i18n.global.t;

const mm_wsStore = useMmws();
const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
});
const { channel_id } = toRefs(props);
onMounted(() => {
  teamStore.navigation = "chat";
});
const router = useRouter();

const mm_me = computed(() => mmUser.me);
const strapi_channel_id = computed(() => teamStore?.channel?.id);
const byInfo = computed(() => ({
  by: "channel",
  channel_id: strapi_channel_id.value,
}));
const chatInfo = computed(() => ({
  mm_channel_id: channel_id.value,
  post_id: thread.value?.id,
}));

const page = ref(0);
const per_page = ref(60);
const before = computed(() => messages.value?.order[0]);
const after = ref();
const options = computed(() => {
  const _ = `page=${page.value}&per_page=${per_page.value}${
    !after.value && before.value ? `&before=${before.value}` : ""
  }${after.value ? `&after=${after.value}` : ""}`;
  return _.trim(); //要删掉请求参数中的所有空格
});

const __base = ref({ order: [],  posts: {} });
const __afterCache = ref({ order: [],  posts: {} });
const __beforCache = ref({ order: [],  posts: {} });
const __order = ref();
const __posts = ref();
const __channelMessages = ref();

const initMessage = () => {
  __order.value = [
    ...__beforCache.value.order,
    ...__base.value.order,
    ...__afterCache.value.order,
  ];

  __posts.value = mergePosts(
    __beforCache.value?.posts,
    __base.value?.posts,
    __afterCache.value?.posts
  );

  __channelMessages.value = {
    id: channel_id.value,
    order: __order.value,
    posts: __posts.value,
  };

  return __channelMessages.value;
};

const messages = ref();
watchEffect(() => {
  messages.value = __channelMessages.value;
});

const getCache = async (_cid) => {
  // console.log("getCache", _cid);
  return await db.channels.get(_cid);
};

const deleteCache = async (_cid) => {
  // console.log("getCache", _cid);
  return await db.channels.delete(_cid);
};

const initCache = async (_cid) => {
  let cache = await getCache(_cid);
  if (cache?.order?.length > 0) {
    page.value = 0;
    after.value = cache.order[cache.order.length - 1];

    __base.value = {
      order: cache.order,
      posts: cache.posts,
    };
  }
  return cache;
};
const updateCache = async (_cid, Msgs) => {
  // console.log("messages.value", messages.value);
  const serializedMessages = JSON.parse(JSON.stringify(Msgs || messages.value));
  let cache = await getCache(_cid);
  if (cache) {
    try {
      await db.channels.put(serializedMessages);
    } catch (error) {}
  } else {
    try {
      await db.channels.add(serializedMessages);
    } catch (error) {}
  }
};
const initChannel = async (_cid) => {
  if (channel_id.value) {
    messages.value = {
      ...__base.value,
      id: _cid,
    };
    await initCache(_cid);
    fetchMoreOnly.value = true;
    await get(_cid);
    initMessage();
  }
};
watch(
  channel_id,
  async () => {
    if (channel_id.value) {
      await initChannel(channel_id.value);
      await __viewChannel(channel_id.value);
      // 如果通过连接直接访问到聊天界面，需要获取Strapi频道、Mattermost频道
      if(!teamStore.mm_channel){
        const res = await getMmChannelByID(channel_id.value);
        if(res?.data){
          teamStore.mm_channel = res.data;
        }
      }
    }
  },
  { immediate: true, deep: false }
);

// 为防止直接执行get方法，增加此参数
// 在执行时先设置为真，get结束后会设置为假
// 如果直接执行会直接返回
const initializtion = ref(false);
const fetchMoreOnly = ref(false);
const hasMore = ref(true);
const $q = useQuasar();
const countGet = ref(0);
const showUnreadAfterCache = ref(false);
const get = async (_cid) => {
  // if (!fetchMoreOnly.value || hasMore.value === false) return;
  const res = await getPostsOfChannel(_cid, options.value);
  if (res) {
    countGet.value++;
    fetchMoreOnly.value = false;
    initializtion.value = true;
    autoScrollBottom.value = false;
  }
  // 只有加载完缓存消息之后所有未读消息（没有after参数）后，没有更多消息时，才能设置hasMore为false
  // 后续判断中会修改 after, 因此此判断一定要位于最上方
  if (res?.data?.order?.length === 0 && !after.value) {
    hasMore.value = false;
  }
  if (res?.data?.order?.length > 0) {
    // 筛选出缓存消息中不存在的消息
    const _ordersFilter = res.data.order.filter(
      (i) => !messages.value.order.includes(i)
    );
    // 如果筛选后消息长度为请求单页长度，说明没有重复消息，且缓存消息与获得消息之间还有可能存在未请求到的消息
    // 则显示获取缓存之后消息按钮
    if (_ordersFilter.length === page.value && after.value) {
      showUnreadAfterCache.value = true;
    } else {
      showUnreadAfterCache.value = true;
    }
    // 如果筛选后没有消息了，说明没有缓存中不存在的消息，after参数清空，关闭显示缓存之后历史消息按钮
    if ((!_ordersFilter || _ordersFilter.length === 0) && after.value) {
      console.log("!_ordersFilter || _ordersFilter.length === 0");
      after.value = null;
      showUnreadAfterCache.value = false;
    }
    if (after.value) {
      __afterCache.value = {
        order: [
          ..._ordersFilter.slice().reverse(),
          ...__afterCache.value.order,
        ],
        posts: mergePosts(res.data.posts, __afterCache.value.posts),
      };
    } else if (before.value) {
      showUnreadAfterCache.value = false;
      __beforCache.value = {
        order: [
          ..._ordersFilter.slice().reverse(),
          ...__beforCache.value.order,
        ],
        posts: mergePosts(res.data.posts, __beforCache.value.posts),
      };
    } else {
      __base.value = {
        order: [..._ordersFilter.slice().reverse(), ...__base.value.order],
        posts: mergePosts(res.data.posts, __base.value.posts),
      };
    }
    const Msgs = initMessage();
    await updateCache(_cid, Msgs);
  } else {
    if (after.value) {
      after.value = null;
    } else {
      // 初始化时、onLoad时各自执行过一次，从第三次开始，如果没有获得新消息，发出提示
      if (countGet.value > 2) {
        $q.notify($t('no_more_message'));
      }
    }
  }
};
const getMore = async (_cid) => {
  if (!hasMore.value) return;
  page.value++;
  fetchMoreOnly.value = true;
  return await get(_cid);
};

async function onLoad(index, done) {
  if (!hasMore.value && initializtion.value) {
    done();
  } else {
    await getMore(channel_id.value);
    done();
  }
}

const channelMembers = ref([]);
watch(
  __order,
  async () => {
    if (__order.value?.length > 0) {
      // todo 此处应该去掉已经缓存的用户
      let user_ids = uniqueById(
        __order.value.map((i) => __posts.value[i]?.user_id)
      );

      let members = await getUsersByIDs(user_ids);
      channelMembers.value = members.data;
    }
  },
  { immediate: true, deep: false }
);

const thread = ref();
const splitterModel = ref(100);
const limits = ref([100, 100]);
const open_powerPannel = () => {
  splitterModel.value = 61;
  limits.value = [39, 81];
};
const close_powerPannel = () => {
  splitterModel.value = 100;
  limits.value = [100, 100];
};
const enterThread = (msg) => {
  if (!thread.value) {
    togglePowerpannel("thread");
  }
  thread.value = msg;
};
const closeThread = () => {
  togglePowerpannel("thread");
  thread.value = void 0;
  uiStore.chat_pannel = null;
};
const togglePowerpannel = (pannel) => {
  if (thread.value) {
    thread.value = void 0;
  }
  uiStore.chat_pannel = uiStore.chat_pannel !== pannel ? pannel : "";
  if (uiStore.chat_pannel) {
    open_powerPannel();
  } else {
    close_powerPannel();
  }
};

const scrollModel = ref(100);
const scrollAreaRef = ref();

const scrollContainer = ref();
const scroll_bottom = async (_val) => {
  await nextTick();
  scrollContainer.value &&
    scrollAreaRef.value.setScrollPosition(
      "vertical",
      _val || scrollContainer.value?.height, // 总出现不能滚动到底的情况，给个暴力值
      300
    );
};
const autoScrollBottom = ref(true);
const onResize = async (size) => {
  scrollContainer.value = size;
  const scrollInfo = scrollAreaRef.value?.getScroll();
  // 滚动条距离底部，当滚动条在底部时，这个距离是一个聊天容器的高度
  const _bottom = scrollInfo.verticalSize - scrollInfo.verticalPosition;
  if (autoScrollBottom.value && _bottom > scrollInfo.verticalContainerSize) {
    await scroll_bottom(scrollContainer.value?.height);
  }
};

const cleanCache = async (_cid) => {
  await deleteCache(_cid);
  const _empty = {
    order: [],
    posts: {},
  }
  const val = {
    id: _cid,
    ..._empty
  };
  __channelMessages.value = val;
  __base.value = val;

  __afterCache.value = _empty;
  __beforCache.value = _empty;
};
const cleanCacheReInit = async (_cid) => {
  await cleanCache(_cid);
  after.value = void 0;
  before.value = void 0;
  page.value = 0;
  await initChannel(_cid);
};

watch(
  mm_wsStore,
  async () => {
    // 判断消息类型
    if (mm_wsStore?.event?.event === "posted") {
      let message = JSON.parse(mm_wsStore.event.data.post);

      if (message?.channel_id === channel_id.value) {
        autoScrollBottom.value = false;
        function updateMessageList(msgs, msg) {
          // 将新消息的 ID 追加到 arr.order 数组的最后一位
          msgs.order = [...msgs.order, msg.id];

          // 提取新消息的 ID 作为 key，新消息自身作为 value 组成一个新的对象
          const newPost = {
            [msg.id]: msg,
          };
          msgs.posts = mergePosts(msgs.posts, newPost);
          return msgs;
        }
        // console.log("message.reply_count", message);
        if (message.root_id) {
          __channelMessages.value.posts[message.root_id].reply_count =
            message.reply_count;
        }

        __channelMessages.value = updateMessageList(
          __channelMessages.value,
          message
        );
        await updateCache(channel_id.value, __channelMessages.value);

        // 如果是自己发的消息，滚动到底部
        // 如果是别人发的消息：没有向上翻阅一屏，滚动到底部，否则显示提示消息，点击后滚动到底部
        const sender = message.user_id;
        const scrollInfo = scrollAreaRef.value?.getScroll();
        // 滚动条距离底部，当滚动条在底部时，这个距离是一个聊天容器的高度
        const _bottom = scrollInfo.verticalSize - scrollInfo.verticalPosition;
        // 是否向上滚动超过了一屏
        const readingHistory =
          _bottom - scrollInfo.verticalContainerSize * 2 > 0;
        if (mm_me.value?.id !== sender && readingHistory) {
          const avatar = await useFetchAvatar(sender);
          $q.notify({
            message: $t('got_new_messages'),
            avatar: avatar,
            actions: [
              {
                label: $t('view_now'),
                color: "white",
                handler: () => {
                  scroll_bottom();
                },
              },
            ],
          });
        } else {
          scroll_bottom();
        }
      }
    }
    if (mm_wsStore?.event?.event === "channel_member_updated") {
      const res = await getChannelByID(teamStore.channel?.id);
      if (res?.data) {
        teamStore.channel = res.data;
      }
    }
  },
  { immediate: true, deep: true }
);

const backList = async () => {
  if(teamStore.project){
    await removeLastChannel(teamStore.project?.id);
    uiStore.showMainContentList = true;
    await router.push(`/teams/projects/${teamStore.project?.id}/chat`);
  } else {
    await router.push('/teams');
  }
};

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
const isEnter = ref(false);
const separatorRef = ref(null);
onMounted(() => {
  if ($q.screen.gt.xs) {
    const separatorElement = separatorRef.value?.$el.querySelector(
      ".q-splitter__separator"
    );
    if (!separatorElement) {
      console.error("没有找到class为q-splitter__separator的div");
      return;
    }

    separatorElement.addEventListener("mouseenter", () => {
      isEnter.value = true;
    });

    separatorElement.addEventListener("mouseleave", (event) => {
      if (!event.buttons) {
        // 如果鼠标没有按下
        isEnter.value = false;
      } else {
        setTimeout(() => {
          isEnter.value = false;
        }, 10000);
      }
    });
  }
});
onUnmounted(() => {
  const separatorElement = separatorRef.value?.$el.querySelector(
    ".q-splitter__separator"
  );
  if (separatorElement) {
    separatorElement.removeEventListener("mouseenter", () => {});
    separatorElement.removeEventListener("mouseleave", () => {});
    separatorElement.removeEventListener("mousedown", () => {});
  }
  document.removeEventListener("mouseup", () => {});
});
</script>
