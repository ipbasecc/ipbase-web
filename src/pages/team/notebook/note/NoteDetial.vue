<template>
    <TipTap
      v-bind="$attrs"
      :jsonContent="teamStore.note?.jsonContent"
      :editable="isCreator"
      autofocus="all"
      class="absolute-full"
      styleClass="q-pa-md"
      contentStyle="width: 100%; max-width: 46rem;"
      :withSaveBtb="true"
      :withImageBtb="true"
      :contentChanged
      need="json"
      @tiptapUpdate="tiptapUpdate"
      @tiptapBlur="tiptapBlur"
      @contentChanged="contentChanged = true"
    >
      <template v-slot:left-btn>
        <q-btn flat dense size=sm icon="mdi-chevron-left" @click="uiStore.active_note_id = void 0" />
      </template>
        <template v-slot:more_btn>
          <template v-if="teamStore.note?.by_course && uiStore.app === 'notebooks'">
            <q-separator spaced inset vertical />
            <q-btn dense flat no-caps :label="$t('open_related_course')" @click="showCourseDialog = true" />
          </template>
          <div v-if="saving" class="row no-wrap gap-sm flex-center q-px-md">
              <q-spinner
              size="1em"
              :thickness="2"
              />
              保存中...
          </div>
        </template>
    </TipTap>
    <q-dialog v-model="showCourseDialog" persistent full-width full-height>
      <ClassPage :card="teamStore.note?.by_course" />
    </q-dialog>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { teamStore, uiStore } from 'src/hooks/global/useStore';
import { getDocument, updateDocument } from 'src/api/strapi/project.js'
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue';
import ClassPage from '../../card/ClassPage.vue'

const { active_note_id } = defineProps(['active_note_id'])
const route = useRoute();
const note_id = computed(() => route.params.note_id || active_note_id);
const isCreator = computed(() => {
    const creator_id = teamStore.note?.by_user?.id || teamStore.note?.creator?.id
    return creator_id === teamStore.init?.id
})

watch(note_id, async() => {
    if(note_id.value){
        const {data} = await getDocument(note_id.value)
        if(data){
            teamStore.note = data;
        }
    }
},{immediate: true})

const showCourseDialog = ref(false);

const saving = ref(false)
const contentChanged = ref(false)
const jsonContent = ref()
const updateDocumentFn = async () => {
  if (saving.value || !contentChanged.value || !note_id.value) return;
  saving.value = true;
  let params = {
    document_id: note_id.value,
    data: {
      jsonContent: jsonContent.value,
    },
  };

  const { data } = await updateDocument(note_id.value, params);
  saving.value = false;
  if (data) {
    teamStore.note.jsonContent = data.jsonContent;
    contentChanged.value = false
  }
};

const count = ref(15);
let intervalId = null;
const startCountdown = () => {
  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      await updateDocumentFn();
    }
  }, 1000);
};

const tiptapUpdate = async (val) => {
  jsonContent.value = val;
  count.value = 15;
  startCountdown();
};
const tiptapBlur = async (val) => {
  console.log("tiptapBlur", val);
  jsonContent.value = val;
  await updateDocumentFn();
};
</script>