<template>
  <div
    v-if="calc_auth('overview', 'description', authBase.of)"
    class="full-width relative-position"
    style="min-height: 24px"
    @dblclick="change_ing = true"
  >
    <div
      v-if="change_ing"
      class="q-pa-xs radius-xs border absolute-top z-fab bg-grey-10 full-width shadow-12"
    >
      <q-input
        v-model="_input_text"
        dense
        square
        filled
        autofocus
        :placeholder="belonged?.description"
        type="text"
        @keyup.esc="change_ing = false"
        @blur="updateProjectFn"
        @keyup.enter="updateProjectFn"
      >
        <template v-slot:append>
          <q-btn dense flat round icon="add" @click="updateProjectFn" />
        </template>
      </q-input>
    </div>
    <div v-else style="min-height: 24px" @dblclick="change_ing = true">
      <span
        v-if="belonged?.description"
        class="font-large font-bold-600 relative-position"
        >{{ belonged?.description }}</span
      >
      <span v-else class="op-5 font-medium">双击此处添加概述</span>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef, computed, inject } from "vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import {
  userStore,
  teamStore,
} from "src/hooks/global/useStore.js";

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
});

const authBase = inject("authBase");

const wasAttached_toRef = toRef(props, "wasAttached_to");
// const belonged = ref();
const belonged = computed(() =>
  wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card
);

const change_ing = ref(false);
const _input_text = ref("");
const params = ref({});

const updateProjectFn = async () => {
  if (
    _input_text.value === belonged.value?.description ||
    _input_text.value === ""
  ) {
    change_ing.value = false;
    return;
  }
  params.value = {
    description: _input_text.value,
  };

  let res;
  if (wasAttached_toRef.value === "project") {
    res = await updateProject(belonged.value.id, params.value);
    if (res) {
      belonged.value.description = res.data.description;
      change_ing.value = false;
      let chat_Msg = {
        body: `${userStore.me.username}将项目摘要修改为：${res.data.description}`,
        props: {
          strapi: {
            data: {
              is: "project",
              by_user: userStore.userId,
              project_id: belonged.value.id,
              action: "change_project_description",
              body: res.data.description,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  }
  if (wasAttached_toRef.value === "card") {
    res = await updateCard(belonged.value.id, params.value);
    if (res) {
      teamStore.card.description = res.data.description;
      change_ing.value = false;
      let chat_Msg = {
        body: `${userStore.me.username}将卡片摘要修改为：${res.data.description}`,
        props: {
          strapi: {
            data: {
              is: "card",
              by_user: userStore.userId,
              card_id: belonged.value.id,
              action: "change_card_description",
              body: res.data.description,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  }
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};
</script>
