<template>
  <div class="q-pa-sm">
    <q-card bordered class="transparent">
      <q-card-section class="column gap-xs no-padding text-no-wrap no-wrap">
        <TipTap
          :toolbar_onBottom="true"
          :disable_btn="disable_btn"
          :isMessageInput="true"
          need="md"
          ref="tiptapRef"
          for="chat"
          class="message_sender"
          toolbarClass="radius-bottom-xs"
          :contentChanged="true"
          @ModEnter="sendMsg(msg)"
          @tiptapUpdate="tiptapUpdate"
          @keyup.ctrl.enter="sendMsg(msg)"
        >
          <template v-slot:more_btn>
            <uploadFile
              :channel_id="channel_idRef"
              @fileUploaded="handlerFileUploaded"
              @onUploadProgress="onUploadProgress"
            />
            <q-btn
              flat
              dense
              padding="xs md"
              @click="sendMsg(msg)"
              class="border"
            >
              <q-spinner-dots v-if="loading"
                size="0.7em"
              />
              <q-icon v-else name="send" />
              <q-tooltip class="border text-no-wrap overflow-hidden" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
                CTRL + Enter
              </q-tooltip>
            </q-btn>
          </template>
          <template v-if="files?.length > 0" v-slot:attachments>
            <div class="row no-wrap gap-xs q-ma-xs">
              <q-item v-for="i in files" :key="i.id" class="border radius-xs">
                <q-item-section side>
                  <q-icon name="attach_file" />
                </q-item-section>
                <q-item-section>
                  <div class="column no-wrap gap-xs">
                    <span>{{ i.name }}</span>
                    <span>{{ i.mime_type }}</span>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="close"
                    @click="removeAttachment(i)"
                  />
                </q-item-section>
              </q-item>
            </div>
          </template>
        </TipTap>
      </q-card-section>
      <q-linear-progress
        v-if="progress > 0"
        stripe
        :value="progress"
        color="primary"
      />
    </q-card>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect } from "vue";
import { sendPost } from "src/api/mattermost.js";
import { teamStore } from 'src/hooks/global/useStore'
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import uploadFile from "src/pages/Chat/components/wigets/uploadFile.vue";

import TurndownService from "turndown";

const props = defineProps({
  channel_id: {
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

const channel_idRef = toRef(props, "channel_id");
const thread_post_idRef = toRef(props, "thread_post_id");
const asThreadRef = toRef(props, "asThread");

const disable_btn = ["TaskList", "save"];

const msg = ref("");
const parmars = ref({});
const file_ids = ref([]);

watchEffect(() => {
  parmars.value = {
    channel_id: channel_idRef.value,
    message: msg.value,
    props: {
      strapi_user_id: teamStore.init?.id
    }
  };
  if (asThreadRef.value) {
    parmars.value.root_id = thread_post_idRef.value;
  }
  if (file_ids.value?.length > 0) {
    parmars.value.file_ids = file_ids.value;
  }
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
const sendMsg = async () => {
  if (loading.value) return;
  loading.value = true;
  if (!msg.value && file_ids.value?.length === 0) {
    return;
  }
  const res = await sendPost(parmars.value);
  if (res) {
    msg.value = "";
    tiptapRef.value.clear();
    emit("MsgSend");
    loading.value = false;
    files.value = void 0;
    file_ids.value = void 0;
  }
};
const removeAttachment = (file) => {
  files.value = files.value.filter((i) => i.id !== file.id);
  file_ids.value = file_ids.value.filter((i) => i.id !== file.id);
};

const mmapi = import.meta.env.VITE_MM_API;
const files = ref([]);
const progress = ref(0);
const onUploadProgress = (val) => {
  console.log("onUploadProgress", val);
  progress.value = val / 100;
};
const handlerFileUploaded = (val) => {
  // console.log("收到上传文件信息", val);
  files.value =
    files.value?.length > 0
      ? [...files.value, ...val.file_infos]
      : val.file_infos;
  file_ids.value = files.value.map((i) => i.id);
  progress.value = 0;
  // console.log(file_ids.value);
};
</script>
