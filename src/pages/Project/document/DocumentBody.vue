<template>
  <DocumentPageEditorjs :document="document" :by_info />
</template>

<script setup>
import DocumentPageEditorjs from "pages/Project/components/document/DocumentEditorjs.vue";
import { ref, watchEffect } from "vue";
import { toRefs, watch } from "vue";
import useProjectStore from "src/stores/project.js";
import { computed } from "vue";

const projectStore = useProjectStore();
const props = defineProps({
  proj_id: {
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

const { proj_id, document_id, by_info } = toRefs(props);

watchEffect(() => {
  if (by_info.value.by === "project") {
    by_info.value.project_id = projectStore.project?.id;
  }
  if (by_info.value.by === "card") {
    by_info.value.card_id = projectStore.card?.id;
  }
});

const document = computed(() => {
  let res;

  if (document_id.value) {
    if (by_info.value.project_id) {
      res = projectStore.project?.project_documents?.find(
        (i) => i.id === Number(document_id.value)
      );
    }
    if (by_info.value.card_id) {
      res = projectStore.card?.card_documents?.find(
        (i) => i.id == Number(document_id.value)
      );
    }
    if (by_info.value.user_id) {
    }
  }

  return res;
});
</script>

<style lang="scss" scoped></style>
