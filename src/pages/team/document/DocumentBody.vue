<template>
  <DocumentTiptap v-if="teamStore.active_document" :key="teamStore.active_document.id"
    class="fit" :class="$q.screen.gt.xs ? 'limit' : ''"
    :document="teamStore.active_document" :by_info :showClose="showClose" @close="close"
  />
</template>

<script setup>
import { toRefs, watchEffect, onBeforeUnmount} from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import DocumentTiptap from "./DocumentTiptap.vue";
import {useQuasar} from 'quasar'

const $q = useQuasar();

const props = defineProps({
  project_id: {
    type: String,
    default: "",
  },
  document_id: {
    type: String,
    default: "",
  },
  by_info: {
    type: Object,
    default() {
      return {
        by: "project",
      };
    },
  },
  showClose: {
    type: Boolean,
    default: false
  }
});

const { by_info, showClose } = toRefs(props);

watchEffect(async () => {
  if (by_info.value.by === "project") {
    by_info.value.project_id = teamStore.project?.id;
  } else if (by_info.value.by === "card") {
    by_info.value.card_id = teamStore.card?.id;
  } else {
    by_info.value.user_id = teamStore.init?.id;
  }
});
const close = () => {
  teamStore.active_document = null;
}
onBeforeUnmount(() => {
  close();
});
</script>

<style lang="scss">
.limit .tiptapBody div {
  max-width: 64rem;
  width: 100%;
  margin: 0 auto;
}
</style>
