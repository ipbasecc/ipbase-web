<template>
  <q-scroll-area
    v-if="channel_idRef"
    v-model="scrollModel"
    :class="$q.dark.mode ? '' : 'bg-grey-2'"
    :thumb-style="thumbStyle"
    :bar-style="barStyle"
    class="fit q-pb-lg"
    ref="scrollAreaRef"
  >
    <q-infinite-scroll
      v-if="messages"
      :key="channel_idRef"
      @load="fetchMore_messages"
      reverse
      class="q-pt-xl"
    >
      <q-resize-observer @resize="onResize" />
      <div
        v-for="(i, index) in messages_arr.filter((i) => !i.root_id)"
        :key="i.id"
        :class="`${mmStore.actived_thread === i.id ? 'bg-message' : ''}${
          i.type === '' ? ' mm_message transition cursor-pointer' : ''
        }`"
        class="relative-position"
      >
        <MessageItem
          :msg="i"
          :prev="messages[index - 1]"
          :index="index"
          :inThread="false"
          :container="'channel'"
        />
      </div>
    </q-infinite-scroll>
    <q-btn
      color="primary"
      icon="check"
      no-caps
      label="fetchMore_messages"
      @click="fetchMore_messages"
    />
  </q-scroll-area>
</template>

<script setup>
import { onBeforeMount, ref, toRef, watch, computed } from "vue";
import { useQuasar } from "quasar";

import MessageItem from "src/pages/Chat/components/MessageItem.vue";
import {
  getPostsOfChannel,
  getUserStatus,
  getUser,
  getUsersByIDs,
  getUserStatusBy_ids,
  getThreadsByUserTeamID,
} from "src/api/mattermost.js";

import useMmStore from "src/stores/mmstore.js";
import useMmws from "src/stores/mmws.js";
const mmStore = useMmStore();
const mm_wsStore = useMmws();

const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
});
const channel_idRef = toRef(props, "channel_id");
const team_id = computed(() => mmStore.current_team_id);

const threads_ids = ref();
const options = ref("");
const page = ref(0);
const per_page = ref(30);
const messages = ref([]);
const messages_arr = ref([]);
const prev_post_id = ref("watting_for_fetched_to_fill");
const getMessages = async () => {
  options.value = `page=${page.value}&per_page=${per_page.value}`;
  // 附加用户资料 - 头像、名字等
  const attach_profile = async (val) => {
    let arr = val;
    let resps = await getUsersByIDs([...new Set(arr.map((i) => i.user_id))]);
    let _status = await getUserStatusBy_ids([
      ...new Set(arr.map((i) => i.user_id)),
    ]);
    if (resps && _status) {
      for (let user of arr) {
        user.profile = resps.data.find((i) => i.id === user.user_id);
        user.profile.status = _status.find((i) => i.user_id === user.user_id);
      }
    }
    return arr;
  };

  const res = await getPostsOfChannel(channel_idRef.value, options.value);
  if (res) {
    let obj = res.data;
    prev_post_id.value = obj.prev_post_id;
    if (obj.order.length == 0) return;
    // 定义一个空数组来存储新的数组
    let new_array = [];

    // 遍历obj.order数组，对于每个元素，获取其对应的key值
    for (let element of obj.order) {
      let key = element;
      // 如果obj.posts中存在该key值，获取其对应的value内容
      if (obj.posts.hasOwnProperty(key)) {
        let value = obj.posts[key];
        // 将value内容添加到new_array数组中
        new_array.push(value);
      }
      if (obj.order.length === new_array.length) {
        let arr = new_array.slice().reverse();
        // let before = messages.value?.length > 0 && messages.value[0].id;
        // options.value = `before=${before}`;
        let _attach = await attach_profile(arr);
        if (_attach) {
          // console.log(messages.value);
          let myid = localStorage.getItem("mmUserId");
          let since = Math.min(new_array[new_array.length - 1].create_at);
          let threads_parmars = `&since=${since}&page=${page.value}&per_page=30&threadsOnly=true&extended=falsetotalsOnly=true`;
          let threads_ids = await getThreadsByUserTeamID(
            myid,
            team_id.value,
            threads_parmars
          );
          if (threads_ids) {
            threads_ids.value = threads_ids;
          }
          // console.log(threads_ids.value);
          messages.value = arr;
        }
      }
    }
  }
};
watch(
  [channel_idRef, team_id],
  () => {
    if (channel_idRef.value && team_id.value) {
      // console.log(channel_idRef.value);
      getMessages();
    }
  },
  { immediate: true, deep: false }
);

const hasMore = ref(false);
const fetchMore_messages = async (index, done) => {
  // if(!hasMore.value) return
  page.value++;
  options.value = `page=${page.value}&per_page=${per_page.value}`;
  let res = await getMessages();
  if (res) {
    // 结束无限滚动事件，必须添加，不然会一直触发此事件
    done();
  }
};

watch(
  messages,
  (cur, prev) => {
    if (cur != prev && messages.value?.length > 0) {
      messages_arr.value = [...messages.value, ...messages_arr.value];
    }
  },
  { immediate: false, deep: true }
);

const $q = useQuasar();
watch(
  prev_post_id,
  () => {
    if (!prev_post_id.value && messages_arr.value.length > per_page.value) {
      hasMore.value = false;
      $q.notify({
        message: "没有更多消息了",
        position: "top",
      });
    } else {
      hasMore.value = true;
    }
  },
  { immediate: false, deep: true }
);

//监听wss获取新消息
watch(
  mm_wsStore,
  async () => {
    // console.log('get ws');
    // 判断消息类型
    if (mm_wsStore?.event?.event === "posted") {
      // {
      //     "event": "posted",
      //     "data": {
      //         "channel_display_name": "公共频道",
      //         "channel_name": "town-square",
      //         "channel_type": "O",
      //         "post": "{\"id\":\"c159y9rt3igp8b7pictmzxppto\",\"create_at\":1698913617586,\"update_at\":1698913617586,\"edit_at\":0,\"delete_at\":0,\"is_pinned\":false,\"user_id\":\"5cyfjgex8fbjbq8te54qhkm79h\",\"channel_id\":\"e9kb5nimrjyoimmmmgzsbuetxw\",\"root_id\":\"\",\"original_id\":\"\",\"message\":\"ahahahah\",\"type\":\"\",\"props\":{},\"hashtags\":\"\",\"pending_post_id\":\"\",\"reply_count\":0,\"last_reply_at\":0,\"participants\":null,\"metadata\":{}}",
      //         "sender_name": "@jerr",
      //         "set_online": true,
      //         "team_id": "ingwc3g1njru8ka318z4azooah"
      //     },
      //     "broadcast": {
      //         "omit_users": null,
      //         "user_id": "",
      //         "channel_id": "e9kb5nimrjyoimmmmgzsbuetxw",
      //         "team_id": "",
      //         "connection_id": "",
      //         "omit_connection_id": ""
      //     },
      //     "seq": 1
      // }
      // 如果是新消息事件，获取消息内容和频道ID
      const message = JSON.parse(mm_wsStore.event.data.post);
      const channelId = message.channel_id;

      // 判断是否是您关注的频道
      if (channelId === channel_idRef.value) {
        // console.log('ready for view');
        let profile = await getUser(message.user_id);
        if (profile) {
          message.profile = profile.data;
          let status = await getUserStatus(message.user_id);
          if (status) {
            message.profile.status = status;
            messages_arr.value = [...messages_arr.value, message];
            scroll_bottom();
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);

const scrollModel = ref(100);
const scrollAreaRef = ref();

const view_box = ref();
const onResize = (size) => {
  view_box.value = size;
};

const scroll_bottom = () => {
  scrollAreaRef.value.setScrollPosition(
    "vertical",
    view_box.value?.height,
    300
  );
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
onBeforeMount(() => {
  messages.value = null;
});
</script>

<style lang="scss" scoped></style>
