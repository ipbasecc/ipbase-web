<template>
    <q-item class="radius-xs no-padding">
        <q-input v-model="create_params.data.name" type="text" autofocus dense filled square
        class="full-width"
        @keydown.enter="createNotebookFn()"
        @keydown.esc="cancelCreateFn()">
            <template #append>
                <q-btn flat round dense size="sm" :icon="create_params.data.name ? 'mdi-check' : 'mdi-plus'" @click="createNotebookFn()" />
            </template>
        </q-input>
    </q-item>
</template>
<script setup>
import { ref, watchEffect } from "vue";
import { teamStore } from "src/hooks/global/useStore";
import { createNotebook } from "src/api/strapi/notebook";

const emit = defineEmits(['cancelCreate', 'created']);

const notebooks = ref([]);
watchEffect(() => {
    notebooks.value = teamStore.init.notebooks || [];
})

const create_params = ref({
    data: {
        name: '',
        color: ''
    }
})
const createNotebookFn = async () => {
    const data = await createNotebook(create_params.value);
    console.log(data);
    emit('created', data);
}
const cancelCreateFn = () => {
    emit('cancelCreate');
}
</script>

<style scoped>
</style>