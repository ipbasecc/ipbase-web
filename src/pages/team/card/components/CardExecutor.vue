<template>
  <div
    class="flex flex-center q-pl-xs"
    :class="
      useAuths('executor', [authBase.collection]) || isCreatoref
        ? 'cursor-pointer undrag'
        : 'dragBar'
    "
  >
    <AvatarCircle v-if="executor" :member="executor.by_user" :size="20" />
    <q-icon v-else name="account_circle" size="20px" class="op-5" />
    <q-menu
      v-if="
        useAuths('executor', [authBase.collection]) || isCreatoref
      "
      class="radius-sm shadow-12"
    >
      <q-list dense bordered class="radius-sm q-pa-xs">
        <q-item-label header class="q-px-sm q-pt-sm q-pb-none"
          >{{ $t('assign_executor') }}</q-item-label
        >
        <q-separator spaced class="op-3" />
        <q-item
          v-for="i in membersRef"
          :key="i.id"
          clickable
          v-close-popup
          class="radius-xs"
          :class="executor && i.id === executor.id ? 'bg-primary' : ''"
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
            <q-item-section class="q-pr-md">{{ $t('remove_executor') }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
    <q-tooltip :class="$q.dark.mode ? 'bg-black text-grey-1' : 'bg-white text-grey-10'">
      {{ executor ? $t('executor') : $t('assign_executor') }}
      <br />
    </q-tooltip>
  </div>
</template>

<script setup>
import AvatarCircle from "src/pages/team/components/user/AvatarCircle.vue";
import { toRef, toRefs } from "vue";
import { computed } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
const userId = computed(() => teamStore.init?.id);
const props = defineProps({
  card: {
    type: Object,
    default() {
      return undefined;
    },
  },
  cardMembers: {
    type: Object,
    default() {
      return undefined;
    },
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  executor: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["attachExecutor"]);
const membersRef = toRef(props, "cardMembers");
const isCreatoref = toRef(props, "isCreator");
const { executor } = toRefs(props);
const attachExecutor = async (member) => {
  emit("attachExecutor", member);
};
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card) {
    const members = teamStore.card.card_members?.map((i) => i.by_user.id);
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
