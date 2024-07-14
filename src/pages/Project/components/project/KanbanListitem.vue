<template>
  <div
    v-if="kanbanRef"
    class="hovered-item radius-xs q-pa-xs kanban-item"
    :class="`${isActived ? 'border' : 'border-placeholder'} ${
      calc_auth('kanban', 'order', 'project') ? ' dragBar' : ''
    }`"
  >
    <div
      class="row no-wrap gap-sm items-center q-px-xs indicator transition"
      :class="isActived ? 'active q-pl-sm' : ''"
    >
      <span class="q-space cursor-pointer undrag" @click="enterKanban()">{{
        kanbanRef.title
      }}</span>
      <q-btn
        v-if="
          calc_auth('kanban', 'title', 'project') ||
          calc_auth('kanban', 'delete', 'project')
        "
        dense
        size="sm"
        flat
        round
        icon="more_vert"
        class="hover-show transition undrag"
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
              v-if="calc_auth('kanban', 'title', 'project')"
              class="no-padding"
            >
              <q-input
                v-model="params.data.title"
                dense
                square
                filled
                type="text"
                placeholder="看板名称"
                class="radius-xs overflow-hidden"
                @keyup.enter="updateKanbanFn(kanbanRef.id)"
                @keyup.ctrl.enter="updateKanbanFn(kanbanRef.id)"
                @keydown.esc="rename_text = null"
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
            <template v-if="calc_auth('kanban', 'delete', 'project')">
              <q-separator spaced />
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="deleteKanbanFn(kanbanRef.id)"
              >
                <q-item-section side><q-icon name="remove" /></q-item-section>
                <q-item-section>移除此看板</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, toRef, watchEffect } from "vue";
import { kanbanUpdate, kanbanDelete } from "src/api/strapi/project.js";
import useProjectStore from "src/stores/project.js";
import { useRouter, useRoute } from "vue-router";
import useUserStore from "src/stores/user.js";
import localforage from "localforage";
import useMmStore from "src/stores/mmstore.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
const mmStore = useMmStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const projectStore = useProjectStore();

const props = defineProps({
  kanban: {
    type: Object,
    default() {
      return {};
    },
  },
});
const kanbanRef = toRef(props, "kanban");
const isActived = computed(
  () =>
    projectStore.kanban_id == kanbanRef.value.id ||
    projectStore.kanban?.id == kanbanRef.value.id ||
    route.params?.kanban_id == kanbanRef.value.id
);

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

const enterKanban = () => {
  // console.log('enterKanban');
  let str = JSON.parse(JSON.stringify(kanbanRef.value));
  localforage
    .setItem(`___last_kanban_of_project_${projectStore.project?.id}`, str)
    .then(function (value) {})
    .catch(function (err) {
      console.error(err);
    });
  projectStore.kanban_id = kanbanRef.value.id;
  projectStore.kanban_type = kanbanRef.value.type;
  if (projectStore.inChat) {
    router.push(
      `/chat/${mmStore.channel.name}/${mmStore.channel.id}/${kanbanRef.value.id}`
    );
  } else {
    router.push(
      `/projects/${projectStore.project.id}/kanban/${kanbanRef.value.id}`
    );
  }
};

watchEffect(() => {
  if (projectStore?.kanban_id == kanbanRef.value.id) {
    projectStore.kanban_type = kanbanRef.value.type;
    enterKanban();
  }
});

const params = ref({
  project_id: projectStore.project.id,
  kanban_id: kanbanRef.value.id,
  data: {
    title: kanbanRef.value.title,
  },
});
const toggleEmoji = (i) => {
  let str = params.value.data.title;
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  str = str.replace(emojiRegex, "");

  if (i != "") {
    params.value.data.title = i + " " + str;
  } else {
    params.value.data.title = str;
  }
  updateKanbanFn(kanbanRef.value?.id);
};
const updateKanbanFn = async (kanban_id) => {
  let res = await kanbanUpdate(kanban_id, params.value);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}将ID为：${kanban_id}的看板 - 改名为：${params.value.data.title}`,
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
    send_chat_Msg(chat_Msg);
  }
};

const deleteKanbanFn = async (kanban_id) => {
  let res = await kanbanDelete(projectStore.project.id, kanban_id);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}删除了ID为：${kanban_id}的看板: ${kanbanRef.value.title}`,
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
    send_chat_Msg(chat_Msg);
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
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
  -webkit-box-shadow: 0px 0px 42px -9px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 42px -9px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 42px -9px rgba(0, 0, 0, 0.75);
}
.kanban-item:hover {
  border: 1px solid #333;
}
.emoji {
  border: 1px solid #00000000;
  margin: 2px;
}
.emoji:hover {
  border: 1px solid #333;
}
</style>
