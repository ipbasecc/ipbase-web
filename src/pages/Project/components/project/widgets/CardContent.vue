<template>
  <div
    :class="
      calc_auth('overview', 'jsonContent', authBase.of)
        ? 'border radius-sm'
        : ''
    "
  >
    <TipTap
      v-if="calc_auth('overview', 'jsonContent', authBase.of)"
      :jsonContent="jsonContent"
      :editable="true"
      square
      :need="'json'"
      :clickOutsideSave="true"
      styleClass="q-pa-md"
      @tiptapBlur="tiptapBlur"
    />
    <TipTap
      v-else-if="!isEmpty()"
      :jsonContent="jsonContent"
      :editable="false"
      square
      :need="'json'"
      :clickOutsideSave="false"
      styleClass="q-pa-md"
    />
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect, computed } from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";

import _ from "lodash";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
const { userId, me } = useMatedate;

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
});
const wasAttached_toRef = toRef(props, "wasAttached_to");
const belonged = ref();

const authBase = computed(() => {
  let res;
  let isInCard;
  if (projectStore.card) {
    const members = projectStore.card.card_members.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "card",
      of: "project",
    };
  }
  return res;
});

const projectStore = useProjectStore();
const userStore = useUserStore();

const jsonContent = ref();
const baseContent = { type: "doc", content: [{ type: "paragraph" }] };

const isEmpty = () => {
  return _.isEqual(jsonContent.value, baseContent);
};
watchEffect(() => {
  jsonContent.value =
    wasAttached_toRef.value == "project" && projectStore?.project
      ? projectStore.project?.jsonContent
      : projectStore.card?.jsonContent;
  belonged.value =
    wasAttached_toRef.value === "project"
      ? projectStore.project
      : projectStore.card;
});

// watch(projectStore, () => {
//   if(wasAttached_toRef.value == 'card') {
//     jsonContent.value = projectStore.project?.jsonContent
//   }
// })

const change_ing = ref(false);

const tiptapBlur = async (val) => {
  if (change_ing.value) {
    setTimeout(() => {
      tiptapBlur(val);
    }, 1500);
  } else {
    await update_jsonContent(val);
  }
};

const update_jsonContent = async (val) => {
  change_ing.value = true;
  let res;
  if (wasAttached_toRef.value === "project") {
    let params = {
      jsonContent: val,
    };
    res = await updateProject(projectStore.project.id, params);
    if (res) {
      // projectStore.project.jsonContent = res.data.jsonContent;
      change_ing.value = false;
      let chat_Msg = {
        body: `${userStore.me.username}修改了项目'封面文档''`,
        props: {
          strapi: {
            data: {
              is: "project",
              by_user: userStore.userId,
              project_id: belonged.value.id,
              action: "change_project_content",
              body: res.data.jsonContent,
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    }
  }
  if (wasAttached_toRef.value === "card") {
    let update_params = {
      project_id: projectStore.project.id,
      data: {
        jsonContent: val,
      },
    };
    console.log(update_params);
    res = await updateCard(projectStore.card.id, update_params);
    if (res) {
      // projectStore.card.jsonContent = res.data.jsonContent;
      change_ing.value = false;
      let chat_Msg = {
        body: `${userStore.me.username}修改了卡片内容`,
        props: {
          strapi: {
            data: {
              is: "card",
              by_user: userStore.userId,
              card_id: belonged.value.id,
              action: "change_card_content",
              body: res.data.jsonContent,
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    }
  }
};
const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};
</script>
