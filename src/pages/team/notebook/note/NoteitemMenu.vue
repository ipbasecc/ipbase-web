<template>
    <q-item-section side>
        <q-btn flat round dense size="sm" icon="mdi-dots-vertical">
            <q-menu class="radius-sm no-padding">
                <q-list bordered class="radius-sm q-pa-xs">
                    <q-item class="no-padding">
                        <q-input v-model="update_params.data.title" type="text" dense square filled
                        @keydown.enter="updateNote" @keydown.esc="cancelUpdate">
                            <template #append>
                                <q-btn flat round dense size="sm" :icon="icon"
                                @click="updateNote" />
                            </template>
                        </q-input>
                    </q-item>
                    <q-separator />
                    <q-item clickable :v-close-popup="confirmDelete" class="q-pa-xs radius-xs q-mt-xs" @click="deleteNote">
                        <q-item-section class="q-px-sm" :class="confirmDelete ? 'bg-red text-white' : ''">{{ $t('delete') }}</q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </q-item-section>
</template>
<script setup>
import {ref, computed} from 'vue'
import { updateDocument, deleteDocument } from 'src/api/strapi/project.js'

const { note } = defineProps(['note'])
const emit = defineEmits(['cancelUpdate', 'updated', 'deleted'])
const update_params = ref({
    data: {
        title: note?.title,
    }
})
const icon = computed(() => update_params.value?.data?.title !== note.title ? 'mdi-check' : 'mdi-plus')

const updateNote = async () => {
    const { data } = await updateDocument(note.id, update_params.value)
    if(data){        
        emit('updated', data)
    }
}

const cancelUpdate = () => {
    emit('cancelUpdate')
}

const deleteNote = async () => {
    const { data } = await deleteDocument(note.id)
    if(data){
        emit('deleted', data)
    }
}

</script>