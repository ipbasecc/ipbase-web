<template>
  <div v-if="teamStore">
    <q-list v-if="isList" dense bordered class="radius-sm q-pa-xs text-no-wrap">
      <q-item
        v-for="i in $team().process_status"
        :key="i.val"
        clickable
        v-close-popup
        @click="statusChange(i.val)"
        class="radius-xs"
        :class="statusRef === i.val ? 'bg-primary' : ''"
      >
        <q-item-section side><q-icon :name="i.icon" /></q-item-section>
        <q-item-section>{{ i.name }}</q-item-section>
      </q-item>
    </q-list>
    <template v-else>
      <q-btn
        flat
        dense
        size="sm"
        padding="xs"
        :color="_status(statusRef)?.color"
      >
        <div class="row no-wrap items-center">
          <q-icon :name="_status(statusRef)?.icon" size="xs" />
          <span v-if="!dense" class="q-ml-xs text-no-wrap q-pr-xs">{{
            _status(statusRef)?.name
          }}</span>
          <q-tooltip class="bg-black font-medium border">
            {{ _status(statusRef)?.name }}
          </q-tooltip>
        </div>
        <q-menu
          v-if="modifyRef"
          class="redius-sm border q-pa-xs text-no-wrap shadow-24"
        >
          <q-list dense style="min-width: 140px">
            <q-item
              v-for="i in $team().process_status"
              :key="i.val"
              clickable
              v-close-popup
              @click="statusChange(i.val)"
              class="radius-xs"
            >
              <q-item-section side><q-icon :name="i.icon" /></q-item-section>
              <q-item-section>{{ i.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <div
          class="absolute-full op-1 z-unfab radius-xs"
          :class="`bg-${_status(statusRef)?.color}`"
        ></div>
      </q-btn>
    </template>
  </div>
</template>

<script setup>
import {toRef, computed } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import { $team } from "src/boot/service";
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  status: {
    type: String,
    default: "",
  },
  dense: {
    type: Boolean,
    default: false,
  },
  modify: {
    type: Boolean,
    default: false,
  },
  isList: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["statusChange"]);
const statusRef = toRef(props, "status");
const modifyRef = toRef(props, "modify");
const isShared = computed(() => uiStore.isShared)
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card) {
    const members = teamStore.card.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "column",
      of: "card",
    };
  } else {
    res = {
      collection: "column",
      of: "project",
    };
  }
  return res;
});

const _status = (status) => {
  return $team().process_status?.find((i) => i.val === status);
};
// console.log(_status(statusRef.value));

const statusChange = (val) => {
  emit("statusChange", val);
};
</script>
