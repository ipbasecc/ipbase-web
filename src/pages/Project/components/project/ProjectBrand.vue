<template>
  <div
    v-if="projectStore.project?.id"
    class="row no-wrap gap-md items-center font-medium q-pa-sm cursor-pointer"
  >
    <span class="text-no-wrap">{{ projectStore.project?.name }}</span>
    <q-icon name="expand_more" />
    <q-menu class="radius-sm shadow-12">
      <q-list bordered class="radius-sm q-pa-sm column gap-xs">
        <ProjectsList />
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import useProjectStore from "src/stores/project.js";
import ProjectsList from "src/pages/Project/components/project/widgets/ProjectsList.vue";

const projectStore = useProjectStore();
</script>

<style lang="scss" scoped></style>
