<template>
    <q-card bordered style="width: 32rem;">
      <q-card-section class="row items-center gap-xs q-py-xs q-px-sm border-bottom">
        <q-icon name="auto_awesome" />
        <span>Agent!</span>
        <q-space />
        <q-btn v-if="response && !loading" color="positive" dense size="sm" flat round icon="check" @click="insert()" />
      </q-card-section>
      <q-card-section v-if="response">
        {{ response }}
      </q-card-section>
      <q-card-section v-else class="q-pa-none">
        <q-input v-model="inputMessage" autofocus dense borderless type="textarea"
            input-class="q-px-md" placeholder="Ask me anything..."
         />
      </q-card-section>
      <q-card-section class="row items-center gap-xs q-py-xs q-px-sm border-top">

        <q-btn dense no-caps flat padding="none sm" :label="aiStore.model">
          <q-menu class="tansparent radius-sm">
            <q-list dense bordered class="q-pa-xs column gap-xs radius-sm" style="min-width: 100px">
                <template v-for="provider in availableProviders" :key="provider.name">
                    <q-item-label class="q-px-sm op-5 unselected">{{ provider.name }}</q-item-label>
                    <div class="op-5 q-my-xs border-bottom" />
                    <q-item v-for="model in provider.activeModels" :key="model"
                        clickable v-close-popup class="radius-xs"
                        @click="setModel(provider, model)"
                    >
                        <q-item-section>{{ model }}</q-item-section>
                    </q-item>
                </template>
            </q-list>
          </q-menu>
        </q-btn>
        <q-space />
        <q-btn dense padding="xs md" color="primary" :loading="loading" :disable="loading" icon="send" @click="sendMessage('single')" />
      </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { aiStore } from 'src/hooks/global/useStore'
import { useChat } from 'src/pages/ai/composables/useChat'
import { onKeyStroke } from "@vueuse/core";
import { useQuasar } from 'quasar'

const emit = defineEmits(['insert'])
const $q = useQuasar()

const {
    signalSession,
    inputMessage,
    loading,
    sendMessage,
} = useChat()
const availableProviders = computed(() => aiStore.availableProvidersWithModels)
const response = computed(() => signalSession.value?.messages?.length > 0 ? signalSession.value.messages[signalSession.value.messages.length - 1].content : '')

const setModel = (provider, model) => {
    aiStore.setProvider(provider.name)
    aiStore.setModel(model)
}
defineExpose({
    signalSession
})

const insert = () => {
    emit('insert', response.value)
}

const ControlKey = computed(() => {
  return $q.platform.is.mac ? "metaKey" : "ctrlKey"; // todo，这里需要验证meteKey是否正确
})
onKeyStroke([ControlKey.value, "Enter"], (e) => {
    if(loading.value) return;
    // console.log('onKeyStroke Tiptap', e);
    if (e[ControlKey.value] && e.key === 'Enter') {
        e.preventDefault();
        if(!response.value){
            sendMessage('single')
        } else {
            insert();
        }
    }
});


</script>

<style scoped>
</style>