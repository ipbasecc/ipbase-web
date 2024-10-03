<template>
  <TipTap
    v-if="contentAuth || teamStore.shareInfo"
    :jsonContent="jsonContent"
    :editable="contentAuth && !teamStore.shareInfo"
    square
    :need="'json'"
    :clickOutsideSave="true"
    :class="
      contentAuth
      ? 'border radius-sm overflow-hidden '
        : 'overflow-hidden'
    "
    contentStyle="height: 100%"
    :styleClass="teamStore.shareInfo ? 'q-px-sm' : 'q-pa-md'"
    @tiptapBlur="tiptapBlur"
  />
<!--  {{teamStore.card?.jsonContent}}-->
</template>

<script setup>
import { ref, toRef, watchEffect, computed } from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import { isEqual } from "lodash-es";
import { userStore, uiStore, teamStore } from "src/hooks/global/useStore.js";
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
  contentAuth: {
    type: Boolean,
    default: void 0,
  }
});
const wasAttached_toRef = toRef(props, "wasAttached_to");
const isShared = computed(() => uiStore.isShared)
const belonged = ref();

const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card && !isShared.value) {
    const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
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

const jsonContent = ref();
const baseContent = { type: "doc", content: [{ type: "paragraph" }] };

const isEmpty = () => {
  return isEqual(jsonContent.value, baseContent);
};
watchEffect(() => {
  if(teamStore.shareInfo) {
    jsonContent.value =teamStore.card?.jsonContent;
    belonged.value = teamStore.card;
  } else {
    jsonContent.value =
      wasAttached_toRef.value === "project" && teamStore?.project
        ? teamStore.project?.jsonContent
        : teamStore.card?.jsonContent;
    belonged.value =
      wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card;
  }
});

// watch(teamStore, () => {
//   if(wasAttached_toRef.value == 'card') {
//     jsonContent.value = teamStore.project?.jsonContent
//   }
// })

const change_ing = ref(false);

const tiptapBlur = async (val) => {
  const isChanged = !isEqual(jsonContent.value, val);
  // console.log('isChanged', isChanged);
  if(!isChanged) return;
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
      data: {
        jsonContent: val,
      }
    };
    res = await updateProject(teamStore.project.id, params);
    if (res) {
      // teamStore.project.jsonContent = res.data.jsonContent;
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
      // await send_chat_Msg(chat_Msg);
    }
  }
  if (wasAttached_toRef.value === "card") {
    let update_params = {
      project_id: teamStore.project.id,
      data: {
        jsonContent: val,
      },
    };
    // console.log(update_params);
    res = await updateCard(teamStore.card.id, update_params);
    if (res) {
      return res?.data
    }
  }
};
</script>
