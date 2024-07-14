<template>
  <div class="q-pa-md">
    <q-list class="q-pa-sm">
      <q-item v-if="!mm_projectChatService_team">
        <q-item-section>
          <q-item-label>
            <OtherSetting />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        v-close-popup
        @click="deleteProjectFn('archive')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section class="q-pr-lg">归档项目</q-item-section>
      </q-item>
      <q-item
        v-if="calc_auth('project', 'delete', 'project')"
        clickable
        v-ripple
        @click="deleteProjectFn('delete')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="close" />
        </q-item-section>
        <q-item-section class="q-pr-lg">删除项目</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { deleteProject } from "src/api/strapi/project.js";

import { computed } from "vue";

import OtherSetting from "src/pages/Chat/components/user/Settings/OtherSetting.vue";

import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";

import { deleteProjectCache } from "src/hooks/project/useProcess.js";

const emit = defineEmits(["projectDeleted"]);
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_projectChatService_team = computed(
  () => userStore.me?.mm_projectChatService_team
);
const router = useRouter();
const deleteProjectFn = async (option) => {
  await deleteProjectCache(projectStore.project.id);

  let res = await deleteProject(projectStore.project.id, option);
  if (res?.data) {
    emit("projectDeleted");
    router.push("/projects");
  }
};
</script>
