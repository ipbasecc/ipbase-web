<template>
  <EditorJs
    v-if="_by_info && document"
    :readOnly="
      teamStore.shareInfo || (by_info.user_id && !calc_auth(auth_collection, 'modify', auth_belonged))
    "
    :key="document.id"
    :document="document"
    @documentUpdate="updateDocumentFn"
  />
</template>

<script setup>
import EditorJs from "src/components/Utilits/editor/EditorJs.vue";
import { toRefs, ref, watchEffect, watch, computed } from "vue";

import { updateDocument } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import localforage from "localforage";
import { userStore, teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
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
});

const { document, by_info } = toRefs(props);
const _by_info = ref();
watchEffect(() => {});

const auth_collection = ref();
const auth_belonged = ref();

const auth = ref();
watchEffect(() => {
  if (by_info.value) {
    _by_info.value = by_info.value;
  }
  if (_by_info.value.by === "project") {
    if (!_by_info.value.project_id) {
      _by_info.value.project_id = teamStore?.project?.id;
    }
    auth_collection.value = "document";
    auth_belonged.value = "project";
  }
  if (_by_info.value.by === "card") {
    if (!_by_info.value.card_id) {
      _by_info.value.card_id = teamStore?.card?.id;
    }
    const card_members = teamStore.card.card_members?.map((i) => i.by_user.id);
    if (card_members?.includes(userId.value)) {
      auth_collection.value = "document";
      auth_belonged.value = "card";
    } else {
      auth_collection.value = "card_document";
      auth_belonged.value = "project";
    }
  }
  if (_by_info.value.user_id) {
    auth.value = true;
  }
});

const updateDocumentFn = async (val) => {
  if (!val) return;
  let params = {
    document_id: document.value.id,
    data: {
      jsonContent: val,
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
    let chat_Msg = {
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
      chat_Msg.body = `${userStore.me.username}修改了项目：'${teamStore.project.name}'内的文档：'${document.value.title}'的内容`;
    }
    if (by_info.value.card_id) {
      chat_Msg.body = `${userStore.me.username}修改了卡片：'${teamStore.card.name}'内的文档：'${document.value.title}'的内容`;
    }
    if (by_info.value.user_id) {
      process_documentContent_change(res.data);
    }
    send_chat_Msg(chat_Msg);
    setTimeout(() => {
      localforage.removeItem(`__document_${document.value.id}`);
    }, 3000);
  }
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
