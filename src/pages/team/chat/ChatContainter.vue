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
          icon="mdi-tag-multiple"
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
    <q-splitter v-if="$q.screen.gt.xs"
                v-model="splitterModel"
                :limits="limits"
                :separator-style="uiStore.chat_pannel ? '' : 'display: none'"
                class="q-space"
                ref="separatorRef"
    >
      <template v-slot:before>
        <div class="fit column">
          <q-scroll-area v-model="scrollModel"
                         class="q-space"
                         ref="scrollAreaRef"
                         @scroll="scrollHandler"
          >
            <q-resize-observer @resize="onResize" />
            <q-pull-to-refresh @refresh="refresh">
              <q-infinite-scroll v-if="messages?.length > 0"
                                 reverse
                                 @load="onLoad"
                                 :disable="!hasMore"
                                 :offset="520"
                                 :debounce="300"
                                 class="column justify-end"
                                 :style="`min-height: ${scrollContainer?.height}px`"
              >
                <div class="column no-wrap relative-position article messages_list">
                  <div class="full-width column no-wrap flex-center q-pb-xl q-mb-xl" style="height: 66vh">
                    <ChatStarter style="max-width: 560px;max-height: 560px" />
                    <span class="text-h1">
                    Channel Chat start here
                  </span>
                  </div>

                  <template v-for="(i, index) in messages" :key="i.id">
                    <MessageItem
                        v-if="!i.root_id"
                        :msg="i"
                        :prev="messages[index - 1]"
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
import {computed, ref, onMounted, onUnmounted, nextTick, watch, useTemplateRef} from "vue";
import { getPostsOfChannel, getUsersByIDs, getChannelByID as getMmChannelByID } from "src/api/mattermost.js";
import { generateUrlParams } from 'src/hooks/utilits.js'
import {db} from "boot/dexie";
import MessageItem from "pages/team/chat/MessageItem.vue";
import {teamStore, uiStore, mm_wsStore, mmUser} from "src/hooks/global/useStore";
import SendmsgBox from "pages/Chat/components/wigets/SendmsgBox.vue";
import {getChannelByID} from "src/api/strapi/team";
import {useFetchAvatar} from "pages/Chat/hooks/useFetchAvatar";
import MemberManager from "pages/team/settings/MemberManager.vue";
import DirectMemberInfo from "pages/team/chat/components/DirectMemberInfo.vue";
import ThreadContainer from "pages/team/chat/ThreadContainer.vue";
import PinnedsContainder from "pages/Chat/components/PinnedsContainder.vue";
import ChatStarter from 'src/pages/team/components/widgets/icons/ChatStarter.vue'
import {removeLastChannel} from "pages/team/chat/TeamChat";
import { useQuasar, debounce } from "quasar";
import { i18n } from 'src/boot/i18n.js';
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
  mm_channel_id: channel_id.value,
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
const scrollPosition = ref()
const to_bottom = ref();
const scrollHandler = ({verticalSize,verticalPosition}) => {
  scrollPosition.value = verticalPosition;
  to_bottom.value = verticalSize - verticalPosition
}
async function onLoad (index, done)  {
  // const getOldScrollInfo = scrollAreaRef.value?.getScroll();
  // const to_bottom = getOldScrollInfo.verticalSize - getOldScrollInfo.verticalPosition;
  // console.log('p', getOldScrollInfo.verticalPosition, 'b', to_bottom)
  await fetchMore();
  await nextTick();
  const { verticalSize } = scrollAreaRef.value?.getScroll();
  const new_position = verticalSize - to_bottom.value;
  scrollAreaRef.value?.setScrollPosition("vertical", new_position, 0)
  // console.log('p', new_position, 'b', to_bottom)
  done();
}
async function refresh (done) {
  try {
    await fetchMore();
    scrollAreaRef.value?.setScrollPosition("vertical", 500, 50)
    done();
  } catch (error) {
    console.error('加载更多数据时出错:', error);
    done();
  }
}
const autoScrollBottom = ref(false);
const onResize = async (size) => {
  scrollContainer.value = size;
  const scrollInfo = scrollAreaRef.value?.getScroll();
  // 滚动条距离底部，当滚动条在底部时，这个距离是一个聊天容器的高度
  const _bottom = scrollInfo.verticalSize - scrollInfo.verticalPosition;
  if (autoScrollBottom.value && _bottom > scrollInfo.verticalContainerSize) {
    await scroll_bottom(scrollContainer.value?.height);
  }
};
const backList = async () => {
  if(teamStore.project){
    await removeLastChannel(teamStore.project?.id);
    uiStore.showMainContentList = true;
    await router.push(`/teams/projects/${teamStore.project?.id}/chat`);
  } else {
    await router.push('/teams');
  }
};

const messages = ref([]);
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
  if(fetchCount === 1){
    scrollAreaRef.value?.setScrollPercentage("vertical", 1, 50)
  }
  if (res?.data) {
    fetching.value = false
    return res.data;
  }
};

const merageMsg = (newMessages = {}) => {
  if (newMessages) {
    const {order, posts} = newMessages;
    hasMore.value = order?.length === 0

    const currentMessageIds = new Set(messages.value?.map(msg => msg.id));
    let newMessageEntries = order.reverse().map(postId => posts[postId]).filter(msg => !currentMessageIds.has(msg.id));

    if((!messages.value || messages.value?.length === 0) && order.length > 0){
      messages.value = newMessageEntries;
      before.value = newMessageEntries[0].id
      return
    }

    if(hasMsgInAfter.value && lastCacheID.value) {
      const lastCacheIndex = messages.value.findIndex(msg => msg.id === lastCacheID.value);
      if (lastCacheIndex !== -1) {
        messages.value.splice(lastCacheIndex + 1, 0, ...newMessageEntries);
      }
      hasMsgInAfter.value = !order.includes(lastCacheID.value);
      if(!hasMsgInAfter){
        before.value = messages.value[0]?.id
        lastCacheID.value = null
        fetchMore();
        console.log('auto fetchMore')
      } else {
        before.value = order.reverse()[0];
      }
    } else {
      messages.value.unshift(...newMessageEntries)
      before.value = messages.value[0]?.id
    }
    return
  }
}

const fetchMore = async () => {
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    merageMsg(resMsgs.value);
  }
  await updateCache();
  return resMsgs.value
};

const updateCache = async () => {
  const serializedMessages = JSON.parse(JSON.stringify(messages.value));
  await db.channels.put({ id: channel_id, messages: serializedMessages });
};

const resMsgs = ref();
const lastCacheID = ref();
const fetchCount = ref(0);
const initMsgs = async () => {
  if(messages.value?.length > 0){
    lastCacheID.value = messages.value[messages.value.length - 1].id;
    hasMsgInAfter.value = true
  }
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    merageMsg(resMsgs.value)
  }
}
onMounted(async () => {
  messages.value =  await initCache();
  await initMsgs();
});

const cleanCacheReInit = async () => {
  messages.value = []
  await db.channels.delete(channel_id);
  await initMsgs()
};

// 当组件卸载或不可见时更新缓存
onUnmounted(() => {
  updateCache();
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