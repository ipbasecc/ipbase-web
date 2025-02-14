<template>
    <q-list dense class="column no-wrap gap-xs">
        <template v-if="notes?.length > 0">
            <q-item clickable v-ripple v-for="note in notes" :key="note.id"
            class="radius-xs hovered-item"
            :class="teamStore.note?.id === note.id ? 'border active-listitem' : 'border-placeholder op-7'"
             @click="enterNote(note.id)"
           >
                <q-item-section >{{ note.title }}</q-item-section>
                <NoteitemMenu class="hover-show transition" :note="note" @updated="updated" @deleted="deleted" @mouseenter="disableEnter = true" @mouseleave="disableEnter = false" />
            </q-item>
        </template>
        <q-item v-if="!creating" clickable v-ripple class="radius-xs hovered-item" @click="creating = true">
            <q-item-section side>
                <q-icon name="mdi-plus" />
            </q-item-section>
            <q-item-section class="hover-show transition">
                {{ $t('create_note') }}
            </q-item-section>
        </q-item>
        <CreateNote v-if="creating" @created="created" @cancelCreate="cancelCreate" />
    </q-list>
</template>
<script setup>
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { teamStore, uiStore } from "src/hooks/global/useStore";
import CreateNote from './CreateNote.vue'
import NoteitemMenu from './NoteitemMenu.vue'
import { useRouter } from 'vue-router';
import { getNotebook } from "src/api/strapi/notebook";

const { notebook_id } = defineProps(['notebook_id'])

const router = useRouter();

const notes = ref([]);
const _notebook_id = computed(() => notebook_id);
watch(_notebook_id, async() => {
    if(_notebook_id.value){
        teamStore.notebook = await getNotebook(_notebook_id.value);
        notes.value = teamStore.notebook?.documents || [];
    }
},{immediate: true})

const creating = ref(false);
const disableEnter = ref(false);
const enterNote = async (note_id) => {
    
    if(disableEnter.value) return
    if(uiStore.app === 'notebooks'){
        await router.push(`/notebooks/${teamStore.notebook?.id}/${note_id}`)
    } else {
        uiStore.active_note_id = note_id;
    }
}
onMounted(() => {
    if(teamStore.note && teamStore.notebook){
        setTimeout(() => {
            enterNote(teamStore.note?.id)
        },15)
    }
})

const created = (val) => {
    notes.value.push(val);
    creating.value = false;
}

const updated = (val) => {
    const index = teamStore.notebook?.documents.findIndex(i => i.id === val.id)
    if(index > -1){
        Object.keys(val).forEach(key => {
            if (key in teamStore.notebook.documents[index]) {
                teamStore.notebook.documents[index][key] = val[key];
            }
        });
    }
}
const cancelCreate = () => {
    creating.value = false;
}

const deleted = (val) => {
    const index = teamStore.notebook?.documents.findIndex(i => i.id === val.removed)
    if(index > -1){
        teamStore.notebook.documents.splice(index, 1);
    }
    if(teamStore.note?.id === val.removed){
        teamStore.note = null
        router.push(`/notebooks/${teamStore.notebook?.id}`)
    }
}
</script>