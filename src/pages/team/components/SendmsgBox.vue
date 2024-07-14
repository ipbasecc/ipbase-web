<template>
  <div class="q-pa-sm">
    <q-card bordered class="transparent">
      <q-card-section class="no-padding text-no-wrap no-wrap">
        <TipTap
          :toolbar_onBottom="true"
          :disable_btn="disable_btn"
          need="md"
          ref="tiptapRef"
          @tiptapUpdate="tiptapUpdate"
          @keyup.ctrl.enter="sendMsg(msg)"
        >
          <template v-slot:more_btn>
            <q-space />
            <uploadFile
              :channel_id="channel_id"
              @fileUploaded="handlerFileUploaded"
            />
            <q-btn
              flat
              dense
              padding="xs md"
              icon="send"
              @click="sendMsg(msg)"
              class="border"
            >
              <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-grey-1'">
                <span class="op-5">CTRL + 回车发送</span>
              </q-tooltip>
            </q-btn>
          </template>
        </TipTap>
      </q-card-section>
      <LoadingBlock v-if="showLoading" />
      <slot name="disableTip"></slot>
    </q-card>
  </div>
</template>

<script setup>
import { ref, toRefs, watchEffect, computed } from "vue";
import { sendPost } from "src/api/mattermost.js";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import uploadFile from "src/pages/Chat/components/wigets/uploadFile.vue";
import LoadingBlock from "src/components/VIewComponents/LoadingBlock.vue";

import TurndownService from "turndown";

const props = defineProps({
  channel_id: {
    type: String,
    default: "",
  },
  thread_channel_id: {
    type: String,
    default: "",
  },
  thread_post_id: {
    type: String,
    default: "",
  },
  asThread: {
    type: Boolean,
    default: false,
  },
});

const { channel_id, thread_channel_id, thread_post_id, asThread } =
  toRefs(props);
const disable_btn = ["TaskList", "save"];

const disable = computed(() =>
  !channel_id.value && !thread_channel_id.value && !thread_post_id.value
    ? true
    : false
);

const msg = ref("");
const parmars = ref({});
const file_ids = ref([]);

watchEffect(() => {
  parmars.value = !asThread.value
    ? {
        channel_id: channel_id.value,
        message: msg.value,
      }
    : {
        channel_id: thread_channel_id.value,
        root_id: thread_post_id.value,
        message: msg.value,
      };
});

// turndown 将tipta输出的html转换为markdown，与Mattermost的存储格式保持一致
const turndownService = new TurndownService();

// 定义一个方法，接收 html 字符串作为参数，返回 markdown 字符串
function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}

const tiptapUpdate = async (val) => {
  msg.value = val;
};

const tiptapRef = ref();

const emit = defineEmits(["MsgSend"]);
const loading = ref(false);
const showLoading = ref(false);
const sendMsg = async () => {
  if (loading.value) return;
  loading.value = true;
  if (!msg.value) {
    return;
  }
  if (file_ids.value.length > 0) {
    parmars.value.file_ids = file_ids.value;
  }
  const res = await sendPost(parmars.value);
  if (!res) {
    setTimeout(() => {
      showLoading.value = true;
    }, 1000);
  }
  if (res) {
    msg.value = "";
    tiptapRef.value.clear();
    emit("MsgSend");
    loading.value = false;
    showLoading.value = false;
  }
};

const handlerFileUploaded = (val) => {
  // console.log("收到上传文件信息", val);
  file_ids.value = val.file_infos.map((i) => i.id);
  // console.log(file_ids.value);
};
</script>
