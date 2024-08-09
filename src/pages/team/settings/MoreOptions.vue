<template>
  <div class="q-pa-md">
    <q-list class="q-pa-sm">
      <q-item
        v-if="useAuths('delete', ['project'])"
        clickable
        v-ripple
        v-close-popup
        @click="deleteProjectFn('archive')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section class="q-pr-lg">{{ $t('archive_project') }}</q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('delete', ['project'])"
        clickable
        v-ripple
        @click="deleteProjectFn('delete')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="close" />
        </q-item-section>
        <q-item-section class="q-pr-lg">{{ $t('delete_project') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { deleteProject } from "src/api/strapi/project.js";

import { deleteProjectCache } from "src/hooks/project/useProcess.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";

const emit = defineEmits(["projectDeleted"]);
const router = useRouter();
const deleteProjectFn = async (option) => {
  await deleteProjectCache(teamStore.project.id);

  let res = await deleteProject(teamStore.project.id, option);
  if (res?.data) {
    uiStore.project_settings = false;
    teamStore.team.projects = teamStore.team.projects.filter(i => i.id !== teamStore.project.id);
    teamStore.project.$reset_project;
    await router.push("/teams");
  }
};
</script>
