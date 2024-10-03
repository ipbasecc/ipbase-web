<template>
  <div
    v-if="auth"
    class="font-large font-bold-600 relative-position hovered-item"
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
        :placeholder="belonged?.name"
        type="text"
        @keyup.esc="change_ing = false"
        @blur="updateNameFn"
        @keyup.enter="updateNameFn"
      >
        <template v-slot:append>
          <q-btn dense flat round icon="check" @click="updateNameFn" />
        </template>
      </q-input>
    </div>
    <template v-else>
      <span class="row no-wrap items-center gap-md">
        <span
          >{{ belonged?.name }}
          <q-tooltip
            class="bg-black text-white"
            anchor="top middle"
            self="bottom middle"
          >
            {{ $t('doubel_click_rename') }}
          </q-tooltip>
        </span>
        <q-icon
          name="edit"
          class="cursor-pointer hover-show transition"
          @click="change_ing = true"
        />
      </span>
    </template>
  </div>
  <div
    v-else
    class="font-large font-bold-600 relative-position"
    style="min-height: 24px"
    @dblclick="change_ing = true"
  >
    <span>{{ belonged?.name }}</span>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect } from "vue";
import { updateProject, updateCard } from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";
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
const belonged = ref();
watchEffect(() => {
  belonged.value =
    wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card;
});

const change_ing = ref(false);
const _input_text = ref("");
const params = ref({});

const updateNameFn = async () => {
  change_ing.value = false;
  let _ =
    wasAttached_toRef.value === "project"
      ? belonged.value?.name
      : teamStore.card?.name;
  if (_input_text.value === _ || !_input_text.value) {
    change_ing.value = false;
    return;
  }
  params.value = {
    data: {
      name: _input_text.value,
    }
  };
  let res;
  if (wasAttached_toRef.value === "project") {
    try {
      res = await updateProject(belonged.value.id, params.value);
      if (res?.data) {
        // teamStore.project.name = _input_text.value
      }
    } catch (error) {
      console.log(error);
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
