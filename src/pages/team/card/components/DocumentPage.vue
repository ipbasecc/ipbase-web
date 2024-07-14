<template>
  <TipTap
    v-if="current_documentRef"
    :jsonContent="current_documentRef?.jsonContent"
    :editable="true"
    square
    need="json"
    styleClass="q-pa-md"
    class="fit"
    @tiptapBlur="updateDocumentFn"
    @click.stop="content_channging = true"
    @keydown.esc="content_channging = false"
  />
</template>

<script setup>
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { toRef, ref } from "vue";

import { updateDocument } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  current_document: {
    type: Object,
    default() {
      return {};
    },
  },
});

const current_documentRef = toRef(props, "current_document");
const content_channging = ref(false);

const emit = defineEmits(["documentChanged"]);
const updateDocumentFn = async (val) => {
  if (!val) return;
  let params = {
    project_id: teamStore.project.id,
    document_id: current_documentRef.value.id,
    card_id: teamStore.card.id,
    data: {
      jsonContent: val,
    },
  };
  let res = await updateDocument(current_documentRef.value.id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}修改了卡片：'${teamStore.card.name}'内的文档：'${current_documentRef.value.title}'的内容`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: teamStore.card.id,
            action: "card_motifyDocumentContent",
            document_id: current_documentRef.value.id,
            jsonContent: res.data.jsonContent,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};
const send_chat_Msg = (MsgContent) => {
  send_MattersMsg(MsgContent);
};
</script>

<style lang="scss" scoped></style>
