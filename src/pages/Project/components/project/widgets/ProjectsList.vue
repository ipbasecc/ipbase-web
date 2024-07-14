<!-- 项目页面顶部快速切换项目页面 -->
<template>
  <ProjectItem
    v-for="i in projectStore?.projects"
    :key="i.id"
    :project_item="i"
    @enterProject="enterProject"
    class="q-px-sm"
  />
</template>

<script setup>
import ProjectItem from "src/pages/Project/components/project/ProjectItem.vue";
import useProjectStore from "src/stores/project.js";
import { useRouter } from "vue-router";

const projectStore = useProjectStore();
const router = useRouter();

const enterProject = async (id) => {
  projectStore.$reset_project();
  projectStore.project_id = id;
  router.push(`/projects/${id}`);
};
</script>

<style lang="scss" scoped></style>
