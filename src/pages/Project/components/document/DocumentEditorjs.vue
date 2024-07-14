<template>
  <EditorJs
    :readOnly="
      by_info.user_id
        ? false
        : !calc_auth(auth_collection, 'jsonContent', auth_belonged)
    "
    :document="document"
    @documentUpdate="updateDocumentFn"
  />
</template>

<script setup>
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import EditorJs from "src/components/Utilits/editor/EditorJs.vue";
import { toRefs, ref, watchEffect, watch } from "vue";

import { updateDocument } from "src/api/strapi/project.js";
import useUserStore from "src/stores/user.js";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import localforage from "localforage";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
const { userId, me } = useMatedate;
const userStore = useUserStore();
const projectStore = useProjectStore();
const mm_wsStore = useMmws();

const props = defineProps({
  document: {
    type: Object,
    default() {
      return {};
    },
  },
  by_info: {
    type: Object,
    default() {
      return {};
    },
  },
});

const { document, by_info } = toRefs(props);

const auth_collection = ref();
const auth_belonged = ref();

const auth = ref();
watchEffect(() => {
  if (by_info.value.project_id) {
    auth_collection.value = "document";
    auth_belonged.value = "project";
  }
  if (by_info.value.card_id) {
    const card_members = projectStore.card.card_members.map(
      (i) => i.by_user.id
    );
    if (card_members.includes(userId.value)) {
      auth_collection.value = "document";
      auth_belonged.value = "card";
    } else {
      auth_collection.value = "card_document";
      auth_belonged.value = "project";
    }
  }
  if (by_info.value.user_id) {
    auth.value = true;
  }
});

const emit = defineEmits(["documentChanged"]);
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
      chat_Msg.body = `${userStore.me.username}修改了项目：'${projectStore.project.name}'内的文档：'${document.value.title}'的内容`;
    }
    if (by_info.value.card_id) {
      chat_Msg.body = `${userStore.me.username}修改了卡片：'${projectStore.card.name}'内的文档：'${document.value.title}'的内容`;
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
    projectStore.project.project_documents =
      projectStore.project.project_documents.map((i) =>
        i.id === val.id ? val : i
      );
  }
  if (by_info.value.card_id) {
    projectStore.card.card_documents = projectStore.card.card_documents.map(
      (i) => {
        return i.id === val.id ? val : i;
      }
    );
  }
  if (by_info.value.user_id) {
  }
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "document" &&
          strapi.data?.document_id === document.value.id &&
          strapi.data.action === "DocumentContentUpdate"
        ) {
          process_documentContent_change(strapi.data.body);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
