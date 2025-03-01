<template>
  <div>
    <q-list v-if="assistants.length > 0" class="column gap-xs">
      <q-item v-for="assistant in assistants" :key="assistant.id" clickable
        class="radius-md hovered-item"
        :class="{ 'active-listitem': assistant.id === aiStore.selectedAssistant }"
        @click="selectAssistant(assistant.id)"
      >
        <q-item-section>{{ assistant.name === 'default_assistant' ? $t('default_assistant') : assistant.name }}</q-item-section>
        <q-item-section side class="hover-show">
          <q-btn icon="mdi-dots-vertical" flat dense size="sm" round>
            <q-menu class="no-padding radius-sm shadow-24">
              <q-list dense bordered class="q-pa-xs radius-sm column gap-xs" style="min-width: 10rem;">
                <q-item clickable v-close-popup class="radius-xs" @click.stop="aiStore.listToggler = 'topics'">
                  <q-item-section side>
                    <q-icon name="mdi-login-variant" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('enter_topic') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced class="op-5" />
                <q-item clickable v-close-popup class="radius-xs" @click.stop="openSettings(assistant.id)">
                  <q-item-section side>
                    <q-icon name="mdi-pencil" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('edit') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup class="radius-xs" @click.stop="clearSessions(assistant.id)">
                  <q-item-section side>
                    <q-icon name="mdi-broom" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('clear_topic') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <template v-if="assistants.length > 1">
                  <q-separator spaced class="op-5" />
                  <q-item clickable v-close-popup class="radius-xs text-negative" @click.stop="deleteAssistant(assistant.id)">
                    <q-item-section side>
                      <q-icon name="mdi-delete" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('delete') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-btn flat rounded icon="mdi-plus"
        :label="$t('add_assistant')" class="q-mt-sm hover-highlight"
        @click="showAddAssistantDialog" align="left" no-caps
      />
    </q-list>
    <q-dialog v-model="addAssistantDialog" persistent>
      <q-card bordered style="min-width: 400px;">
        <q-card-section>
          {{ $t('add_assistant') }}
        </q-card-section>
        <q-card-section>
          <q-input v-model="newAssistantName" type="text" :label="$t('assistant_name')" />
          <q-input v-model="newAssistantPrompt" type="textarea" :label="$t('assistant_prompt')" />
        </q-card-section>
        <q-card-actions class="row justify-end gap-xs q-pa-sm">
          <q-btn dense flat padding="xs md" @click="addAssistantDialog = false" :label="$t('cancel')" />
          <q-space />
          <q-btn dense padding="xs md" @click="addAssistant" :label="$t('add')" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="settingsDialog" persistent>
      <AssistantSettings :assistant-id="selectedAssistantId" @close="settingsDialog = false" />
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAIStore } from '../../../stores/ai';
import AssistantSettings from './AssistantSettings.vue'
import { uid } from 'quasar';

const aiStore = useAIStore();
const assistants = computed(() => aiStore.assistants);
const addAssistantDialog = ref(false);
const newAssistantName = ref('');
const newAssistantPrompt = ref('');
const settingsDialog = ref(false);
const selectedAssistantId = ref(null);

function selectAssistant(assistantId) {
  aiStore.setSelectedAssistant(assistantId);
}

function showAddAssistantDialog() {
  addAssistantDialog.value = true;
}

function openSettings(assistantId) {
  selectedAssistantId.value = assistantId;
  settingsDialog.value = true;
}

async function addAssistant() {
  const newAssistant = {
    id: uid(), // Simple ID generation
    name: newAssistantName.value,
    prompt: newAssistantPrompt.value,
  };
  aiStore.addAssistant(newAssistant);
  newAssistantName.value = '';
  newAssistantPrompt.value = '';
  addAssistantDialog.value = false;
}

function deleteAssistant(assistantId) {
  aiStore.deleteAssistant(assistantId);
}

function clearSessions(assistantId) {
  aiStore.clearSessionsForAssistant(assistantId);
}
</script> 