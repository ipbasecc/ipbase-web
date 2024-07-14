<template>
  <div
    v-if="calc_auth('overview', 'name', authBase.of)"
    class="font-large font-bold-600 relative-position hovered-item"
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
        :placeholder="belonged?.name"
        type="text"
        @keyup.esc="change_ing = false"
        @blur="updateNameFn"
        @keyup.enter="updateNameFn"
      >
        <template v-slot:append>
          <q-btn dense flat round icon="add" @click="updateNameFn" />
        </template>
      </q-input>
    </div>
    <template v-else>
      <span class="row no-wrap items-center gap-md">
        <span
          >{{ belonged?.name }}
          <q-tooltip
            class="bg-black text-white"
            anchor="top middle"
            self="bottom middle"
          >
            双击改名
          </q-tooltip>
        </span>
        <q-icon
          name="edit"
          class="cursor-pointer hover-show transition"
          @click="change_ing = true"
        />
      </span>
    </template>
  </div>
  <div
    v-else
    class="font-large font-bold-600 relative-position"
    style="min-height: 24px"
    @dblclick="change_ing = true"
  >
    <span>{{ belonged?.name }}</span>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect, inject } from "vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";
const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
});

const authBase = inject("authBase");

const wasAttached_toRef = toRef(props, "wasAttached_to");
const belonged = ref();
watchEffect(() => {
  belonged.value =
    wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card;
});

const change_ing = ref(false);
const _input_text = ref("");
const params = ref({});

const updateNameFn = async () => {
  change_ing.value = false;
  let _ =
    wasAttached_toRef.value === "project"
      ? belonged.value?.name
      : teamStore.card?.name;
  if (_input_text.value === _ || _input_text.value === "") {
    change_ing.value = false;
    return;
  }
  params.value = {
    name: _input_text.value,
  };
  let res;
  if (wasAttached_toRef.value === "project") {
    try {
      res = await updateProject(belonged.value.id, params.value);
      if (res?.data) {
        // console.log(res);
        let chat_Msg = {
          body: `${userStore.me.username}将项目名称修改为：${res.data.name}`,
          props: {
            strapi: {
              data: {
                is: "project",
                by_user: userStore.userId,
                project_id: belonged.value.id,
                action: "change_project_name",
                body: res.data.name,
              },
            },
          },
        };
        await send_chat_Msg(chat_Msg);
      }
    } catch (error) {
      console.log(error);
    }
  }
  if (wasAttached_toRef.value === "card") {
    res = await updateCard(belonged.value.id, params.value);
    if (res) {
      change_ing.value = false;
      let chat_Msg = {
        body: `${userStore.me.username}将卡片名称修改为：${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "card",
              by_user: userStore.userId,
              card_id: belonged.value.id,
              action: "change_card_name",
              body: res.data.name,
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
