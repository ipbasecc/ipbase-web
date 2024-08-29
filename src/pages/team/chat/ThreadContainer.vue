<template>
  <div
    class="fit column no-wrap overflow-hidden"
    :class="$q.dark.mode ? 'bg-darker text-grey-1' : 'bg-grey-1 text-grey-10'"
  >
    <q-bar
      v-if="showToolbar"
      dark
      class="transparent"
      :class="showRootpost ? '' : 'border-bottom'"
      style="height: 2.3rem"
    >
      <q-btn
        round
        flat
        dense
        size="sm"
        :icon="$q.screen.gt.xs ? 'close' : 'mdi-chevron-left'"
        @click="closeThread()"
      />
    </q-bar>
    <ThreadRoot
      v-if="root_post && showRootpost"
      :msg="root_post"
      :class="showToolbar ? '' : 'q-pt-lg'"
    />
    <q-scroll-area
      v-if="thread"
      v-model="scrollModel"
      class="column no-wrap relative-position article q-px-xs"
      :class="fullHeight ? 'q-space' : 'col-8'"
      ref="scrollAreaRef"
      ><q-resize-observer @resize="onResize" />
      <q-infinite-scroll
        @load="onLoad"
        reverse
        :debounce="300"
        :offset="100"
        :disable="!hasMore"
      >
        <div class="column no-wrap relative-position article">
          <template v-for="(i, index) in thread.order" :key="i">
            <MessageItem
              :msg="thread.posts[i]"
              :index="index"
              :prev="thread.posts[thread.order[index - 1]]"
              :MsgOnly="true"
              container="thread"
            />
          </template>
        </div>
      </q-infinite-scroll>
    </q-scroll-area>
    <SendmsgBox
      :channel_id="chatInfo.mm_channel_id"
      :thread_post_id="chatInfo.post_id"
      :asThread="true"
    />
  </div>
</template>

<script setup>
import { toRefs, watch, ref, onMounted, computed } from "vue";
import MessageItem from "./MessageItem.vue";
import ThreadRoot from "./ThreadRoot.vue";

import { mergePosts } from "src/hooks/mattermost/useMattermost.js";
import { getThread } from "src/api/mattermost.js";
import { mmstore, mm_wsStore } from "src/hooks/global/useStore.js";
import SendmsgBox from './SendmsgBox.vue'

const props = defineProps({
  chatInfo: {
    type: Object,
    default: null,
  },
  showRootpost: {
    type: Boolean,
    default: true,
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
  fullHeight: {
    type: Boolean,
    default: true,
  },
});
const { chatInfo } = toRefs(props);
const thread_post_idRef = computed(() => chatInfo.value?.post_id);

const emit = defineEmits(["fetchMore", "closeThread"]);

const thread = ref({
  order: [],
  posts: {},
});
const options = ref();
const page = ref(0);
const fromPost = ref();
const fromCreateAt = ref();
const hasMore = ref(true);
const root_post = ref();

const loading = ref(false);
const getThreadFn = async () => {
  if (loading.value) return;
  loading.value = true;
  if (fromPost.value) {
    options.value = `fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}&perPage=48`;
  } else {
    options.value = `perPage=48`;
  }
  let res = await getThread(thread_post_idRef.value, options.value);
  if (res) {
    // 赋值根post
    root_post.value = res.data?.posts[thread_post_idRef.value];
    // 从获取到的数据中，去除根post，获取threads分页数据时，每页都会返回根post，这里第一时间将其去除
    const filterRoot = res.data?.order.filter(
      (i) => i !== thread_post_idRef.value
    );
    // 如果去除根post后没有其它post了，说明没有更多消息了
    if (filterRoot?.length === 0) {
      hasMore.value = false;
      return;
    }
    // 排序数组反向
    const reverseOrder = filterRoot?.slice().reverse();
    // 反向order后，数组第一个对应的post的创建时间，赋值给 createAt_of_Lastpost
    let createAt_of_Lastpost = res.data?.posts[reverseOrder[0]]?.create_at;
    // 如果没有fromPost参数，说明是第一次请求数据，直接赋值，并更新fromPost和fromCreatAt

    if (!fromPost.value) {
      thread.value.order = reverseOrder;
      thread.value.posts = res.data?.posts;

      fromPost.value = reverseOrder?.length > 0 ? reverseOrder[0] : null;
      fromCreateAt.value = res?.data?.posts[fromPost.value]?.create_at;
    } else {
      fromPost.value = reverseOrder?.length > 0 ? reverseOrder[0] : null;
      fromCreateAt.value = fromPost.value
        ? res?.data?.posts[fromPost.value]?.create_at
        : null;
      if (fromCreateAt.value && createAt_of_Lastpost < fromCreateAt.value) {
        hasMore.value = false;
      } else {
        thread.value.order = [...reverseOrder, ...thread.value?.order];
        thread.value.posts = mergePosts(thread.value?.posts, res.data?.posts);
        hasMore.value = reverseOrder?.length > 0;
      }
    }
    loading.value = false;
  }
};

const reset = () => {
  root_post.value = void 0;
  hasMore.value = true;
  fromPost.value = void 0;
  thread.value = {
    order: [],
    posts: {},
  };
  loading.value = false;
};
watch(
  thread_post_idRef,
  async () => {
    if (thread_post_idRef.value) {
      reset();
      await getThreadFn();
    }
  },
  { immediate: true, deep: false }
);

const fetchMore = async () => {
  // emit("fetchMore");
  await getThreadFn();
};
async function onLoad(index, done) {
  if (!hasMore.value) {
    done();
  } else {
    await getThreadFn();
    done();
  }
}
const closeThread = () => {
  mmstore.extend_pannel_target_history = [];
  emit("closeThread");
};

const scroolContainer = ref();
const onResize = (size) => {
  scroolContainer.value = size;
};

const scrollModel = ref(100);
const scrollAreaRef = ref();
const scroll_bottom = () => {
  scrollAreaRef.value?.setScrollPosition(
    "vertical",
    scroolContainer.value.height,
    300
  );
};
onMounted(() => {
  scroll_bottom();
});

watch(
  mm_wsStore,
  async () => {
    // console.log("mm_wsStore.event", mm_wsStore.event);
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      const message = JSON.parse(mm_wsStore.event.data.post);
      // console.log("message.event", message);
      if (message.root_id === thread_post_idRef.value) {
        thread.value.order = [...thread.value.order, message.id];
        const post = {};
        post[message.id] = message;
        // console.log(post);
        thread.value.posts = mergePosts(thread.value.posts, post);
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
