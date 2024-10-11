<template>
    <q-item-section side>
        <q-btn flat round dense size="sm" icon="mdi-dots-vertical">
            <q-menu class="radius-sm no-padding">
                <q-list bordered class="radius-sm q-pa-xs">
                    <q-item class="no-padding">
                        <q-input v-model="update_params.data.name" type="text" dense square filled
                        @keydown.enter="updateNotebookFn" @keydown.esc="cancelUpdate">
                            <template #append>
                                <q-btn flat round dense size="sm" :icon="icon"
                                @click="updateNotebookFn" />
                            </template>
                        </q-input>
                    </q-item>
                    <q-separator />
                    <q-item clickable :v-close-popup="confirmDelete" class="q-pa-xs radius-xs q-mt-xs" @click="deleteNotebookFn">
                        <q-item-section class="q-px-sm" :class="confirmDelete ? 'bg-red text-white' : ''">{{ $t('delete') }}</q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </q-item-section>
</template>
<script setup>
import {ref, computed} from 'vue'
import { updateNotebook, deleteNotebook } from "src/api/strapi/notebook";

const emit = defineEmits(['cancelUpdate', 'updated', 'deleted']);

const { notebook } = defineProps(['notebook'])
const update_params = ref({
    data: {
        name: notebook.name
    }
})
const icon = computed(() => update_params.value?.data?.name !== notebook.name ? 'mdi-check' : 'mdi-plus')

const updateNotebookFn = async () => {
    const data = await updateNotebook(notebook.id, update_params.value);
    if(data) {
        emit('updated', data);
    }
}
const cancelUpdate = () => {
    emit('cancelUpdate');
}

const confirmDelete = ref(false);
const deleteNotebookFn = async () => {
    if(confirmDelete.value) {
        const data = await deleteNotebook(notebook.id);
        if(data) {
            emit('deleted', data);
        }
    } else {
        confirmDelete.value = true;
    }
}
</script>