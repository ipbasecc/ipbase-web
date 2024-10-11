<template>
    <q-item class="radius-xs no-padding">
        <q-input v-model="create_params.data.title" type="text" autofocus dense filled square
        class="full-width"
        @keydown.enter="createNote()"
        @keydown.esc="cancelCreateFn()">
            <template #append>
                <q-btn flat round dense size="sm" :icon="create_params.data.title ? 'mdi-check' : 'mdi-plus'" @click="createNote()" />
            </template>
        </q-input>
    </q-item>
</template>
<script setup>
import { ref, watchEffect } from "vue";
import { teamStore } from "src/hooks/global/useStore";
import { createDocument } from 'src/api/strapi/project.js'

const emit = defineEmits(['cancelCreate', 'created']);

const notebooks = ref([]);

const create_params = ref({
    notebook_id: teamStore.notebook?.id,
    data: {
        title: '',
    }
})
watchEffect(() => {
    notebooks.value = teamStore.init.notebooks || [];
    if(teamStore.navigation === 'classroom' && teamStore.card){
         create_params.value.data.by_course = teamStore.card.id;
    }
})
const createNote = async () => {
    const { data } = await createDocument(create_params.value);
    emit('created', data);
}
const cancelCreateFn = () => {
    emit('cancelCreate');
}
</script>

<style scoped>
</style>