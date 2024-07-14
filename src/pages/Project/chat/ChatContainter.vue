<!-- 项目聊天主体页面 -->
<template>
  <div class="fit column no-wrap overflow-hidden">
    <q-bar class="transparent border-bottom">
      <q-btn icon="refresh" @click="cleanCacheReInit" />
      <q-space />
      <q-btn dense flat icon="push_pin" @click="togglePowerpannel('pinneds')" />
    </q-bar>
    <q-splitter v-model="splitterModel" :limits="limits" class="q-space">
      <template v-slot:before>
        <div class="fit column">
          <q-scroll-area
            v-model="scrollModel"
            :class="$q.dark.mode ? '' : 'bg-grey-2'"
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
              :style="`min-height: ${scroolContainer?.height}px`"
              :debounce="300"
              :offset="100"
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
                    container="channel"
                    @togglePowerpannel="togglePowerpannel"
                    @enterThread="enterThread"
                  />
                </template>
              </div>
            </q-infinite-scroll>
          </q-scroll-area>
          <SendmsgBox :channel_id="channel_idRef" />
        </div>
      </template>
      <template v-slot:separator>
        <q-icon v-if="powerPannel" name="drag_indicator" />
      </template>
      <template v-slot:after>
        <ThreadContainer
          v-if="powerPannel === 'thread' && thread"
          :thread_channel_id="channel_idRef"
          :thread_post_id="thread?.id"
          :thread="thread"
          :me_profile="mm_me"
          @closeThread="closeThread"
        />
        <PinnedsContainder
          v-if="powerPannel === 'pinneds'"
          :channel_id="channel_idRef"
          :key="channel_idRef"
        />
      </template>
    </q-splitter>
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
} from "vue";
import { useQuasar } from "quasar";
import localforage from "localforage";
import { db } from "src/boot/dexie.js";
import { fetch_MmMe } from "src/hooks/global/useFetchme.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";

import MessageItem from "src/pages/Project/chat/MessageItem.vue";
import SendmsgBox from "src/pages/Chat/components/wigets/SendmsgBox.vue";
import ThreadContainer from "src/pages/Project/chat/ThreadContainer.vue";
import PinnedsContainder from "src/pages/Chat/components/PinnedsContainder.vue";

import {
  getPostsOfChannel,
  getUsersByIDs,
  getChannelByID,
} from "src/api/mattermost.js";
import { mergePosts } from "src/hooks/mattermost/useMattermost.js";
import { uniqueById } from "src/hooks/utilits.js";

import useMmws from "src/stores/mmws.js";
import useProjectStore from "src/stores/project.js";
import useMmstore from "src/stores/mmstore.js";

const mm_wsStore = useMmws();
const projectStore = useProjectStore();
const mmstore = useMmstore();
onMounted(() => {
  projectStore.navigation = "chat";
});

const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
});
const { channel_id: channel_idRef } = toRefs(props);
const mm_me = ref();
fetch_MmMe()
  .then((res) => {
    mm_me.value = res;
  })
  .catch((e) => {
    console.error("获取Mattermost用户出错", e);
  });

const options = computed(() => {
  const _ = `page=${page.value}&per_page=${per_page.value}${
    before.value ? `&before=${before.value}` : ""
  }${after.value ? `&after=${after.value}` : ""}`;
  return _.trim(); //要删掉请求参数中的所有空格
});
const page = ref(0);
const per_page = ref(30);
// const after = ref();
const before = ref(null);
const after = ref(null);

const __base = ref({
  order: [],
  posts: {},
});
const __afterCache = ref({
  order: [],
  posts: {},
});
const __beforCache = ref({
  order: [],
  posts: {},
});

const __order = computed(() => [
  ...__beforCache.value.order,
  ...__base.value.order,
  ...__afterCache.value.order,
]);

const __posts = computed(() =>
  mergePosts(
    __beforCache.value?.posts,
    __base.value?.posts,
    __afterCache.value?.posts
  )
);

const __channelMessages = computed(() => ({
  id: channel_idRef.value,
  order: __order.value,
  posts: __posts.value,
}));
const messages = ref(__base.value);

const getCache = async () => {
  const existingData = await db.channels.get(channel_idRef.value);
  return existingData;
};
const noCache = ref(true);
const updateCache = async () => {
  const serializedMessages = JSON.parse(JSON.stringify(messages.value));
  let cache = await getCache();
  if (cache && !noCache.value) {
    try {
      await db.channels.put(serializedMessages);
    } catch (error) {}
  } else {
    try {
      await db.channels.add(serializedMessages);
      noCache.value = false;
    } catch (error) {}
  }
};
watchEffect(() => {
  messages.value = __channelMessages.value;
});
// watch(
//   messages,
//   async () => {
//     if (messages.value) {
//       updateCache();
//     }
//   },
//   { immediate: true, deep: true }
// );
watch(
  channel_idRef,
  async () => {
    if (channel_idRef.value) {
      localforage.setItem(
        `project_${projectStore?.project_id}_chatChannel`,
        channel_idRef.value
      );
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
const get = async () => {
  // if (!fetchMoreOnly.value || hasMore.value === false) return;
  const res = await getPostsOfChannel(channel_idRef.value, options.value);
  if (res) {
    countGet.value++;
    fetchMoreOnly.value = false;
    initializtion.value = true;
  }
  if (res?.data?.order?.length > 0) {
    if (after.value) {
      __afterCache.value = {
        order: [
          ...res.data.order.slice().reverse(),
          ...__afterCache.value.order,
        ],
        posts: mergePosts(res.data.posts, __afterCache.value.posts),
      };
      hasMore.value = res.data.order?.length > 0;
    } else if (before.value) {
      __beforCache.value = {
        order: [
          ...res.data.order.slice().reverse(),
          ...__beforCache.value.order,
        ],
        posts: mergePosts(res.data.posts, __beforCache.value.posts),
      };
    } else {
      __base.value = {
        order: [...res.data.order.slice().reverse(), ...__base.value.order],
        posts: mergePosts(res.data.posts, __base.value.posts),
      };
    }
  } else {
    if (after.value) {
      after.value = null;
      before.value = __order.value[0];
    } else {
      hasMore.value = res.data.order?.length > 0;
      if (countGet.value > 2) {
        // 初始化时、onLoad时各自执行过一次，从第三次开始，如果没有获得新消息，发出提示
        $q.notify("没有更多消息了");
      }
    }
  }

  await cleanCache();
  await updateCache();
};
const getMore = async () => {
  if (!hasMore.value) return;
  page.value++;
  fetchMoreOnly.value = true;
  const res = await get();
  return res;
};

const initCache = async () => {
  let cache = await getCache();
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
const channelMembers = ref([]);
watch(
  __order,
  async () => {
    if (__order.value.length > 0) {
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

const powerPannel = ref();
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
};
const togglePowerpannel = (pannel) => {
  powerPannel.value = powerPannel.value === pannel ? "" : pannel;
  if (powerPannel.value) {
    open_powerPannel();
  } else {
    close_powerPannel();
  }
};

async function onLoad(index, done) {
  if (!hasMore.value && initializtion.value) {
    done();
    return;
  } else {
    await getMore();
    done();
  }
}

const scrollModel = ref(100);
const scrollAreaRef = ref();

const scroolContainer = ref();
const onResize = (size) => {
  scroolContainer.value = size;
};

const scroll_bottom = () => {
  scrollAreaRef.value.setScrollPosition(
    "vertical",
    scroolContainer.value.height * 100, // 总出现不能滚动到底的情况，给个暴力值
    300
  );
};

const getChannel = async (channel_id) => {
  const res = await getChannelByID(channel_id);
  if (res?.data) {
    return res.data;
  }
};
const initChannel = async () => {
  const channel = await getChannel(channel_idRef.value);
  if (channel) {
    mmstore.channel = channel;
    mmstore.current_channel_id = channel.id;
    messages.value = {
      ...__base.value,
      id: channel_idRef.value,
    };
    await initCache();
    fetchMoreOnly.value = true;
    await get();
    if (scrollAreaRef.value) {
      scroll_bottom();
    }
  }
};
const cleanCache = async () => {
  await db.channels.delete(channel_idRef.value);
};
const cleanCacheReInit = async () => {
  await cleanCache();
  initChannel();
};
watch(
  channel_idRef,
  () => {
    if (channel_idRef.value) {
      initChannel(channel_idRef.value);
    }
  },
  { immediate: true, deep: false }
);

watch(
  mm_wsStore,
  async () => {
    // 判断消息类型
    if (mm_wsStore?.event?.event === "posted") {
      let message = JSON.parse(mm_wsStore.event.data.post);

      if (message?.channel_id === channel_idRef.value) {
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
        await cleanCache();
        await updateCache();

        // 如果是自己发的消息，滚动到底部
        // 如果是别人发的消息：没有向上翻阅一屏，滚动到底部，否则显示提示消息，点击后滚动到底部
        const sender = message.user_id;
        const scrollInfo = scrollAreaRef.value?.getScroll();
        // 滚动条距离底部，当滚动条在底部时，这个距离是一个聊天容器的高度
        const _bottom = scrollInfo.verticalSize - scrollInfo.verticalPosition;
        // 是否向上滚动超过了一屏
        const readingHistory =
          _bottom - scrollInfo.verticalContainerSize * 2 > 0;
        if (mm_me.value?.id === sender || !readingHistory) {
          scroll_bottom();
        } else {
          const avatar = await useFetchAvatar(sender);
          $q.notify({
            message: "收到新消息",
            avatar: avatar,
            actions: [
              {
                label: "立即查看",
                color: "white",
                handler: () => {
                  scroll_bottom();
                },
              },
            ],
          });
        }
      }
    }
  },
  { immediate: true, deep: true }
);

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
</script>

<style lang="scss" scoped></style>
