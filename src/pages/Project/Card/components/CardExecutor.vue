<template>
  <div
    class="flex flex-center q-pl-xs"
    :class="
      calc_auth(authBase.collection, 'executor', authBase.of) || isCreatoref
        ? 'cursor-pointer undrag'
        : 'dragBar'
    "
  >
    <!-- {{ executor }} -->
    <AvatarCircle v-if="executor" :member="executor.by_user" :size="20" />
    <q-icon v-else name="account_circle" size="20px" class="op-5" />
    <q-menu
      v-if="
        calc_auth(authBase.collection, 'executor', authBase.of) || isCreatoref
      "
      class="radius-sm shadow-12"
    >
      <q-list dense bordered class="radius-sm q-pa-xs">
        <q-item-label header class="q-px-sm q-pt-sm q-pb-none"
          >指定负责人</q-item-label
        >
        <q-separator spaced class="op-3" />
        <q-item
          v-for="i in membersRef"
          :key="i.id"
          clickable
          v-close-popup
          class="radius-xs"
          :class="executor && i.id == executor.id ? 'bg-primary' : ''"
          @click="attachExecutor(i)"
        >
          <q-item-section side>
            <AvatarCircle :member="i.by_user" :size="20" />
          </q-item-section>
          <q-item-section class="q-pr-md">{{
            i.by_user?.username
          }}</q-item-section>
        </q-item>
        <template v-if="executor">
          <q-separator spaced class="op-3" />
          <q-item
            clickable
            v-close-popup
            class="radius-xs"
            @click="attachExecutor(null)"
          >
            <q-item-section side>
              <q-icon name="account_circle" size="20px" class="op-5" />
            </q-item-section>
            <q-item-section class="q-pr-md">移除负责人</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
    <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
      {{ executor ? "负责人" : "指定负责人" }}
    </q-tooltip>
  </div>
</template>

<script setup>
import AvatarCircle from "src/pages/Project/components/widgets/AvatarCircle.vue";
import { toRef } from "vue";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { computed } from "vue";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
const { userId, me } = useMatedate;
const userStore = useUserStore();
const projectStore = useProjectStore();
const props = defineProps({
  card: {
    type: Object,
    default() {
      return undefined;
    },
  },
  members: {
    type: Object,
    default() {
      return undefined;
    },
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["attachExecutor"]);
const cardRef = toRef(props, "card");
const membersRef = toRef(props, "members");
const isCreatoref = toRef(props, "isCreator");

const executor = computed(() => {
  const executors = cardRef.value?.member_roles?.find(
    (i) => i.subject === "executor"
  )?.members;
  return executors?.length > 0 ? executors[0] : null;
});

const attachExecutor = async (member) => {
  emit("attachExecutor", member);
};
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
</script>

<style lang="scss" scoped></style>
