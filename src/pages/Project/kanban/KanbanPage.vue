<template>
  <q-layout view="lHr LpR lFr" container>
    <q-header class="transparent">
      <q-bar
        class="transparent border-bottom gap-sm q-pr-none overflow-hidden"
        style="height: 2.3rem"
      >
        <q-space />
        <q-btn-group
          v-if="projectStore?.kanban?.type === 'kanban'"
          flat
          class="border"
        >
          <q-btn
            dense
            padding="4px 10px"
            label="看板"
            icon="view_kanban"
            :color="view_model === 'kanban' ? 'primary' : ''"
            :class="
              view_model === 'kanban'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
            @click="set_view_model('kanban')"
          />
          <q-btn
            dense
            padding="4px 10px"
            label="列表"
            icon="format_list_bulleted"
            :color="view_model === 'list' ? 'primary' : ''"
            :class="
              view_model === 'list'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
            @click="set_view_model('list')"
          />
          <q-btn
            dense
            padding="4px 10px"
            label="四象限"
            icon="border_inner"
            :color="view_model === 'quadrant' ? 'primary' : ''"
            :class="
              view_model === 'quadrant'
                ? 'text-white'
                : $q.dark.mode
                ? 'text-grey-3'
                : 'text-grey-10'
            "
            @click="set_view_model('quadrant')"
          />
        </q-btn-group>
        <q-btn
          flat
          dense
          icon="task_alt"
          :class="projectStore.PrivateTodo ? '' : 'op-5'"
          :color="projectStore.PrivateTodo ? 'positive' : ''"
          @click="projectStore.PrivateTodo = !projectStore.PrivateTodo"
        />
        <q-input
          v-model="projectStore.filter_txt"
          type="text"
          flat
          dense
          filled
          square
          class="no-padding"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-bar>
    </q-header>
    <q-drawer
      v-if="projectStore.kanban"
      v-model="projectStore.PrivateTodo"
      side="right"
      class="border-right q-pl-xs"
      :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
      :width="400"
    >
      <TodoPage :kanban_id="projectStore.kanban?.id" />
    </q-drawer>

    <q-page-container>
      <q-page :class="$q.dark.mode ? '' : 'bg-grey-4'">
        <KanbanModel
          v-if="kanban_idRef"
          :project_id="project_id"
          :kanban_id="kanban_idRef.toString()"
          :view_model="view_model"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, toRefs, watch } from "vue";
import useProjectStore from "src/stores/project.js";
import { useRouter, useRoute } from "vue-router";

import KanbanModel from "src/pages/Project/kanban/KanbanModel.vue";
import TodoPage from "src/pages/Project/todo/TodoPage.vue";

import localforage from "localforage";

const props = defineProps({
  proj_id: {
    type: String,
    default: "",
  },
  kanban_id: {
    type: String,
    default: "",
  },
});
const { proj_id: project_id, kanban_id: kanban_idRef } = toRefs(props);
const view_model = ref();
const set_view_model = async (val) => {
  if (!kanban_idRef.value) return;
  view_model.value = val;
  await localforage.setItem(`__kanban_${kanban_idRef.value}_view_model`, val);
};

watch(
  kanban_idRef,
  async () => {
    if (kanban_idRef.value) {
      let res = await localforage.getItem(
        `__kanban_${kanban_idRef.value}_view_model`
      );
      if (res) {
        view_model.value = res;
      } else {
        set_view_model("kanban");
      }
    }
  },
  { immediate: true, deep: false }
);

const projectStore = useProjectStore();
projectStore.navigation = "kanban";

const route = useRoute();
const router = useRouter();
const find_lastKanban = async (project_id) => {
  // console.log('find_lastKanban');
  if (route.params?.kanban_id || kanban_idRef.value) return;
  let res = await localforage.getItem(
    `___last_kanban_of_project_${project_id}`
  );
  if (res?.id && !projectStore.inChat) {
    console.log(res);
    router.push(`/projects/${projectStore.project.id}/kanban/${res.id}`);
  }
};
find_lastKanban(projectStore.project?.id);
</script>
