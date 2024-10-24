<template>
  <TipTap
    v-if="current_documentRef"
    :jsonContent="current_documentRef?.jsonContent"
    :editable="true"
    square
    need="json"
    styleClass="q-pa-md"
    class="fit"
    :contentChanged
    @contentChanged="contentChanged = true"
    @tiptapBlur="updateDocumentFn"
    @tiptapUpdate="tiptapUpdate"
    @click.stop="content_channging = true"
    @keydown.esc="content_channging = false"
  />
</template>

<script setup>
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { toRef, ref } from "vue";

import { updateDocument } from "src/api/strapi/project.js";
import { teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  current_document: {
    type: Object,
    default() {
      return {};
    },
  },
});

const current_documentRef = toRef(props, "current_document");
const content_channging = ref(false);
const contentChanged = ref(false);

const emit = defineEmits(["documentChanged"]);
const updateDocumentFn = async (val) => {
  // console.log('updateDocumentFn',val);
  
  if (!val) return;
  let params = {
    project_id: teamStore.project.id,
    document_id: current_documentRef.value.id,
    card_id: teamStore.card.id,
    data: {
      jsonContent: val,
    },
  };
  await updateDocument(current_documentRef.value.id, params);
  contentChanged.value = false;
};

const count = ref(8);
let intervalId = null;
const autoSave = (val) => {
  // console.log('tiptapUpdate autoSave');

  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      await updateDocumentFn(val);
    }
  }, 1000);
};

const tiptapUpdate = (val) => {
  // console.log('tiptapUpdate', val);
  count.value = 8;
  autoSave(val);
};
</script>

<style lang="scss" scoped></style>
