<template>
  <q-card bordered class="fit column no-wrap">
    <q-bar dark class="transparent border-bottom" style="height: 2.3rem">
      <span class="font-medium">{{ title }}</span>
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
            i.label
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
            calc_auth(authBase.collection, 'private', authBase.of) || isCreator
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
                :label="i.label"
                class="q-pr-lg"
                @update:model-value="updateCardFn()"
              />
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="fit flex flex-center">您无权修改此设置</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, toRef, computed, watch } from "vue";
import roleSettings from "src/pages/Project/components/settings/roleSettings.vue";
import { updateCard } from "src/api/strapi/project.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useMmws from "src/stores/mmws.js";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
const { userId, me } = useMatedate;
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const props = defineProps({
  settingfor: {
    type: String,
    default: "role",
  },
});
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
const settingforRef = ref(toRef(props, "settingfor").value);
const per_fixs = [
  { val: "kanban", label: "任务" },
  { val: "article", label: "文章" },
  { val: "document", label: "文集" },
  { val: "storage", label: "存储" },
];
const title = `${
  per_fixs.find((i) => i.val === projectStore.kanban?.type).label || "任务"
}设置`;
const setting_items = ref([
  { val: "role", label: "权限", icon: "add_moderator" },
  { val: "private", label: "可见性", icon: "mdi-eye-off" },
]);

const isPrivate = ref((projectStore.card?.private && "private") || "public");
const isPrivate_items = [
  { val: "public", label: "公开" },
  { val: "private", label: "私有" },
];
const isCreator = computed(
  () => projectStore.card?.creator?.id === userStore.userId
);
const updateCardFn = async () => {
  console.log(isPrivate.value);
  let params = {
    project_id: projectStore.project?.id,
    data: {},
  };
  let setPrivate = false;
  if (isPrivate.value === "public") {
    setPrivate = false;
  } else {
    setPrivate = true;
  }
  console.log(setPrivate);
  params.data.private = setPrivate;
  let res = await updateCard(projectStore.card?.id, params);
  if (res) {
    let chat_Msg = {
      body: `${userStore.me.username}将卡片${projectStore.card.name}修改为：${
        isPrivate.value === "public" ? "公开" : "私有"
      }`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: projectStore.card.id,
            action: "card_privateChanged",
            private: setPrivate,
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
          strapi.data?.is === "card" &&
          strapi.data.card_id === projectStore.card.id &&
          strapi.data.action === "card_privateChanged"
        ) {
          projectStore.card.private = strapi.data.private;
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
