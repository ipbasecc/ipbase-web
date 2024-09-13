<template>
  <div class="absolute-full column no-wrap overflow-hidden" :class="$q.dark.mode ? 'bg-darker text-grey-1' : 'bg-grey-1 text-grey-10'">
    <q-bar
        class="border-bottom"
        :class="$q.dark.mode ? 'bg-dark text-grey-1' : 'bg-grey-1 text-grey-10'"
        :style="`height: ${!$q.screen.gt.sm ? '48px' : ''}`"
    >
      <q-btn
          flat
          :dense="$q.screen.gt.sm"
          v-if="!$q.screen.gt.sm"
          :size="$q.screen.gt.sm ? 'sm' : ''"
          icon="mdi-chevron-left"
          :color="$q.dark.mode ? 'white' : 'black'"
          @click="backList()"
      />
      <q-btn
          flat
          :dense="$q.screen.gt.sm"
          :size="$q.screen.gt.sm ? 'sm' : ''"
          icon="mdi-refresh"
          :color="$q.dark.mode ? 'white' : 'black'"
          @click="cleanCacheReInit(channel_id)"
      >
        <q-tooltip> {{ $t('clean_cache') }} </q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'pinneds' ? 'green' : ''"
          icon="mdi-tag-multiple"
          @click="togglePowerpannel('pinneds')"
      >
        <q-tooltip> {{ $t('pinned_messages') }} </q-tooltip>
      </q-btn>
      <q-btn
          v-if="strapi_channel_id && useAuths('manageMember', ['channel'])"
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'MemberManager' ? 'green' : ''"
          icon="manage_accounts"
          @click="togglePowerpannel('MemberManager')"
      />
      <q-btn
          v-if="teamStore?.direct_user"
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'MemberManager' ? 'green' : ''"
          icon="info"
          @click="togglePowerpannel('directMemberInfo')"
      />
    </q-bar>
    <q-splitter v-if="$q.screen.gt.xs"
                v-model="splitterModel"
                :limits="limits"
                :separator-style="uiStore.chat_pannel ? '' : 'display: none'"
                class="q-space"
                ref="separatorRef"
    >
      <template v-slot:before>
        <div class="fit column">
          <q-resize-observer @resize="onResize" />
          <q-scroll-area v-model="scrollModel"
                         class="q-space"
                         ref="scrollAreaRef"
          >
            <q-pull-to-refresh @refresh="refresh">
              <q-infinite-scroll v-if="uiMessages?.length > 0"
                                 reverse
                                 @load="onLoad"
                                 :disable="!hasMore || fetchCount === 0"
                                 :offset="scrollContainer?.height * 2"
                                 :debounce="30"
                                 class="column justify-end"
                                 :style="`min-height: ${scrollContainer?.height}px`"
              >
                <div class="column no-wrap relative-position article messages_list">
                  <ChannelHeader />
                  <template v-for="(i, index) in uiMessages" :key="i.id">
                    <MessageItem
                        v-if="!i.root_id"
                        :msg="i"
                        :prev="uiMessages[index - 1]"
                        :index="index"
                        :inThread="false"
                        :MsgOnly="!$q.screen.gt.xs"
                        container="channel"
                        @togglePowerpannel="togglePowerpannel"
                        @enterThread="enterThread"
                    />
                    <div v-if="i.id === lastCacheID && hasMsgInAfter && fetchCount > 0" class="row flex-center relative-position">
                      <div class="absolute-full flex flex-center">
                        <q-separator class="full-width op-3" />
                      </div>
                      <q-btn
                          dense
                          size="sm"
                          padding="2px 12px"
                          rounded
                          outline
                          color="primary"
                          :label="$t('show_unread_history_message')"
                          class="blur-sm"
                          @click="fetchMore"
                      />
                    </div>
                  </template>
                </div>
              </q-infinite-scroll>
            </q-pull-to-refresh>
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
      <template v-slot:after>
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
                @closePinned="togglePowerpannel('pinneds')"
            />
            <MemberManager
                v-if="uiStore.chat_pannel === 'MemberManager'"
                :byInfo
                class="absolute-full"
            />
            <DirectMemberInfo v-if="teamStore?.direct_user && uiStore.chat_pannel === 'directMemberInfo'"
                              :directMember="teamStore.direct_user"
                              @closeInfo="togglePowerpannel('directMemberInfo')"
            />
          </div>
        </template>
        <template v-else>
          <q-resize-observer @resize="onResize" />
          <q-scroll-area v-model="scrollModel"
                         class="q-space"
                         ref="scrollAreaRef"
          >
            <q-pull-to-refresh @refresh="refresh">
              <q-infinite-scroll v-if="uiMessages?.length > 0"
                                 reverse
                                 @load="onLoad"
                                 :disable="!hasMore || fetchCount === 0"
                                 :offset="scrollContainer?.height * 2"
                                 :debounce="30"
                                 class="column justify-end"
                                 :style="`min-height: ${scrollContainer?.height}px`"
              >
                <div class="column no-wrap relative-position article messages_list">
                  <ChannelHeader />
                  <template v-for="(i, index) in uiMessages" :key="i.id">
                    <MessageItem
                        v-if="!i.root_id"
                        :msg="i"
                        :prev="uiMessages[index - 1]"
                        :index="index"
                        :inThread="false"
                        :MsgOnly="!$q.screen.gt.xs"
                        container="channel"
                        @togglePowerpannel="togglePowerpannel"
                        @enterThread="enterThread"
                    />
                    <div v-if="i.id === lastCacheID && hasMsgInAfter && fetchCount > 0" class="row flex-center relative-position">
                      <div class="absolute-full flex flex-center">
                        <q-separator class="full-width op-3" />
                      </div>
                      <q-btn
                          dense
                          size="sm"
                          padding="2px 12px"
                          rounded
                          outline
                          color="primary"
                          :label="$t('show_unread_history_message')"
                          class="blur-sm"
                          @click="fetchMore"
                      />
                    </div>
                  </template>
                </div>
              </q-infinite-scroll>
            </q-pull-to-refresh>
          </q-scroll-area>
          <div v-if="teamStore.mm_channel?.wasblocked || teamStore.mm_channel?.isblocked" class="full-width q-pa-xl border flex flex-center">
            {{ `${teamStore.mm_channel?.wasblocked ? '您已被对方屏蔽' : '您已屏蔽对方'}，不能发送消息` }}
          </div>
          <SendmsgBox v-else :channel_id="channel_id" />
        </template>
      </div>
    </template>
  </div>
</template>
<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch} from "vue";
import {getChannelByID as getMmChannelByID, getPostsOfChannel} from "src/api/mattermost.js";
import {generateUrlParams} from 'src/hooks/utilits.js'
import {db} from "boot/dexie";
import MessageItem from "pages/team/chat/MessageItem.vue";
import {mm_wsStore, mmUser, teamStore, uiStore} from "src/hooks/global/useStore";
import SendmsgBox from "pages/Chat/components/wigets/SendmsgBox.vue";
import {getChannelByID} from "src/api/strapi/team";
import {useFetchAvatar} from "pages/Chat/hooks/useFetchAvatar";
import MemberManager from "pages/team/settings/MemberManager.vue";
import DirectMemberInfo from "pages/team/chat/components/DirectMemberInfo.vue";
import ThreadContainer from "pages/team/chat/ThreadContainer.vue";
import PinnedsContainder from "pages/Chat/components/PinnedsContainder.vue";
import {removeLastChannel} from "pages/team/chat/TeamChat";
import {useQuasar} from "quasar";
import {i18n} from 'src/boot/i18n.js';
import {useRouter} from "vue-router";
import { __viewChannel } from "src/hooks/mattermost/useMattermost.js";
import ChannelHeader from './components/ChannelHeader.vue'

const router = useRouter();
const $t = i18n.global.t;
const $q = useQuasar();

const { channel_id } = defineProps({
  channel_id: String,
});
const strapi_channel_id = computed(() => teamStore?.channel?.id);
const byInfo = computed(() => ({
  by: "channel",
  channel_id: strapi_channel_id.value,
}));
const chatInfo = computed(() => ({
  mm_channel_id: channel_id,
  post_id: thread.value?.id,
}));

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
const scrollAreaRef = useTemplateRef('scrollAreaRef');
const scroll_bottom = async (_val) => {
  await nextTick();
  scrollAreaRef.value.setScrollPercentage(
      "vertical",
      1, // 总出现不能滚动到底的情况，给个暴力值
      300
  );
};
async function onLoad (index, done)  {
  if(!allCacheLoaded.value){
    console.log('继续从本地数据加载');
    await uiLoadMore()
  } else {
    console.log('本地数据加载完成，开始从后端获取');
    await fetchMore();
  }
  done();
}
const autoScrollBottom = ref(false);
const scrollContainer = ref();
const onResize = async (size) => {
  scrollContainer.value = size;
};
const backList = async () => {
  if(teamStore.project){
    await removeLastChannel(teamStore.project?.id);
    uiStore.showMainContentList = true;
    await router.push(`/teams/projects/${teamStore.project?.id}/chat`);
  } else if(teamStore.direct_user) {
    teamStore.direct_user = null
    teamStore.mm_channel = null
    await router.push(`/chats`);
  } else {
    await router.push('/teams');
  }
};

const messages = ref([]);
const uiMessages = ref([]);
const cacheMessages = ref([]);
const hasMsgInAfter = ref(false);
const per_page = ref(60);
const before = ref();
const after = ref();

const hasMore = ref(true);
const options = computed(() => {
  let ops = {
    page: 0,
    per_page: per_page.value,
    before: before.value,
    after: after.value
  }
  return generateUrlParams(ops)
});

const initCache = async () => {
  const cachedMessages = await db.channels.get(channel_id);
  return  cachedMessages?.messages || [];
};

const fetching = ref(false);
const getPosts = async () => {
  if(fetching.value) return
  fetching.value = true;
  const res = await getPostsOfChannel(channel_id, options.value);
  fetchCount.value++
  if (res?.data) {
    console.log('getPosts', res.data.order);
    fetching.value = false
    return res.data;
  }
};

const merageMsg = (newMessages = {}) => {
  if (newMessages) {
    const {order, posts} = newMessages;
    hasMore.value = order?.length !== 0

    const currentMessageIds = new Set(messages.value?.map(msg => msg.id));
    let newMessageEntries = order.reverse().map(postId => posts[postId]).filter(msg => !currentMessageIds.has(msg.id));
    console.log('newMessageEntries', newMessageEntries?.length);
    
    if((!newMessageEntries || newMessageEntries?.length === 0) && messages.value?.length > 0) {
      before.value = cacheMessages.value[0]?.id;
      console.log('经过筛选，获取到的消息在本地消息中全部存在，此时认为用户上次离开到现在，没有新消息，设置缓存消息第一条（时间上的最早）作为请求before参数：', before.value);
      hasMsgInAfter.value = false;
      return
    }

    if((!messages.value || messages.value?.length === 0) && order.length > 0){
      console.log('首次从后端获取消息后，messages长度为0,说明缓存中没有数据，直接设置message和uiMessages为获取到的数据');      
      messages.value = newMessageEntries;
      uiMessages.value = newMessageEntries;
      before.value = order.reverse()[0];
      console.log('设置before参数为获取到消息的最后一条的id', before.value);  
      hasMsgInAfter.value = false;
      allCacheLoaded.value = true;
      console.log('设置所有缓存已读取完毕，后续进入无缓存逻辑', before.value);
      return
    }

    if(hasMsgInAfter.value && lastCacheID.value) {
      console.log('本地有缓存，默认进入有非缓存内新消息逻辑');
      
      const lastCacheIndex = messages.value.findIndex(msg => msg.id === lastCacheID.value);
      const lastCacheIndex_byUI = uiMessages.value.findIndex(msg => msg.id === lastCacheID.value);
      if (lastCacheIndex !== -1) {
        messages.value.splice(lastCacheIndex + 1, 0, ...newMessageEntries);
      }
      if (lastCacheIndex_byUI !== -1) {
        uiMessages.value.splice(lastCacheIndex + 1, 0, ...newMessageEntries);
      }
      hasMsgInAfter.value = !order.includes(lastCacheID.value);
      console.log('新获取的数据是否包含缓存标记id，设置hasMsgInAfter为', hasMsgInAfter.value);
      if(!hasMsgInAfter.value){
        console.log('包含缓存标记，说明缓存与新消息之间没有未读消息了');
        before.value = messages.value[0]?.id
        console.log('设置messages第一个为before参数，之后上拉加载将从获取获取历史消息，新的before：', before.value);
        lastCacheID.value = null
        console.log('清除缓存标记id');
      } else {
        before.value = order.reverse()[0];
        console.log('不包含缓存标记，说明还有未读，设置before为本地后端数据第一条的id，下此后端数据获取该条之前的数据：', before.value);
      }
    } else {
      console.log('本地无缓存，后端数据格式化之后直接赋值给messages和uiMessages');
      messages.value.unshift(...newMessageEntries);
      uiMessages.value = messages.value
      console.log('设置最后一条消息的id，做为上拉加载获取历史消息的before标记：', before.value);
      before.value = messages.value[0]?.id
    }
    return
  }
}

const fetchMore = async () => {
  console.log('before fetchMore', before.value);
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    merageMsg(resMsgs.value);
  }
  await updateCache();
  return resMsgs.value
};

const allCacheLoaded = ref(false);
const nextPageStartIndex = ref(0);
async function uiLoadMore() {
  const reverseMsg = cacheMessages.value.reverse();
  const nextPage = reverseMsg.slice(nextPageStartIndex.value, nextPageStartIndex.value + 60).reverse();
  uiMessages.value = [...nextPage, ...uiMessages.value];
  nextPageStartIndex.value += 60;

  if (nextPageStartIndex.value >= cacheMessages.value.length) {
    console.log('所有数据已加载完毕');
    allCacheLoaded.value = true
  } else {
    console.log(`已加载到第 ${uiMessages.value.length} 条数据`);
  }
  return uiMessages.value
}

const updateCache = async () => {
  const serializedMessages = JSON.parse(JSON.stringify(messages.value));
  await db.channels.put({ id: channel_id, messages: serializedMessages });
};

const resMsgs = ref();
const lastCacheID = ref();
const fetchCount = ref(0);
const initMsgs = async () => {
  console.log('开始initMsgs');
  if(messages.value?.length > 0){
    console.log('messages数量大于0');
    console.log('uiMessages数量是：', uiMessages.value?.length);
    
    console.log('将cacheMessages最后一条消息设置为 “lastCacheID“ -缓存标记位置，载入组件先从后端获取消息');
    lastCacheID.value = cacheMessages.value[cacheMessages.value.length - 1].id;
    hasMsgInAfter.value = true
  }
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    console.log('首次从后端获取到消息数据，开始合并');
    merageMsg(resMsgs.value)
  }
  console.log('开始UI数据加载逻辑');
  await uiLoadMore();
}
onMounted(async () => {
  console.log('开始数据加载');
  uiStore.hide_footer = true
  cacheMessages.value = await initCache();
  console.log('读取到本地缓存，赋值给cacheMessages');
  messages.value = await initCache();
  console.log('读取到本地缓存，赋值给messages');
  await initMsgs();
  
  // 如果通过连接直接访问到聊天界面，需要获取Strapi频道、Mattermost频道
  if(!teamStore.mm_channel){
    const res = await getMmChannelByID(channel_id.value);
    if(res?.data){
      teamStore.mm_channel = res.data;
    }
  }

  await __viewChannel(channel_id);
});

const cleanCacheReInit = async () => {
  messages.value = []
  await db.channels.delete(channel_id);
  await initMsgs()
};

// 当组件卸载或不可见时更新缓存
onUnmounted(() => {
  scrollContainer.value = null;
  messages.value = []
  uiMessages.value = []
});

const mm_me = computed(() => mmUser.me);
watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);

        if (message?.channel_id === channel_id) {
          autoScrollBottom.value = false;
          if (message.root_id) {
            messages.value.find(msg => msg.id === message.root_id).reply_count = message.reply_count;
          }
          messages.value.push(message);
          uiMessages.value.push(message);
          updateCache();

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
              class: 'border',
              actions: [
                {
                  label: $t('view_now'),
                  progress: true,
                  class: 'border bg-primary text-white q-ml-xl',
                  handler: () => {
                    scroll_bottom();
                  },
                },
              ],
            });
          } else {
            await nextTick();
            setTimeout(() => {
              scroll_bottom();
            }, 1);
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
const isEnter = ref(false);
const separatorRef = useTemplateRef('separatorRef');
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