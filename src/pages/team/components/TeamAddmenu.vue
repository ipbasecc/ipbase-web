<template>
  <q-menu v-bind="$attrs" class="radius-sm">
    <q-list
      bordered
      dense
      class="radius-sm q-pa-xs"
      :class="$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-white text-grey-10'"
    >
      <q-item
        clickable
        v-close-popup
        class="radius-xs"
        @click="openCreateChannel = true"
      >
        <q-item-section side>
          <q-icon name="forum" />
        </q-item-section>
        <q-item-section class="q-pr-md">新建频道</q-item-section>
      </q-item>
      <q-item
        v-if="!openCreateChannel"
        clickable
        v-close-popup
        class="radius-xs"
        @click="createProject()"
      >
        <q-item-section side>
          <q-icon name="mdi-trello" />
        </q-item-section>
        <q-item-section class="q-pr-md">新建项目</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <q-dialog v-model="openCreateProject" persistent>
    <CreateProject @projectCreated="projectCreated" />
  </q-dialog>
  <q-dialog v-model="openCreateChannel" persistent>
    <CreateChannel @closePopup="closePopup" />
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import CreateProject from "./CreateProject.vue";
import CreateChannel from "./CreateChannel.vue";

const openCreateChannel = ref(false);

const openCreateProject = ref(false);
const createProject = async () => {
  openCreateProject.value = true;
};
const projectCreated = (val) => {
  teamStore.team.projects =
    teamStore.team.projects?.length > 0
      ? [...teamStore.team.projects, val]
      : [val];
  openCreateProject.value = false;
};

const closePopup = () => {
  openCreateChannel.value = false;
}

</script>

<style lang="scss" scoped></style>
