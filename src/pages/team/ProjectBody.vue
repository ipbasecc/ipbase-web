<template>
  <div class="absolute-full flex flex-center">
    <RouterView v-if="project_id" :key="project_id"></RouterView>
    <BgBrand v-else></BgBrand>
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  provide,
  watch
} from "vue";
import { useRouter } from "vue-router";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import {
  getProjectCache,
  fetchProject,
  putProjectCache,
} from "src/hooks/project/useProcess.js";

import { teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  project_id: {
    type: String,
    default: null,
  },
});
const { project_id } = toRefs(props);
const emit = defineEmits(["openLeftDrawer"]);
provide("isExternal", false);
const router = useRouter();

const project = ref();
const loading = ref(false);
const getProject = async (_id) => {
  if (loading.value) return;
  loading.value = true;
  const cache = await getProjectCache(_id);
  if (cache) {
    project.value = cache;
    teamStore.project = cache;
  }
  const fetch = await fetchProject(_id);
  if (fetch) {
    project.value = fetch;
    teamStore.project = fetch;
    await putProjectCache(fetch);
  } else {
    projectRemoved.value = true;
    projectRemovedFn();
  }
  loading.value = false;
  teamStore.mm_channel = teamStore.project?.mm_channel;
};
watch(() => project_id.value, () => {
  getProject(project_id.value);
  teamStore.mm_channel = project.value?.mm_channel
}, { immediate: true })

const projectRemoved = ref(false);
const projectRemovedFn = () => {
  setTimeout(() => {
    teamStore.need_refecth_projects = true;
    projectRemoved.value = false;
    teamStore.project = null;
    router.push("/teams");
  }, 3000);
};
</script>

<style lang="scss"></style>
