<template>
  <q-list dense>
    <q-item
        v-if="kanbanRef"
        class="hovered-item radius-xs q-pa-xs"
        :class="`
        ${isActived ? 'border active-sublistitem' : !teamStore.dropKanbanID ? 'border-placeholder' : ''}
        ${useAuths('order', ['kanban']) && $q.screen.gt.xs ? ' dragBar' : ''}
        ${teamStore.dropKanbanID === kanbanRef.id ? 'border border-dashed' : ''}
      `"
        clickable
        v-ripple
        @click.stop="enterKanban(kanbanRef)">
      <q-item-section>{{ kanbanRef.title === 'Initial_Kanban' ? $t(kanbanRef.title) : kanbanRef.title }}</q-item-section>
      <q-item-section side class="absolute-right z-fab q-mr-xs">
        <q-btn
          v-if="
            useAuths('title', ['kanban']) ||
            useAuths('delete', ['kanban'])
          "
            dense
            size="sm"
            flat
            round
            icon="more_vert"
            class="hover-show transition undrag cursor-pointer"
        >
          <q-menu class="radius-sm shadow-24">
            <q-list
                dense
                bordered
                class="radius-sm q-pa-xs"
                style="max-width: 202px"
            >
              <q-item class="justify-center font-large">
                <div class="row items-center justify-start gap-xs">
                  <div
                      v-for="i in emojis"
                      :key="i"
                      class="col-2"
                      @click="toggleEmoji(i)"
                  >
                    <q-responsive
                        :ratio="1"
                        class="cursor-pointer q-pa-xs border radius-xs emoji"
                    >
                      <span v-if="i" class="flex flex-center">{{ i }}</span>
                      <q-btn
                          v-else
                          dense
                          flat
                          label="x"
                          class="flex flex-center"
                      />
                    </q-responsive>
                  </div>
                </div>
              </q-item>
              <q-item
                  v-if="useAuths('title', ['kanban'])"
                  class="no-padding"
              >
                <q-input
                    v-model="params.data.title"
                    dense
                    square
                    filled
                    type="text"
                    :placeholder="$t('kanban_name')"
                    class="radius-xs overflow-hidden"
                    @keyup.enter="updateKanbanFn(kanbanRef.id)"
                    @keyup.ctrl.enter="updateKanbanFn(kanbanRef.id)"
                    @keydown.esc="params.data.title = null"
                >
                  <template v-slot:append>
                    <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="check"
                        @click="updateKanbanFn(kanbanRef.id)"
                    />
                  </template>
                </q-input>
              </q-item>
              <template v-if="useAuths('delete', ['kanban'])">
                <q-separator spaced />
                <q-item
                    clickable
                    v-close-popup
                    class="radius-xs"
                    @click="deleteKanbanFn(kanbanRef.id)"
                >
                  <q-item-section side><q-icon name="remove" /></q-item-section>
                  <q-item-section>{{ $t('remove_this_kanban') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { computed, ref, toRef } from "vue";
import { kanbanUpdate, kanbanDelete } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import { userStore, teamStore, uiStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  kanban: {
    type: Object,
    default() {
      return {};
    },
  },
});

const emit = defineEmits(["enterKanban", "removeKanban"]);
const kanbanRef = toRef(props, "kanban");
const isActived = computed(
  () =>
    teamStore.kanban_id === kanbanRef.value?.id
);
const enterKanban = (kanban) => {
  if(uiStore.split_kanban_active === 'right'){
    teamStore.dropKanbanID = Number(kanban.id);
  } else {
    emit("enterKanban", kanban);
  }
};

const emojis = [
  "💋",
  "❤",
  "💢",
  "💯",
  "💩",
  "😓",
  "🥵",
  "🫣",
  "😬",
  "🤪",
  "😍",
  "😇",
  "",
];

const params = ref({
  project_id: teamStore.project.id,
  kanban_id: kanbanRef.value.id,
  data: {
    title: kanbanRef.value.title,
  },
});
const toggleEmoji = (i) => {
  let str = params.value.data.title;
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  str = str.replace(emojiRegex, "");

  if (i !== "") {
    params.value.data.title = i + " " + str;
  } else {
    params.value.data.title = str;
  }
  updateKanbanFn(kanbanRef.value?.id);
};
const updateKanbanFn = async (kanban_id) => {
  let res = await kanbanUpdate(kanban_id, params.value);
  if (res?.data) {
    let chat_Msg = {
      body: `${userStore.me?.username}将ID为：${kanban_id}的看板 - 改名为：${params.value?.data?.title}`,
      props: {
        strapi: {
          data: {
            is: "kanban",
            by_user: userStore.userId,
            kanban_id: kanbanRef.value.id,
            action: "kanbanUpdate",
            body: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};

const deleteKanbanFn = async (kanban_id) => {
  let res = await kanbanDelete(teamStore.project?.id, kanban_id);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}删除了ID为：${kanban_id}的看板: ${kanbanRef.value?.title}`,
      props: {
        strapi: {
          data: {
            is: "kanban",
            by_user: userStore.userId,
            kanban_id: kanbanRef.value.id,
            action: "kanbanDeleted",
          },
        },
      },
    };
    emit('removeKanban', kanban_id)
    await send_chat_Msg(chat_Msg);
  }
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};
</script>

<style lang="scss" scoped>
.indicator {
  border-left: 0 solid #00000000;
}
.indicator.active {
  border-left: 5px solid #0e5bff;
}
.shadow-indicator {
  -webkit-box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
  box-shadow: 0 0 42px -9px rgba(0, 0, 0, 0.75);
}
.emoji {
  border: 1px solid #00000000;
  margin: 2px;
}
.emoji:hover {
  border: 1px solid #333;
}
</style>
