<template>
    <div :style="`flex: 0 0 ${uiStore.columnWidth}px`">
        <div v-if="new_column_ing" class="q-pa-xs q-mb-xl radius-xs border">
          <q-input v-model="params.data.name"
            :placeholder="`${$t('create_person_todogroup')}`"
            dense square filled autofocus type="text"
            @keyup.enter="createColumnFn"
            @keyup.esc="new_column_ing = false"
          >
            <template v-slot:append>
              <q-btn v-if="params.data.name" dense flat size="sm" round icon="add"
                @click="createColumnFn"
              />
              <q-btn v-else dense flat size="sm" round icon="close"
                @click="new_column_ing = false"
              />
            </template>
          </q-input>
        </div>
        <div v-else
          :class="`${ $q.dark.mode ? 'text-grey-1' : 'text-grey-10' }`"
          class="q-px-xs q-pt-xs q-pb-xl cursor-pointer transition font-medium hover-highlight-lg"
          @click="new_column_ing = true"
        >
          {{ $t('create_person_todogroup') }}
        </div>
    </div>
</template>

<script setup>
import { uiStore, userStore } from 'src/hooks/global/useStore';
import { ref } from 'vue'
import { createTodogroup } from "src/api/strapi/project.js";

const { kanban, card } = defineProps(['kanban','card']);
const emit = defineEmits(['todogroupCreated']);

const new_column_ing = ref(false);

const params = ref({
  data: {
    name: "",
  },
});
const loading = ref(false);
const createColumnFn = async () => {
  if (loading.value) return;
  loading.value = true;
  if (!params.value.data.name) {
    new_column_ing.value = false;
    loading.value = false;
    return;
  }
  if (kanban) {
    params.value.kanban_id = kanban.id;
  }
  if (card) {
    params.value.card_id = card.id;
  }
  // console.log("params.value", params.value);
  let res = await createTodogroup(params.value);
  if (res?.data) {
    emit('todogroupCreated', res.data);
    params.value.data.name = "";
    new_column_ing.value = false;
    loading.value = false;
  }
}
</script>

<style scoped>
</style>