<template>
  <TipTap
    v-if="by_info && document"
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
  </TipTap>
</template>

<script setup>
import { toRefs, ref, watchEffect, watch, computed, onBeforeUnmount } from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";

import { updateDocument } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import localforage from "localforage";
import { userStore, teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
import { isEqual } from "lodash-es";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const userId = computed(() => teamStore.init?.id);
const props = defineProps({
  document: {
    type: Object,
    default() {
      return {};
    },
  },
  by_info: {
    type: Object,
    default: null,
  },
  contentStyle: {
    type: String,
    default: 'max-height: unset;',
  },
});

const { document, by_info } = toRefs(props);

let updateChatMsg = void 0;
let jsonContent = void 0;
const updateDocumentFn = async () => {
  if (!jsonContent) return;
  const isChanged = !isEqual(document.value.jsonContent, jsonContent);
  // console.log("isChanged", isChanged);
  if (!isChanged) return;
  let params = {
    document_id: document.value.id,
    data: {
      jsonContent: jsonContent,
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
    updateChatMsg = {
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
      updateChatMsg.body = `${userStore.me.username} ${$t('changed_project_props')}'${teamStore.project.name}' ${$t('inner_document')}'${document.value.title}' ${$t('of_content')}`;
    }
    if (by_info.value.card_id) {
      updateChatMsg.body = `${userStore.me.username} ${$t('changed_card_props')}'${teamStore.card.name}' ${$t('inner_document')}'${document.value.title}'${document.value.title}' ${$t('of_content')}`;
    }
    if (by_info.value.user_id) {
      process_documentContent_change(res.data);
    }
    setTimeout(() => {
      localforage.removeItem(`__document_${document.value.id}`);
    }, 3000);
  }
};
onBeforeUnmount(() => {
  send_chat_Msg(updateChatMsg);
});

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
  jsonContent = val;
  count.value = 15;
  startCountdown();
};
const tiptapBlur = async (val) => {
  jsonContent = val;
  await updateDocumentFn(val);
};
const send_chat_Msg = (MsgContent) => {
  send_MattersMsg(MsgContent);
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
