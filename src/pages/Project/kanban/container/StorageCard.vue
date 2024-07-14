<template>
  <div v-if="cardRef" class="row no-wrap items-center hovered-item">
    <div>
      <q-icon name="drag_indicator" class="dragBar hover-show transition" />
    </div>
    <div
      v-if="!content_channging"
      class="row no-wrap gap-xs q-pa-xs items-center radius-xs q-space indicator"
      :class="
        cardRef.id == projectStore.card?.id ? 'border' : 'border-placeholder'
      "
    >
      <div
        class="q-space row no-wrap gap-sm items-center q-px-xs indicator transition"
        :class="cardRef.id == projectStore.card?.id ? 'active q-pl-sm' : ''"
      >
        <q-icon name="folder" />
        <span class="undrag cursor-pointer q-space" @click="enterCard()">{{
          useCardname(cardRef)
        }}</span>
        <q-btn dense round flat size="sm" class="undrag hover-show transition">
          <q-icon name="more_vert" size="xs" class="op-5" />
          <q-menu class="border shadow-24">
            <q-list dense class="radius-sm q-pa-xs" style="min-width: 100px">
              <q-item class="no-padding">
                <q-item-section>
                  <q-input
                    dense
                    square
                    filled
                    autofocus
                    v-model="updateParmars.data.name"
                    type="text"
                    placeholder="文件夹名称"
                  >
                    <template #append>
                      <q-btn
                        color="primary"
                        flat
                        dense
                        size="sm"
                        round
                        icon="check"
                        @click="updateCardName"
                      />
                    </template>
                  </q-input>
                </q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item
                class="radius-xs"
                clickable
                v-close-popup
                @click="removeCard"
              >
                <q-item-section>删除文件夹</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <div class="undrag flex flex-center q-pl-xs cursor-pointer">
          <CardExecutor
            :card="cardRef"
            :executor="executor"
            :members="members"
            :isCreator="isCreator"
            @attachExecutor="attachExecutor"
          />
        </div>
      </div>
    </div>
    <!-- {{ cardRef.importance }} | {{ cardRef.urgency }} -->
    <div
      class="absolute-left full-height z-fab"
      :class="`${highlight ? 'highlight transition' : ''}`"
      :style="`${style}`"
    ></div>
  </div>
</template>

<script setup>
import { reactive, ref, toRefs, watch, watchEffect } from "vue";
import CardExecutor from "src/pages/Project/Card/components/CardExecutor.vue";

import { updateCard, deleteCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { useCardname } from "src/hooks/project/useCardname.js";

import _ from "lodash";

const projectStore = useProjectStore();
const userStore = useUserStore();
const $q = useQuasar();
const route = useRoute();

const props = defineProps({
  card: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { card: cardRef } = toRefs(props);

const media = ref();
watch(cardRef, () => {
  if (cardRef.value && cardRef.value.overviews.length > 0) {
    media.value =
      cardRef.value.overviews.find(
        (i) => i.version === cardRef.value.default_version
      ).media.url || cardRef.value.overviews[0].media.url;
  }
});

const members = ref();

const style = ref();
const highlight = ref();
const followed_bies = ref();
const is_followed = ref();

watchEffect(() => {
  members.value = projectStore.project_members || [];
  followed_bies.value = cardRef.value.followed_bies.map((i) => i.id);
  is_followed.value = followed_bies.value.includes(Number(userStore.userId));
  if (cardRef.value.urgency >= 50 && cardRef.value.importance >= 50) {
    style.value = `background-color: rgba(193,0,21,${
      cardRef.value.urgency + cardRef.value.importance - 100
    }%);`;
    highlight.value = true;
  }
  if (cardRef.value.urgency > 50 && cardRef.value.importance < 50) {
    style.value = `background-color: rgba(25,118,210,${cardRef.value.urgency}%);`;
    highlight.value = true;
  }
  if (cardRef.value.urgency < 50 && cardRef.value.importance > 50) {
    style.value = `background-color: rgba(33,186,69,${cardRef.value.importance}%);`;
    highlight.value = true;
  }
});

const card_member_roles = computed(() => cardRef.value.member_roles);
const card_executor_memberId = computed(
  () => card_member_roles.value?.find((i) => i.subject === "executor")?.id
);
let executor = cardRef.value.card_members.find(
  (i) => i.id === card_executor_memberId.value
);

const updateParmars = reactive({
  project_id: route.params.proj_id,
  data: {},
});

const name_changing = ref(false);
const emit = defineEmits(["cardChange", "cardDelete"]);
const updateCardFn = async () => {
  name_changing.value = false;
  let res = await updateCard(cardRef.value.id, updateParmars);
  if (res?.data) {
    emit("cardChange", res.data);
    return res.data;
  } else {
    $q.notify("保存出错");
  }
};

const updateCardName = async () => {
  if (
    !updateParmars.data.name ||
    updateParmars.data.name == "" ||
    updateParmars.data.name === cardRef.value.name
  ) {
    name_changing.value = false;
    return;
  }
  let res = await updateCardFn();
  if (res) {
    let chat_Msg = {
      body: `${userStore.me?.username}修改了文件夹 - ${useCardname(
        cardRef.value
      )} 的名称`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: cardRef.value.id,
            action: "update_card_name",
            card_name: updateParmars.data.name,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const attachExecutor = async (member) => {
  updateParmars.executor = member?.id || NaN;
  let res = await updateCardFn();
  if (res?.data) {
    let message;
    if (member === null) {
      message = `${userStore.me?.username}移除了文件夹 - ${useCardname(
        cardRef.value
      )} 的负责人`;
    } else {
      message = `${userStore.me?.username}指定了文件夹 - ${useCardname(
        cardRef.value
      )} 的负责人为：${member.username}`;
    }
    let body = res;
    delete body.member_roles;
    let chat_Msg = {
      body: message,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: cardRef.value.id,
            action: "update_card_executor",
            executor: member?.id || NaN,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    // console.log(cardRef.value.followed_bies.map(i => i.id),userStore.userId);
    if (
      !cardRef.value.followed_bies
        .map((i) => i.id)
        .includes(Number(userStore.userId))
    ) {
      followCard(member);
    }
  }
};

const content_channging = ref(false);
const removeCard = async () => {
  let res;
  if (belong_card.value) {
    let belong_card_id = belong_card.value.id;
    res = await deleteCard(
      cardRef.value.id,
      route.params.proj_id,
      belong_card_id
    );
  } else {
    res = await deleteCard(cardRef.value.id, route.params.proj_id);
  }

  if (res) {
    console.log(res);
    // $q.notify('文件夹已删除')
    emit("cardDelete", cardRef.value.id);
    let chat_Msg = {
      body: `${userStore.me?.username}删除了文件夹 - ${useCardname(
        cardRef.value
      )}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            action: "delete",
            body: res.data,
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
    $q.notify("文件夹已删除");
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

const enterCard = async () => {
  projectStore.card = cardRef.value;
};
// card 打开的时候，如果kanban数据被ws消息修改，且当前用户此时也正好开着当前card，此处要自动更新被修改的card
watch(
  cardRef,
  () => {
    if (projectStore.card?.id === cardRef.value.id) {
      enterCard();
    }
  },
  { immediate: true, deep: true }
);

const colorMarks = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "red",
  "info",
  "warning",
  "clear",
];
</script>

<style lang="scss" scoped>
.indicator {
  border-left: 0 solid #00000000;
}
.indicator.active {
  border-left: 5px solid #0e5bff;
}
</style>
