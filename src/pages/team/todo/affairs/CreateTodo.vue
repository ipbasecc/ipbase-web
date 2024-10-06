<template>
    <div class="border-info border-solid border-xs undrag gap-xs items-start no-wrap q-px-xs radius-xs row"
      :class="`
          ${$q.dark.mode ? 'bg-grey-9' : 'bg-white'}
          ${createtodo_params.data.status ? 'op-3' : ''}
      `"
    >
      <q-checkbox v-model="createtodo_params.data.status" dense class="q-mt-xs" />
      <InputDiv
          v-model="createtodo_params.data.content"
          :auth="card ? useAuths('create', authCollections) : uiStore.app === 'affairs'"
          baseClass="q-space q-pa-xs"
          :autofocus="true"
          :class="createtodo_params.data.status ? 'line-through' : ''"
          @update="createTodoFn"
          @ctrlEnter="createTodoFn"
          @ESC="cancelCreateFn"
      />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputDiv from 'src/components/Utilits/InputDiv.vue'
import { uiStore, teamStore } from 'src/hooks/global/useStore';
import { createTodo } from "src/api/strapi/project.js";
import { authCollections } from "./useAffairs.js";

const { group, card, after } = defineProps({
    group: {
        type: Object,
        required: true
    },
    card: {
        type: Object,
        required: false
    },
    after: {
        type: Object,
        required: false
    }
});
const emit = defineEmits(['created', 'cancelCreate']);
const createtodo_params = ref({
    todogroup_id: group.id,
    data: {
        status: false,
        content: null
    },
})
const loading = ref(false)
const createTodoFn = async () => {
    if(!createtodo_params.value.data.content || loading.value) return
    loading.value = true
    if(after){
        createtodo_params.value.after = after.id
    }
    if (teamStore.shareInfo) {
        createtodo_params.value.shareInfo = teamStore.shareInfo;
        createtodo_params.value.data.fingerprint = window.fingerprint;
    }
    const { data } = await createTodo(createtodo_params.value);
    if (data) {
        loading.value = false
        createtodo_params.value.data.content = null;
        emit('created', data)
    }
}

const cancelCreateFn = () => {
    createtodo_params.value.data.content = '';
    emit('cancelCreate')
}
</script>

<style scoped>
</style>