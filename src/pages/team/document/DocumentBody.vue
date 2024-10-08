<template>
  <DocumentTiptap v-if="teamStore.active_document" :key="teamStore.active_document.id"
    :document="teamStore.active_document" :by_info :contentStyle :showClose="true" @close="close"
  />
</template>

<script setup>
import {computed, ref, toRefs, watch, watchEffect, onBeforeUnmount} from "vue";
import {mm_wsStore, teamStore, userStore} from "src/hooks/global/useStore.js";
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
});

const { project_id, document_id, by_info } = toRefs(props);
const contentStyle = computed(() => {
  return $q.screen.gt.xs ? 'max-width: 64rem;' : 'max-width: 100%;'
})

const document = ref();
watchEffect(async () => {
  if (by_info.value.by === "project") {
    by_info.value.project_id = teamStore.project?.id;
  } else if (by_info.value.by === "card") {
    by_info.value.card_id = teamStore.card?.id;
  } else {
    by_info.value.user_id = userStore.userId;
  }
});
const close = () => {
  teamStore.active_document = null;
}
onBeforeUnmount(() => {
  close();
});
</script>

<style lang="scss" scoped></style>
