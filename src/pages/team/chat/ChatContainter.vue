<template>
  <div :key="_channel_id" class="absolute-full column no-wrap overflow-hidden" :class="$q.dark.mode ? 'bg-darker text-grey-1' : 'bg-grey-1 text-grey-10'">
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
      <!-- {{ teamStore.channel?.name }} -->
        <q-btn color="primary" dense icon="check" label="view" @click="__viewChannel(_channel_id)" />
      <q-space />
      <q-btn
          v-if="strapi_channel_id"
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'ChannelInfo' ? 'green' : ''"
          icon="info"
          @click="togglePowerpannel('ChannelInfo')"
      />
      <q-btn
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'pinneds' ? 'green' : ''"
          icon="mdi-tag-multiple"
          @click="togglePowerpannel('pinneds')"
      >
        <q-tooltip> {{ $t('pinned_messages') }} </q-tooltip>
      </q-btn>
      <q-btn v-if="strapi_channel_id && useAuths('manageMember', ['channel'])"
          :dense="$q.screen.gt.sm"
          flat
          :color="uiStore.chat_pannel === 'MemberManager' ? 'green' : ''"
          icon="manage_accounts"
          @click="togglePowerpannel('MemberManager')"
      />
      <q-btn v-if="teamStore?.direct_user"
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
          <q-scroll-area
            class="q-space"
            ref="scrollAreaRef"
          >
          <q-resize-observer @resize="onResize" />
            <q-pull-to-refresh @refresh="refresh">
              <q-infinite-scroll v-if="messages?.length > 0"
                                 reverse
                                 @load="onLoad"
                                 :disable="!hasMore"
                                 :offset="700"
                                 class="column no-wrap justify-end article messages_list"
                                 :style="scrollContainer ? `min-height: ${scrollContainer.height}px` : ''"
              >
                <template v-slot:loading>
                  <div class="row justify-center q-my-md">
                    <q-spinner color="primary" name="dots" size="40px" />
                  </div>
                </template>
                <ChannelHeader :class="hasMore ? 'op-0' : 'op-none'" />
                <template v-for="(i, index) in messages" :key="i.id">
                  <KeepAlive>
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
                  </KeepAlive>
                </template>
              </q-infinite-scroll>
            </q-pull-to-refresh>
            <div class="msgContainerBottom" ref="msgContainerBottom"></div>
          </q-scroll-area>
          <div v-if="teamStore.mm_channel?.wasblocked || teamStore.mm_channel?.isblocked" class="full-width q-pa-xl border flex flex-center">
            {{ `${teamStore.mm_channel?.wasblocked ? '您已被对方屏蔽' : '您已屏蔽对方'}，不能发送消息` }}
          </div>
          <SendmsgBox v-else :channel_id="channel_id" />
        </div>
      </template>
      <template v-if="uiStore.chat_pannel" v-slot:separator>
        <div class="fit" :class="hoverSplitterLine ? 'bg-primary' : ''"></div>
      </template>
      <template v-slot:after>
        <div class="absolute-full chat_pannel"
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
              :showClose="false"
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
          <ChannelInfo v-if="teamStore.channel && uiStore.chat_pannel === 'ChannelInfo'" />
        </div>
      </template>
    </q-splitter>
    <template v-else>
      <div class="q-space column">
        <template v-if="uiStore.chat_pannel">
          <div
              class="absolute-full chat_pannel"
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
          <q-scroll-area
            class="q-space"
            ref="scrollAreaRef"
          >
            <q-pull-to-refresh @refresh="refresh">
              <q-infinite-scroll v-if="messages?.length > 0"
                                 reverse
                                 @load="onLoad"
                                 :disable="!hasMore"
                                 :offset="700"
                                 class="column no-wrap justify-end article messages_list"
              >
                <template v-slot:loading>
                  <div class="row justify-center q-my-md">
                    <q-spinner color="primary" name="dots" size="40px" />
                  </div>
                </template>
                <ChannelHeader :class="hasMore ? 'op-0' : 'op-none'" />
                <template v-for="(i, index) in messages" :key="i.id">
                  <KeepAlive>
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
                  </KeepAlive>
                </template>
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
import {computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, useTemplateRef, watch} from "vue";
import {getChannelByID as getMmChannelByID, getPostsOfChannel} from "src/api/mattermost.js";
import {generateUrlParams} from 'src/hooks/utilits.js'
import MessageItem from "pages/team/chat/MessageItem.vue";
import {mm_wsStore, mmUser, teamStore, uiStore} from "src/hooks/global/useStore";
import SendmsgBox from "./SendmsgBox.vue";
// import {getChannelByID} from "src/api/strapi/team";
import {useFetchAvatar} from "pages/Chat/hooks/useFetchAvatar";
import MemberManager from "pages/team/settings/MemberManager.vue";
import DirectMemberInfo from "pages/team/chat/components/DirectMemberInfo.vue";
import ThreadContainer from "pages/team/chat/ThreadContainer.vue";
import PinnedsContainder from "pages/Chat/components/PinnedsContainder.vue";
import {removeLastChannel} from "pages/team/chat/TeamChat";
import {useQuasar} from "quasar";
import {i18n} from 'src/boot/i18n.js';
import {useRouter, useRoute} from "vue-router";
import { __viewChannel } from "src/hooks/mattermost/useMattermost.js";
import ChannelHeader from './components/ChannelHeader.vue'
import ChannelInfo from './components/ChannelInfo.vue'


const router = useRouter();
const route = useRoute();
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
const lastSplitterModel = ref();
const cacheSplitter = () => {
  lastSplitterModel.value = splitterModel.value;
}
const limits = ref([100, 100]);
const open_powerPannel = () => {
  splitterModel.value = lastSplitterModel.value || 61;
  limits.value = [39, 81];
};
const close_powerPannel = () => {
  cacheSplitter();
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
  if(splitterModel.value !== 100){
    cacheSplitter();
  }
  uiStore.chat_pannel = uiStore.chat_pannel !== pannel ? pannel : "";
  if (uiStore.chat_pannel) {
    open_powerPannel();
  } else {
    close_powerPannel();
  }
};

const scrollAreaRef = ref();
const msgContainerBottom = ref(null);
const scroll_bottom = async () => {
  const maxAttempts = 3;
  const delay = 200;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    await nextTick();
    try {
      msgContainerBottom.value?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    } catch (err) {
      console.error('Primary scroll attempt failed:', err);
      try {
        scrollAreaRef.value?.setScrollPercentage("vertical", 1);
      } catch (backupErr) {
        console.error('Backup scroll attempt failed:', backupErr);
      }
    }
  }
};
async function onLoad (index, done)  {
  await fetchMore();  
  done();
}
async function refresh (done)  {
  await fetchMore();
  done();
}
const scrollContainer = ref();
const onResize = async (size) => {
  await nextTick();
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
const per_page = ref(30);
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

const fetching = ref(false);
const getPosts = async () => {
  if(fetching.value) return
  fetching.value = true;
  const res = await getPostsOfChannel(channel_id, options.value);  
  if (res?.data) {
    fetchCount.value++;
    fetching.value = false
    return res.data;
  }
};

const merageMsg = async (newMessages = {}) => {
  if (newMessages) {
    let {order, posts} = newMessages;
    if(posts?.length > 0){
      posts = posts?.filter(msg => Boolean(msg.message));
    }
    if(order.length === 0){
      hasMore.value = false;
      return
    }
    const currentMessageIds = new Set(messages.value?.map(msg => msg.id));
    let newMessageEntries = order.reverse().map(postId => posts[postId]).filter(msg => !currentMessageIds.has(msg.id));
    await nextTick();
    messages.value = [...newMessageEntries, ...messages.value];
  }
}

const fetchMore = async () => {
  before.value = messages.value[0]?.id;
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    merageMsg(resMsgs.value);
  }
  return resMsgs.value
};

const resMsgs = ref();
const fetchCount = ref(0);
const initMsgs = async () => {
  resMsgs.value = await getPosts();
  if (resMsgs.value) {
    merageMsg(resMsgs.value)
  }
}

const _channel_id = computed(() => channel_id || route.params.channel_id);
const view = async () => {
  if(_channel_id.value){
    await __viewChannel(_channel_id.value);
  }
}
onBeforeMount(async() => {
  await initMsgs();
  uiStore.hide_footer = true
  // 如果通过连接直接访问到聊天界面，需要获取Strapi频道、Mattermost频道
  if(!teamStore.mm_channel && _channel_id.value){
    const res = await getMmChannelByID(_channel_id.value);
    if(res?.data){
      teamStore.mm_channel = res.data;
    }
  }
})
onMounted(async () => {
  await view();
  await scroll_bottom()
})

const mm_me = computed(() => mmUser.me);
watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);

        if (message?.channel_id === channel_id) {
          if(message.message === '') return
          
          if (message.root_id) {
            messages.value.find(msg => msg.id === message.root_id).reply_count = message.reply_count;
          }
          messages.value.push(message);

          // 如果是自己发的消息，滚动到底部
          // 如果是别人发的消息：没有向上翻阅一屏，滚动到底部，否则显示提示消息，点击后滚动到底部
          const sender = message.user_id;
          const scrollInfo = scrollAreaRef.value?.getScroll();
          if(!scrollInfo) return
          // 滚动条距离底部，当滚动条在底部时，这个距离是一个聊天容器的高度
          const _bottom = scrollInfo.verticalSize - scrollInfo.verticalPosition;
          // 是否向上滚动超过了一屏
          const readingHistory =
              _bottom - scrollInfo.verticalContainerSize * 2 > 0;
          if (mm_me.value?.id !== sender && readingHistory) {
            console.log('他人发送的');
            
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
            setTimeout(() => {
              scroll_bottom();
            }, 1);
          }
        }
      }
    },
    { immediate: true, deep: true }
);
const hoverSplitterLine = ref(false);
const separatorRef = useTemplateRef('separatorRef');

// 处理分屏拖拽分割线UI
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
      hoverSplitterLine.value = true;
    });

    separatorElement.addEventListener("mouseleave", (event) => {
      if (!event.buttons) {
        // 如果鼠标没有按下
        hoverSplitterLine.value = false;
      } else {
        setTimeout(() => {
          hoverSplitterLine.value = false;
        }, 10000);
      }
    });
  }
});
onUnmounted(() => {
  // 当组件卸载或不可见时更新缓存
  scrollContainer.value = null;
  messages.value = []

  // 移除事件监听器
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

<style scoped>
.msgContainerBottom {
  /* 确保div不会影响布局但能被滚动到 */
  height: 0;
  margin: 0;
  padding: 0;
}
</style>