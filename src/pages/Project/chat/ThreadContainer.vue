<template>
  <div
    class="absolute-full column no-wrap overflow-hidden"
    :class="$q.dark.mode ? '' : 'bg-grey-3'"
  >
    <q-toolbar dark class="transparent">
      <q-btn round flat dense size="sm" icon="close" @click="closeThread()" />
    </q-toolbar>
    <ThreadRoot v-if="root_post" :msg="root_post" />
    <q-scroll-area
      v-if="thread"
      v-model="scrollModel"
      class="column no-wrap col-8 relative-position article q-px-lg"
      ref="scrollAreaRef"
      ><q-resize-observer @resize="onResize" />
      <q-infinite-scroll @load="onLoad" reverse :debounce="300" :offset="100">
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
      :thread_channel_id="thread_channel_idRef"
      :thread_post_id="thread_post_idRef"
      :asThread="true"
    />
  </div>
</template>

<script setup>
import { toRef, toRefs, watch, ref, onMounted, nextTick } from "vue";
import SendmsgBox from "src/pages/Chat/components/wigets/SendmsgBox.vue";
import MessageItem from "src/pages/Project/chat/MessageItem.vue";
import ThreadRoot from "src/pages/Project/chat/ThreadRoot.vue";

import useMmws from "src/stores/mmws.js";
import useMmStore from "src/stores/mmstore.js";
import { mergePosts } from "src/hooks/mattermost/useMattermost.js";

import { getThread } from "src/api/mattermost.js";
import { computed } from "vue";

const mm_wsStore = useMmws();
const mmStore = useMmStore();
const props = defineProps({
  thread_channel_id: {
    type: String,
    default: "",
  },
  thread_post_id: {
    type: String,
    default: "",
  },
  asPannel: {
    type: Boolean,
    default: true,
  },
  me_profile: {
    type: Object,
    default() {
      return {};
    },
  },
});

const thread_channel_idRef = toRef(props, "thread_channel_id");
const thread_post_idRef = toRef(props, "thread_post_id");
const { me_profile } = toRefs(props);

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
const root_post = computed(() => thread.value?.posts[thread_post_idRef.value]);

const getThreadFn = async () => {
  if (fromPost.value) {
    options.value = `fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}&perPage=4`;
  } else {
    options.value = `perPage=4`;
  }
  let res = await getThread(thread_post_idRef.value, options.value);
  root_post.value = res?.data?.posts[thread_post_idRef.value];
  if (res) {
    const filterRoot = res.data?.order.filter(
      (i) => i != thread_post_idRef.value
    );
    const reverseOrder = filterRoot?.slice().reverse();
    let createAt_of_Lastpost = reverseOrder[0]?.create_at;
    if (!fromPost.value) {
      thread.value.order = reverseOrder;
      thread.value.posts = res.data?.posts;

      fromPost.value = reverseOrder?.length > 0 && reverseOrder[0];
      fromCreateAt.value = res?.data?.posts[fromPost.value].create_at;
    } else {
      fromPost.value = reverseOrder?.length > 0 && reverseOrder[0];
      fromCreateAt.value =
        (fromPost.value && res?.data?.posts[fromPost.value].create_at) || null;

      if (fromCreateAt.value && createAt_of_Lastpost < fromCreateAt.value) {
        hasMore.value = false;
      } else {
        thread.value.order = [...reverseOrder, ...thread.value?.order];
        thread.value.posts = mergePosts(thread.value?.posts, res.data?.posts);
        hasMore.value = reverseOrder?.length > 0;
      }
    }
  }
};

watch(
  thread_post_idRef,
  () => {
    if (thread_post_idRef.value) {
      getThreadFn();
    }
  },
  { immediate: true, deep: false }
);

const fetchMore = async () => {
  // emit("fetchMore");
  await getThreadFn();
};
async function onLoad(index, done) {
  console.log("onLoad", hasMore.value);
  if (!hasMore.value) {
    done();
    return;
  } else {
    await getThreadFn();
    done();
  }
}
const closeThread = () => {
  mmStore.extend_pannel_target_history = [];
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
  //   if (scrollAreaRef.value) {
  //   }
  console.log("scroll_bottom");
  scroll_bottom();
});

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      const message = JSON.parse(mm_wsStore.event.data.post);

      if (message.root_id === thread_post_idRef.value) {
        thread.value.order = [...thread.value.order, message.id];
        const post = {};
        post[message.id] = message;
        console.log(post);
        thread.value.posts = mergePosts(thread.value.posts, post);
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
