<template>
  <div
    class="fit column no-warp"
    :class="$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'"
  >
    <q-toolbar
      class="transparent border-bottom"
      :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
    >
      <q-btn
          flat
          dense
          size="sm"
          icon="mdi-chevron-left"
          :color="$q.dark.mode ? 'white' : 'black'"
          @click="closePinned()"
      />
      <span class="font-large unselected q-ml-sm">置顶的消息：</span>
    </q-toolbar>
    <q-scroll-area class="q-space">
      <div
        v-for="(i, index) in pinneds"
        :key="i.id"
        class="relative-position mm_message transition cursor-pointer"
      >
        <MessageItem
          :msg="i"
          :prev="(index > 0 && pinneds[index - 1]) || null"
          :index="index"
          :asCtx="false"
          :MsgOnly="true"
          :container="'pinned'"
        />
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import {ref, toRef, watch} from "vue";
import {getPinneds, getUsersByIDs, getUserStatusBy_ids,} from "src/api/mattermost.js";

import MessageItem from "src/pages/team/chat/MessageItem.vue";

import useMmUserStore from "src/stores/mmuser.js";
import useMmws from "src/stores/mmws.js";

const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(['closePinned'])
const channel_idRef = toRef(props, "channel_id");

const mm_wsStore = useMmws();
const mmUserStore = useMmUserStore();

const pinneds = ref();
const getPinnedsFn = async () => {
  let res = await getPinneds(channel_idRef.value);

  const motify_pinneds = async (res) => {
    console.log("motify_pinneds");
    let obj = res.data;
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
        pinneds.value = arr;
        console.log(new_array);
        mmUserStore.pinneds = pinneds.value;
      }
    }
  };

  if (res) {
    if (res.data && res.data.order.length > 0) {
      motify_pinneds(res);
    } else {
      pinneds.value = [];
    }
  }
};
getPinnedsFn();

const closePinned = () => {
  emit('closePinned')
}

watch(
  mm_wsStore,
  () => {
    if (mm_wsStore.event.event === "post_edited") {
      setTimeout(() => {
        getPinnedsFn();
      }, 300);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
