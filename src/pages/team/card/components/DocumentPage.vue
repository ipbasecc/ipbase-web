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
    :withSaveBtb="false"
    @contentChanged="contentChanged = true"
    @tiptapBlur="updateDocumentFn"
    @tiptapSave="tiptapSave"
    @tiptapUpdate="tiptapUpdate"
  >
    <template v-slot:more_btn>
      <q-btn flat dense size="sm" class="q-mr-md" :color="saving ? 'primary' : ''" :disable="saving" @click="tiptapSave">
        <q-spinner-dots v-if="saving"
          size="1em"
          :thickness="2"
        />
        <q-icon v-else name="save" />
      </q-btn>
    </template>
  </TipTap>
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
const contentChanged = ref(false);
const saving = ref(false);

const update_params = ref({
  project_id: teamStore.project?.id,
  document_id: current_documentRef.value?.id,
  card_id: teamStore.card?.id,
  data: {
    jsonContent: "",
  },
})
const emit = defineEmits(["documentChanged"]);
const updateDocumentFn = async (val) => {  
  if (!val || !contentChanged.value || saving.value) return;
  saving.value = true
  update_params.value.data.jsonContent = val;
  await updateDocument(current_documentRef.value.id, update_params.value);
  contentChanged.value = false;
  saving.value = false
};

const count = ref(8);
const autoSave = (val) => {
  update_params.value.data.jsonContent = val;
  let intervalId = setInterval(async () => {
    count.value--;
    // console.log('tiptapUpdate autoSave', count.value);
    if (count.value < 1) {
      // console.log('Clearing interval');
      clearInterval(intervalId);
      try {
        await updateDocumentFn(update_params.value.data.jsonContent);
        // console.log('Document updated');
      } catch (error) {
        console.error('Error updating document', error);
      }
    }
  }, 1000);
};

const tiptapUpdate = (val) => {
  // console.log('tiptapUpdate', val);
  count.value = 8;
  autoSave(val);
};
const tiptapSave = (val) => {
  console.log('tiptapSave', val);
  updateDocumentFn(val);
};
</script>

<style lang="scss" scoped></style>
