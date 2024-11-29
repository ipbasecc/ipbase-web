<template>
    <div class="absolute-full column no-wrap" :class="!$q.dark.mode && uiStore.app === 'notebooks' ? 'bg-primary-9 text-grey-1' : ''">
        <q-toolbar class="transparent border-bottom">
            <q-btn flat dense class="q-mr-sm" :icon="targetList !== 'notebooks' ? 'mdi-chevron-left' : 'mdi-book-open-page-variant'"
            @click="enterLibrary()" />
            <span v-if="notebook?.name && targetList !== 'notebooks'">{{ notebook.name }}</span>
        </q-toolbar>
        <KeepAlive>
            <q-scroll-area class="q-space q-pa-xs">
                <q-list v-if="targetList === 'notebooks'" dense class="column no-wrap gap-xs">
                    <template v-if="notebooks?.length > 0">
                        <q-item clickable v-ripple v-for="nb in notebooks" :key="nb.id"
                        class="radius-xs hovered-item" :class="nb.id === notebook?.id ? 'border active-listitem' : 'border-placeholder op-7'"
                        @click="enterNotebook(nb)">
                            <q-item-section>{{ nb.name }}</q-item-section>
                            <NotebookItemMenu class="hover-show transition" :notebook="nb" @cancelUpdate="cancelUpdateFn"
                            @updated="updated" @deleted="deletedFn" @mouseenter="disableEnter = true" @mouseleave="disableEnter = false" />
                        </q-item>
                    </template>
                    <q-item v-if="!creating" clickable v-ripple class="radius-xs hovered-item" @click="creating = true">
                        <q-item-section side>
                            <q-icon name="mdi-plus" />
                        </q-item-section>
                        <q-item-section class="hover-show transition">
                            {{ $t('create_notebook') }}
                        </q-item-section>
                    </q-item>
                    <CreateNotebook v-else @cancelCreate="creating = false" @created="createdFn" />
                </q-list>
                <NoteList v-else-if="notebook" :notebook_id="notebook.id" />
            </q-scroll-area>
        </KeepAlive>
    </div>
</template>
<script setup>
import { ref, watchEffect, onMounted } from "vue";
import { teamStore, uiStore } from "src/hooks/global/useStore";
import CreateNotebook from './CreateNotebook.vue'
import NotebookItemMenu from './NotebookItemMenu.vue'
import { useRouter, useRoute } from 'vue-router';
import NoteList from './note/NoteList.vue'

const router = useRouter();
const route = useRoute();
const notebooks = ref([]);

const targetList = ref('notebooks')
const disableEnter = ref(false)
watchEffect(() => {
    notebooks.value = teamStore.init.notebooks || [];
    if(teamStore.notebook){
        targetList.value = 'note'
    }
})
const creating = ref(false);
const createdFn = (data) => {
    notebooks.value.push(data);
    creating.value = false;
}
const cancelUpdateFn = () => {
    creating.value = false;
}
const updated = (val) => {
    const index = notebooks.value.findIndex(notebook => notebook.id === val.id);
    if (index !== -1) {
        Object.keys(val).forEach(key => {
            if (key in notebooks.value[index]) {
                notebooks.value[index][key] = val[key];
            }
        });
    }
}
const deletedFn = (val) => {
    notebooks.value = notebooks.value.filter(notebook => notebook.id !== val.id);
    if(teamStore.notebook?.id === val.id){
        teamStore.notebook = null;
        router.push(`/notebooks`)
    }
}
const enterLibrary = () => {
    targetList.value = 'notebooks'
    if(uiStore.app !== 'notebooks') {
        notebook.value = null;
    }
}
const notebook = ref()
const enterNotebook = (_notebook) => {
    if(disableEnter.value || !_notebook) return
    targetList.value = 'note'
    notebook.value = _notebook;
    if(uiStore.app === 'notebooks') {
        router.push(`/notebooks/${_notebook.id}`);
    }
}

onMounted(() => {
const { notebook_id, note_id } = route.params
    if(notebook_id || teamStore.notebook){
        const notebook = {
            id: notebook_id || teamStore.notebook?.id
        }
        enterNotebook(notebook)
    }
})
</script>

<style scoped>
</style>