<template>
    <div :style="layout === 'row' ? `flex: 0 0 ${uiStore.columnWidth}px` : ''"
    :class="layout === 'row' ? '' : new_column_ing || dense ? 'fit' : 'fit flex flex-center'">
        <div v-if="new_column_ing" class="q-pa-xs radius-xs border"
          :class="layout === 'row' ? 'q-mb-xl' : 'full-width'"
        >
          <q-input v-model="params.data.name"
            :placeholder="`${$t('create_person_todogroup')}`"
            dense square filled autofocus type="text"
            @keyup.enter="createColumnFn"
            @keyup.esc="new_column_ing = false"
          >
            <template v-slot:append>
              <q-btn v-if="params.data.name" dense flat size="sm" round icon="mdi-plus"
                @click="createColumnFn"
              />
              <q-btn v-else dense flat size="sm" round icon="close"
                @click="new_column_ing = false"
              />
            </template>
          </q-input>
        </div>
        <q-btn v-else-if="dense && !card"
          dense rounded :padding="show_label ? 'xs md' : 'xs'" flat icon="mdi-plus" size="sm" class="undrag hover-show transition"
          :label="show_label ? _for === 'personal_kanbanTodo' ? $t('create_person_todogroup') : $t('create_todogroup') : ''"
          @mouseenter="show_label = true" @mouseleave="show_label = false"
          @click="new_column_ing = true"
        />
        <div v-else-if="createStyle === 'normal'"
          :class="`text-no-wrap
            ${ $q.dark.mode ? 'text-grey-1' : 'text-grey-10' }
            ${layout === 'row' ? 'q-pt-xs q-pb-xl' : ''}
          `"
          class="q-px-xs cursor-pointer transition font-medium hover-highlight-lg"
          @click="new_column_ing = true"
        >
          {{ _for === 'personal_kanbanTodo' ? $t('create_person_todogroup') : $t('create_todogroup')}}
        </div>
        <template v-else-if="createStyle === 'init_create'">
          <q-responsive v-if="!card" :ratio="16/9" class="full-width">
            <div class="flex flex-center">
              <q-btn flat icon="add"
                :label="_for === 'personal_kanbanTodo' ? $t('create_person_todogroup') : $t('create_todogroup')"
                class="border"
                @click="new_column_ing = true"
              />
            </div>
          </q-responsive>

          <q-btn v-else flat icon="add"
                :label="_for === 'personal_kanbanTodo' ? $t('create_person_todogroup') : $t('create_todogroup')"
                class="border"
                @click="new_column_ing = true"
              />
        </template>
    </div>
</template>

<script setup>
import { teamStore, uiStore, userStore } from 'src/hooks/global/useStore';
import { ref } from 'vue'
import { createTodogroup } from "src/api/strapi/project.js";

const { kanban, card, _for, createStyle, layout, dense } = defineProps(
  ['kanban','card', '_for', 'createStyle', 'layout', 'dense']
);
const emit = defineEmits(['todogroupCreated']);

const new_column_ing = ref(false);
const show_label = ref(false);

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
  if (_for === 'personal_kanbanTodo') {
    params.value.kanban_id = teamStore.card?.card_kanban?.id;
  }
  if (_for === 'personal_projectKanbanTodo') {
    params.value.kanban_id = teamStore.kanban?.id;
  }
  if (card && _for === 'card') {
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