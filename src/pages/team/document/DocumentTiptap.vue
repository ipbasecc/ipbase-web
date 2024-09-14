<template>
  <TipTap
    v-if="by_info && document"
    :key="document.id"
    :jsonContent="document.jsonContent"
    :editable="
      !teamStore.shareInfo &&
      (by_info.user_id ||
        useAuths('jsonContent', ['card', 'card_document']))
    "
    :need="'json'"
    :square="true"
    :withSaveBtb="true"
    :withImageBtb="true"
    :contentStyle="contentStyle"
    class="items-center"
    @tiptapUpdate="tiptapUpdate"
    @tiptapBlur="tiptapBlur"
  >
    <template v-if="showClose" v-slot:left-btn>
      <q-btn dense flat icon="mdi-chevron-left" @click="close" />
    </template>
  </TipTap>
</template>

<script setup>
import {computed, ref, toRefs, watch, watchEffect, onBeforeUnmount} from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";

import {updateDocument} from "src/api/strapi/project.js";
import {send_MattersMsg} from "src/pages/team/hooks/useSendmsg.js";
import localforage from "localforage";
import {mm_wsStore, teamStore, userStore} from "src/hooks/global/useStore.js";
import {isEqual} from "lodash-es";
import {i18n} from 'src/boot/i18n.js';

const $t = i18n.global.t;

const userId = computed(() => teamStore.init?.id);
const props = defineProps({
  by_info: {
    type: Object,
    default: null,
  },
  contentStyle: {
    type: String,
    default: 'max-height: unset;',
  },
  showClose: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
}
const { by_info } = toRefs(props);
const document = ref(null);
watchEffect(() => {
  document.value = teamStore.active_document;
})

const updateChatMsg = ref({});
const jsonContent = ref({});
const updateDocumentFn = async () => {
  if (!jsonContent.value) return;
  const isChanged = !isEqual(document.value.jsonContent, jsonContent.value);
  // console.log("isChanged", isChanged);
  if (!isChanged) return;
  let params = {
    document_id: document.value.id,
    data: {
      jsonContent: jsonContent.value,
    },
  };
  if (by_info.value.project_id) {
    params.project_id = by_info.value.project_id;
  }
  if (by_info.value.card_id) {
    params.card_id = by_info.value.card_id;
  }
  if (by_info.value.user_id) {
    params.user_id = by_info.value.user_id;
  }

  let res = await updateDocument(document.value.id, params);
  if (res) {
    teamStore.active_document.jsonContent = res.data.jsonContent;
    updateChatMsg.value = {
      props: {
        strapi: {
          data: {
            is: "document",
            action: "DocumentContentUpdate",
            document_id: document.value.id,
            by_user: userId.value,
            body: res.data,
          },
        },
      },
    };

    if (by_info.value.project_id) {
      updateChatMsg.value.body = `${userStore.me.username} ${$t('changed_project_props')}'${teamStore.project.name}' ${$t('inner_document')}'${document.value.title}' ${$t('of_content')}`;
      await send_chat_Msg(updateChatMsg.value);
    }
    if (by_info.value.card_id) {
      updateChatMsg.value.body = `${userStore.me.username} ${$t('changed_card_props')}'${teamStore.card.name}' ${$t('inner_document')}'${document.value.title}'${document.value.title}' ${$t('of_content')}`;
    }
    if (by_info.value.user_id) {
      process_documentContent_change(res.data);
    }
    setTimeout(() => {
      localforage.removeItem(`__document_${document.value.id}`);
    }, 3000);
  }
};

const count = ref(15);
let intervalId = null;
const startCountdown = () => {
  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      await updateDocumentFn();
    }
  }, 1000);
};

const tiptapUpdate = async (val) => {
  jsonContent.value = val;
  count.value = 15;
  startCountdown();
};
const tiptapBlur = async (val) => {
  jsonContent.value = val;
  await updateDocumentFn(val);
};
onBeforeUnmount(async() => {
  if(updateChatMsg.value){
    await send_chat_Msg(updateChatMsg.value);
  }
});
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
  updateChatMsg.value = null;
};

const process_documentContent_change = (val) => {
  // console.log("val", val);
  if (by_info.value.project_id) {
    teamStore.project.project_documents =
      teamStore.project.project_documents.map((i) =>
        i.id === val.id ? val : i
      );
  }
  if (by_info.value.card_id) {
    teamStore.card.card_documents = teamStore.card.card_documents.map((i) => {
      return i.id === val.id ? val : i;
    });
  }
  if (by_info.value.user_id) {
  }
};
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "thread_updated") {
      const _thread = JSON.parse(mm_wsStore.event.data.thread);
      // console.log("message.event", message);
      if (_thread.id === document.value?.mm_thread?.id) {
        document.value.mm_thread = _thread;
        const _params = {
          data: {
            mm_thread: _thread,
          },
        };
        console.log("updateDocument");
        await updateDocument(document.value.id, _params);
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
