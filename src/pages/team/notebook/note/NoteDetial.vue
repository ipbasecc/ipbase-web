<template>
  <q-scroll-area class="absolute-full">
    <TipTap
      v-if="teamStore.note"
      v-bind="$attrs"
      :key="teamStore.note?.id"
      :jsonContent="teamStore.note?.jsonContent"
      :editable="isCreator"
      :autofocus="true"
      class=""
      styleClass="q-pa-md"
      contentStyle="width: 100%; max-width: 46rem;"
      :withSaveBtn="true"
      :withImageBtn="true"
      need="json"
      :contentChanged
      @contentChanged="contentChanged = true"
      @tiptapUpdate="tiptapUpdate"
      @tiptapBlur="tiptapBlur"
    >
      <template v-if="pannelMode" v-slot:left-btn>
        <q-btn flat dense size=sm icon="mdi-chevron-left" @click="backList()" />
      </template>
        <template v-slot:more_btn>
          <template v-if="teamStore.note?.by_course && uiStore.app === 'notebooks'">
            <q-separator spaced inset vertical />
            <q-btn dense flat no-caps :label="$t('open_related_course')" @click="showCourseDialog = true" />
          </template>
          <div v-if="saving" class="row no-wrap gap-sm flex-center q-px-md">
              <q-spinner size="1em" :thickness="2" />
              {{ $t('saving') }}
          </div>
        </template>
    </TipTap>
    <q-dialog v-model="showCourseDialog" persistent full-width full-height>
      <ClassPage :card="teamStore.note?.by_course" />
    </q-dialog>
  </q-scroll-area>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { teamStore, uiStore } from 'src/hooks/global/useStore';
import { getDocument, updateDocument } from 'src/api/strapi/project.js'
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue';
import ClassPage from '../../card/ClassPage.vue'

const { active_note_id, pannelMode } = defineProps(['active_note_id', 'pannelMode'])
const route = useRoute();
const router = useRouter();
const note_id = computed(() => route.params?.note_id || active_note_id);
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
const backList = async () => {
    if(uiStore.app === 'notebooks'){
      teamStore.note = null;
      await router.push(`/notebooks/${teamStore.notebook?.id}`)
    } else {
      teamStore.note = null;
      uiStore.active_note_id = void 0
    }
}

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
  if (intervalId) {
    clearInterval(intervalId);
  }
  count.value = 15;
  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      intervalId = null
      await updateDocumentFn();
    }
  }, 1000);
};

const tiptapUpdate = async (val) => {
  jsonContent.value = val;
  startCountdown();
};
const tiptapBlur = async (val) => {
  console.log("tiptapBlur", val);
  jsonContent.value = val;
  await updateDocumentFn();
};
</script>