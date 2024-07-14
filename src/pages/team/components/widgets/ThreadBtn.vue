<template>
  <q-btn
    v-if="thread.reply_count > 0 || show"
    :color="
      teamStore.thread?.id === thread?.id
        ? 'green'
        : thread.reply_count
        ? 'orange'
        : ''
    "
    icon="forum"
    dense
    size="sm"
    :rounded="rounded"
    padding="xs sm"
    flat
    :label="thread.reply_count || ''"
    :class="thread.reply_count > 0 ? '' : 'op-5'"
    @click="enterThread(thread)"
  >
  </q-btn>
</template>

<script setup>
import { toRefs } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  thread: {
    type: Object,
    default: void 0,
  },
  show: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["enterThread", "threadUpdated"]);
const { thread } = toRefs(props);
const enterThread = (_thread) => {
  emit("enterThread", _thread);
};
</script>

<style lang="scss" scoped></style>
