<template>
    <div class="absolute-full column no-wrap" :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'">
        <q-toolbar class="transparent border-bottom">
            <q-btn flat dense :icon="togglerIcon" @click="toggleList()" />
        </q-toolbar>
        <q-scroll-area class="q-space q-pa-xs">
            <q-list v-if="targetList === 'notebooks'" dense class="column no-wrap gap-xs">
                <template v-if="notebooks?.length > 0">
                    <q-item clickable v-ripple v-for="notebook in notebooks" :key="notebook.id"
                    class="radius-xs hovered-item" @click="enterNotebook(notebook.id)">
                        <q-item-section>{{ notebook.name }}</q-item-section>
                        <NotebookItemMenu class="hover-show transition" :notebook="notebook" @cancelUpdate="cancelUpdateFn"
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
            <NoteList v-else :notebook_id />
        </q-scroll-area>
    </div>
</template>
<script setup>
import { ref, watchEffect } from "vue";
import { teamStore, uiStore } from "src/hooks/global/useStore";
import CreateNotebook from './CreateNotebook.vue'
import NotebookItemMenu from './NotebookItemMenu.vue'
import { useRouter, useRoute } from 'vue-router';
import NoteList from './note/NoteList.vue'

const router = useRouter();
const route = useRoute();
const notebooks = ref([]);

const targetList = ref('notebooks')
const togglerIcon = ref('mdi-book-open-variant')
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
const toggleList = () => {
    if(teamStore.notebook){
        targetList.value = targetList.value === 'notebooks' ? 'note' : 'notebooks'
    } else {
        targetList.value = 'notebooks'
    }
    togglerIcon.value = targetList.value === 'notebooks' ? 'mdi-note-multiple-outline' : 'mdi-book-open-page-variant'
}
const notebook_id = ref()
const enterNotebook = (id) => {
    if(disableEnter.value) return
    targetList.value = 'note'
    if(uiStore.app !== 'notebooks') {
        notebook_id.value = id;
        return
    };
    const { note_id } = route.params;
    if(!note_id){
        router.push(`/notebooks/${id}`);
    }
}
</script>

<style scoped>
</style>