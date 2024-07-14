<template>
  <q-icon
    v-if="_status"
    :name="_status.icon"
    :color="_status.color"
    :class="`absolute-bottom-right radius-full border ${
      $q.dark.mode ? 'bg-black' : 'bg-white'
    }`"
    :size="size"
  />
</template>

<script setup type="module">
import { ref, toRefs, watchEffect, watch } from "vue";

import useMmws from "src/stores/mmws.js";
import mmMmStore from "src/stores/mmstore.js";

const mmStore = mmMmStore();
const mm_wsStore = useMmws();

const props = defineProps({
  status: {
    type: Object,
    default() {
      return {};
    },
  },
  size: {
    type: String,
    default: "14px",
  },
});
const { status: statusRef, size } = toRefs(props);
const statuses = ref([
  { status: "online", color: "positive", icon: "mdi-checkbox-marked-circle" },
  { status: "offline", color: "grey", icon: "radio_button_unchecked" },
  { status: "away", color: "orange", icon: "schedule" },
  { status: "dnd", color: "deep-orange-9", icon: "mdi-minus-circle" },
]);
const _status = ref();
watchEffect(() => {
  _status.value = statuses.value.find(
    (i) => i.status === statusRef.value.status
  );
});

watch(
  mm_wsStore,
  () => {
    if (
      mm_wsStore?.event &&
      mm_wsStore.event.event == "status_change" &&
      mm_wsStore.event.data.user_id === statusRef.value?.user_id
    ) {
      const status = mm_wsStore.event.data;
      let member = mmStore.members.find(
        (i) => i.user_id === statusRef.value.user_id
      );
      member = {
        ...member,
        status: status,
      };
      mmStore.members = mmStore.members.map((i) => ({
        ...i,
        status:
          i.user_id === statusRef.value.user_id
            ? status
            : i.status
            ? i.status
            : void 0,
      }));
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
