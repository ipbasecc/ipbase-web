<template>
  <q-card bordered class="fit column no-wrap">
    <q-bar dark class="transparent border-bottom" style="height: 2.3rem">
      <span class="font-medium">{{ $t('card') }} {{ $t('settings') }}</span>
      <q-space />
      <q-btn dense flat round icon="close" v-close-popup />
    </q-bar>
    <div class="q-space row no-wrap">
      <q-list class="border-right q-pa-sm" style="min-width: 9rem">
        <q-item
          v-for="i in setting_items"
          :key="i.val"
          clickable
          v-ripple
          dense
          active-class="bg-primary text-grey-1"
          class="radius-xs"
          :active="settingforRef === i.val"
          @click="settingforRef = i.val"
        >
          <q-item-section side>
            <q-icon :name="i.icon" />
          </q-item-section>
          <q-item-section class="text-no-wrap q-pr-md">{{
            $t(i.label)
          }}</q-item-section>
        </q-item>
      </q-list>
      <roleSettings v-if="settingforRef === 'role'" :isCard="true" />
      <div
        v-if="settingforRef === 'private'"
        style="height: 76vh"
        class="q-space"
      >
        <div
          v-if="
            useAuths('private', [authBase.collection], members, roles) || isCreator
          "
          class="full-width row no-wrap gap-lg q-pa-md"
        >
          <q-card v-for="(i, index) in isPrivate_items" :key="index" bordered>
            <q-card-section>
              <q-radio
                v-model="isPrivate"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :val="i.val"
                :label="$t('i.label')"
                class="q-pr-lg"
                @update:model-value="updateCardFn()"
              />
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="fit flex flex-center">{{ $t('no_premission_perform_operation') }}</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, toRef, computed, watch } from "vue";
import roleSettings from "src/pages/team/settings/roleSettings.vue";
import { updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { userStore, teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  settingfor: {
    type: String,
    default: "role",
  },
  members: {
    type: Object,
    default() {
      return undefined;
    },
  },
  roles: {
    type: Object,
    default() {
      return undefined;
    },
  },
});
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card) {
    const members = teamStore.card.card_members.map((i) => i.by_user.id);
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
const settingforRef = ref(toRef(props, "settingfor").value);
const per_fixs = [
  { val: "kanban", label: "kanban" },
  { val: "article", label: "article" },
  { val: "document", label: "document" },
  { val: "storage", label: "storage" },
];
const title = `${
  per_fixs.find((i) => i.val === teamStore.kanban?.type).label || "task"
}`;
const setting_items = ref([
  { val: "role", label: "role", icon: "add_moderator" },
  { val: "private_setting", label: "private_setting", icon: "mdi-eye-off" },
]);

const isPrivate = ref((teamStore.card?.private && "private") || "public");
const isPrivate_items = [
  { val: "public", label: "public" },
  { val: "private", label: "private" },
];
const isCreator = computed(
  () => teamStore.card?.creator?.id === userStore.userId
);
const updateCardFn = async () => {
  // console.log(isPrivate.value);
  let params = {
    project_id: teamStore.project?.id,
    data: {},
  };
  let setPrivate;
  if (isPrivate.value === "public") {
    setPrivate = false;
  } else {
    setPrivate = true;
  }
  // console.log(setPrivate);
  params.data.private = setPrivate;
  let res = await updateCard(teamStore.card?.id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}将卡片${teamStore.card.name}修改为：${
        isPrivate.value === "public" ? "公开" : "私有"
      }`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: teamStore.card.id,
            action: "card_privateChanged",
            private: setPrivate,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_privateChanged"
        ) {
          teamStore.card.private = strapi.data.private;
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
