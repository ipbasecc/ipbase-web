<template>
  <div class="absolute-full column no-wrap">
    <q-toolbar v-if="threadData" class="transparent row no-wrap gap-xs">
      <q-btn
        flat
        dense
        padding="xs md"
        :label="$t('view_all_threads')"
        :color="filter === 'all' ? 'primary' : ''"
        @click="filterThreadsFn('all')"
      />
      <q-btn
        flat
        dense
        padding="xs md"
        :label="`${unread_count} ${$t('unread')}`"
        :color="filter === 'unread' ? 'primary' : ''"
        @click="filterThreadsFn('unread')"
      >
        <q-badge
          v-if="unread_count > 0"
          color="red"
          rounded
          floating
          align="middle"
        />
      </q-btn>
      <q-space />
      <q-btn
        flat
        dense
        size="sm"
        icon="playlist_add_check"
        @click="readAllThreads(mm_user_id, team_id)"
      />
      <q-icon
        v-if="
          threadData.total_unread_threads > 0 ||
          threadData.total_unread_urgent_mentions > 0
        "
        name="radio_button_checked"
        color="green"
      >
        <q-tooltip class="transparent">
          {{ $t('have') }}
          <span class="q-px-xs text-white bg-primary radius-xs">{{
            threadData.total_unread_threads
          }}</span>
          {{ $t('items_unread') }}
        </q-tooltip>
      </q-icon>
    </q-toolbar>
    <template v-if="threads?.length > 0 && dataReady">
      <q-scroll-area class="q-space">
        <q-list class="q-px-sm q-pb-xl">
          <template v-for="(thread, index) in threads" :key="thread.id">
            <q-item
              @mouseenter="hovered = thread.id"
              @mouseleave="hovered = void 0"
            >
              <q-item-section v-if="thread.post?.message">
                <q-item-label caption lines="1">
                  <div class="row no-wrap gap-sm items-center">
                    <q-badge v-if="thread.unread_replies > 0" color="blue" rounded class="q-mr-sm" />
                    <UserName :mm_user_id="thread.post?.user_id" />
                    <q-space />
                    <TimeAgo :time="thread.last_reply_at" class="op-5" />
                  </div>
                </q-item-label>
                <div
                  class="font-medium cursor-pointer transition q-py-md"
                  :class="hovered === thread.id ? 'op-none' : 'op-8'"
                  v-html="marked.parse(thread.post?.message)"
                  @click="getThreadFn(thread)"
                />
                <q-item-label caption class="q-mt-sm">
                  <UserAvatar
                    v-for="(i, index) in thread.participants"
                    :key="i.id"
                    :style="`transform: translateX(-${index * 7}px);`"
                    :user_id="i.id"
                    :size="18"
                    indicator_size="9px"
                  />
                  <span class="q-pl-sm hover-highlight transition unselected">{{ thread.reply_count }} {{ $t('items_talk_message') }}</span>
                </q-item-label>
              </q-item-section>
              <div
                v-if="actived_thread === thread.id"
                class="absolute-full bg-primary op-1"
              ></div>
            </q-item>
            <q-separator v-if="index !== threads.length -1" spaced class="op-3" />
          </template>
        </q-list>
      </q-scroll-area>
    </template>
    <div v-else class="q-space column flex-center">
      <NoItem :content="$t('no_unread_thread')" />
    </div>
  </div>
</template>

<script setup>
import {
  getThreadsByUserTeamID,
  readThread,
  readAllThreads,
} from "src/api/mattermost.js";
import {ref, computed, watch, watchEffect} from "vue";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import UserName from "./user/UserName.vue";
import TimeAgo from "./widgets/TimeAgo.vue";
import { marked } from "marked";
import NoItem from "./widgets/NoItem.vue";
import { mm_wsStore, teamStore } from "src/hooks/global/useStore.js";
import {sync_all_profiles} from "pages/team/hooks/useMattermost";

const emit = defineEmits(["enterThread"]);

const hovered = ref();

const team = computed(() => teamStore.team?.mm_team);
const team_id = computed(() => team.value?.id);
const mm_user_id = computed(() => localStorage.getItem("mmUserId"));

const threadData = ref();
const threads = ref();
const per_page = ref(20);
const unread_count = ref();
const threads_options = ref("");
const getThreads = async (options) => {
  let res = await getThreadsByUserTeamID(
    mm_user_id.value,
    team_id.value,
    options
  );
  if (res) {
    return res.data;
  }
};

const thread = ref();
const thread_post_id = ref();
const thread_channel_id = ref();
const actived_thread = ref();
const getThreadFn = async (i) => {
  i.unread_replies = 0
  actived_thread.value = i.id;
  thread_channel_id.value = i.post.channel_id;
  thread_post_id.value = i.post.id;
  thread.value = {
    thread_channel_id: thread_channel_id.value,
    thread_post_id: thread_post_id.value,
  };
  emit("enterThread", thread.value);
  await readThread(mm_user_id.value, team_id.value, i.id);
  if(unread_count.value > 0){
    unread_count.value = unread_count.value - 1
  }
};

const filter = ref("all");
const filterThreads = ref("all");
const filterThreadsFn = (val) => {
  threads.value = [];
  filter.value = val;
  if (val === "all") {
    threads_options.value = `unread=false&since=0&per_page=${per_page.value}before=&after=&extended=true&deleted=false&totalsOnly=false&threadsOnly=true`;
    process_threads(threads_options.value);
  }
  if (val === "unread") {
    threads_options.value = `unread=true&since=0&per_page=${per_page.value}before=&after=&extended=true&deleted=false&totalsOnly=false&threadsOnly=true`;
    process_threads(threads_options.value);
  }
};

const process_threads = async (options) => {
  threadData.value = await getThreads(options);
  threads.value = threadData.value?.threads;
};

const all_mmUsers = computed(() => {
  const _by_threads = threads.value?.map(i => i.post?.user_id) || [];
  const _by_participants = threads.value?.map(i => i.participants).flat(2)?.map(j => j.id) || [];
  return Array.from(new Set([..._by_threads, ..._by_participants]));
});
const dataReady = ref(false);
watchEffect(async () => {
  if(all_mmUsers.value?.length > 0) {
    await sync_all_profiles(all_mmUsers.value);
    dataReady.value = true
  }
})

watch(
  [team_id, mm_user_id],
  async () => {
    if (team_id.value && mm_user_id.value) {
      await process_threads(threads_options.value);
      unread_count.value = threadData.value?.total_unread_threads
    }
  },
  { immediate: true, deep: false }
);
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      const message = JSON.parse(mm_wsStore.event.data.post);
      const threadsIds =
        (threads.value?.length > 0 && threads.value?.map((i) => i.id)) || [];
      if (threadsIds.includes(message.root_id)) {
        threads.value.find((i) => i.id === message.root_id).reply_count =
          message.reply_count;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
<style scoped></style>
