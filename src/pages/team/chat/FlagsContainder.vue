<template>
  <div
    class="fit column no-wrap"
    :class="$q.dark.mode ? 'bg-grey-10' : 'bg-grey-1'"
  >
    <q-bar
      v-if="!headerless"
      class="border-bottom"
      :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
      style="height: 40px"
    >
      <span class="font-medium">{{ $t('favorited_message') }}：{{ hasMore_thread_Msgs }}</span>
    </q-bar>
    <q-scroll-area v-if="flaggeds?.length > 0" class="q-space">
      <q-pull-to-refresh @refresh="fetchMore_flaggedsFn" color="primary">
        <div
          v-for="(i, index) in flaggeds"
          :key="i.id"
          class="relative-position mm_message transition cursor-pointer article"
        >
          <MessageItem
            :msg="i"
            :prev="(index > 0 && flaggeds[index - 1]) || null"
            :index="index"
            :asCtx="false"
            container="flagged"
            :MsgOnly="true"
            @toggle_flagged="toggle_flagged"
          />
        </div>
        <div
          v-if="hasMore_thread_Msgs"
          class="full-width flex flex-center"
        >
          <q-btn
            color="primary"
            flat
            dense
            size="sm"
            padding="xs md"
            :label="$t('load_more')"
            @click="fetchMore_flaggeds"
          />
        </div>
      </q-pull-to-refresh>
    </q-scroll-area>
    <div v-else class="q-space column flex-center">
      <span>{{ $t('no_favorited_message') }}!</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import MessageItem from "./MessageItem.vue";

import {
  getFlagged,
  getUsersByIDs,
  getUserStatusBy_ids,
} from "src/api/mattermost.js";

import { mmUser, mm_wsStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const props = defineProps({
  headerless: {
    type: Boolean,
    default: false,
  },
});

const uid = ref(localStorage.getItem("mmUserId"));

const flaggeds = ref();
const page = ref(0);
const per_page = ref(60);
const options = ref(`page=${page.value}&per_page=${per_page.value}`);

const hasMore_thread_Msgs = ref();
const getFlaggedsFn = async () => {
  let res = await getFlagged(uid.value, options.value);

  const motify_flaggeds = async (val) => {
    let obj = val.data;
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
        let arr = new_array;
        let resps = await getUsersByIDs([
          ...new Set(arr.map((i) => i.user_id)),
        ]);
        let _status = await getUserStatusBy_ids([
          ...new Set(arr.map((i) => i.user_id)),
        ]);
        if (resps && _status) {
          for (let post of arr) {
            post.profile = resps.data.find((i) => i.id === post.user_id);
            post.profile.status = _status.find(
              (i) => i.user_id === post.user_id
            );
          }
        }
        flaggeds.value = arr;
        // console.log(new_array);
        mmUser.flaggeds = flaggeds.value;
      }
    }
  };

  console.log('getFlaggedsFn', res)
  if (res && res.data && res.data.order.length > 0) {
    hasMore_thread_Msgs.value = res.data.order.length === per_page.value;
    await motify_flaggeds(res);
  }
  return flaggeds.value;
};
getFlaggedsFn();

import { useQuasar } from "quasar";
const $q = useQuasar();
// 下拉获取更多数据时需要传递done参数，否者插件状态不能更新导致bug，
// 但是直接直接会报done非function错误，因此拆成两份，下拉刷新时给done反馈，直接点按钮时执行function本身;
const fetchMore_flaggedsFn = async (done) => {
  await fetchMore_flaggeds();
  done();
};
const fetchMore_flaggeds = async () => {
  if (!hasMore_thread_Msgs.value) {
    $q.notify({
      message: $t('no_more_message'),
      position: "top",
    });
    return;
  }
  page.value++;
  options.value = `page=${page.value}&per_page=60`;

  let old_flaggeds = flaggeds.value;
  let new_flaggeds = await getFlaggedsFn();
  flaggeds.value = [...old_flaggeds, ...new_flaggeds];
};

const toggle_flagged = (val) => {
  const { action, flag } = val;
  if(action === 'add'){
    flaggeds.value.push(flag);
    // console.log(new_array);
    mmUser.flaggeds = flaggeds.value;
  }
  if(action === 'remove'){
    flaggeds.value = flaggeds.value.filter((i) => i.id !== flag.id);
    // console.log(new_array);
    mmUser.flaggeds = flaggeds.value;
  }
}

//监听wss获取新消息
watch(
  mm_wsStore,
  () => {
    if (
      mm_wsStore?.event?.event === "preferences_changed" ||
      mm_wsStore?.event?.event === "preferences_deleted"
    ) {
      getFlaggedsFn();
    }
  },
  { immediate: true, deep: true }
);
</script>
