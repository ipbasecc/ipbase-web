<template>
  <q-card v-if="currentAssistant" bordered style="min-width: 400px;">
    <q-card-section>
      <div class="text-h6">{{ $t('settings_for') }} {{ currentAssistant.name }}</div>
    </q-card-section>
    <q-card-section>
      <q-input v-model="currentName" type="text" :label="$t('assistant_name')" />
      <q-input v-model="currentPrompt" type="textarea" :label="$t('assistant_prompt')" />
    </q-card-section>
    <q-card-section class="row no-wrap items-center">
      <q-btn flat dense padding="xs md" :label="$t('cancel')" v-close-popup />
      <q-space />
      <q-btn dense padding="xs md" @click="updatePrompt" :label="$t('confirm')" color="primary" v-close-popup />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAIStore } from 'src/stores/ai.js';

const props = defineProps(['assistantId']);
const aiStore = useAIStore();
const currentAssistant = computed(() => aiStore.assistants.find(a => a.id === props.assistantId));
const currentPrompt = ref(currentAssistant.value ? currentAssistant.value.prompt : '');
const currentName = ref(currentAssistant.value ? currentAssistant.value.name : '');
watch(currentAssistant, (newAssistant) => {
  currentPrompt.value = newAssistant ? newAssistant.prompt : '';
  currentName.value = newAssistant ? newAssistant.name : '';
});

async function updatePrompt() {
  if (currentAssistant.value) {
    const params = {
      name: currentName.value,
      prompt: currentPrompt.value
    }
    aiStore.updateAssistant(currentAssistant.value.id, params);
  }
}
</script> 