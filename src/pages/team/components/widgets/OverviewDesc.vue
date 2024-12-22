<template>
  <div
    v-if="auth"
    class="full-width relative-position"
    style="min-height: 24px"
    @dblclick="change_ing = true"
  >
    <div
      v-if="change_ing"
      class="q-pa-xs radius-xs border absolute-top z-fab bg-grey-10 full-width shadow-12"
    >
      <q-input
        v-model="_input_text"
        dense
        square
        filled
        autofocus
        :placeholder="belonged?.description"
        type="text"
        @keyup.esc="change_ing = false"
        @blur="updateProjectFn"
        @keyup.enter="updateProjectFn"
      >
        <template v-slot:append>
          <q-btn dense flat round icon="add" @click="updateProjectFn" />
        </template>
      </q-input>
    </div>
    <div v-else style="min-height: 24px" @dblclick="change_ing = true">
      <span
        v-if="belonged?.description"
        class="font-large font-bold-600 relative-position"
        >{{ belonged?.description }}</span
      >
      <span v-else class="op-5 font-medium">{{ $t('doubel_click_add_desc')}}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef, computed } from "vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { teamStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
  auth: {
    type: Boolean,
    default: false,
  },
});

const wasAttached_toRef = toRef(props, "wasAttached_to");
// const belonged = ref();
const belonged = computed(() =>
  wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card
);

const change_ing = ref(false);
const _input_text = ref("");
const params = ref({});

const updateProjectFn = async () => {
  if (
    _input_text.value === belonged.value?.description ||
    _input_text.value === ""
  ) {
    change_ing.value = false;
    return;
  }
  params.value = {
    data: {
      description: _input_text.value,
    }
  };

  let res;
  if (wasAttached_toRef.value === "project") {
    res = await updateProject(belonged.value.id, params.value);
    if (res) {
      
    }
  }
  if (wasAttached_toRef.value === "card") {
    res = await updateCard(belonged.value.id, params.value);
    if (res) {
      return res?.data
    }
  }
};
</script>
