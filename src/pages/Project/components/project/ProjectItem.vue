<template>
  <q-item
    clickable
    class="hovered-item radius-xs"
    :class="projectStore.project?.id === project.id ? 'bg-primary' : ''"
  >
    <q-item-section top side>
      <q-avatar square class="radius-xs">
        <q-img
          :src="default_overview?.media?.url"
          :ratio="1"
          spinner-color="primary"
          spinner-size="22px"
          class="radius-xs"
        />
      </q-avatar>
    </q-item-section>
    <q-item-section @click="enterProject(project.id)" class="q-pr-lg">
      <q-item-label>{{ project.name }}</q-item-label>
      <q-item-label caption lines="2" class="op-5">{{
        project.description
      }}</q-item-label>
    </q-item-section>
    <div
      v-if="unconfirmed"
      class="absolute-full z-max"
      @mouseenter="refetchProjects"
    >
      <q-tooltip class="no-padding transparent">
        <q-card bordered>
          <q-card-section class="font-medium">
            您已经加入了该项目，请等待项目管理员审核
          </q-card-section>
        </q-card>
      </q-tooltip>
    </div>
  </q-item>
</template>

<script setup>
import { ref, toRef, watchEffect } from "vue";
import useProjectStore from "src/stores/project.js";
import { computed } from "vue";
const projectStore = useProjectStore();

const props = defineProps({
  project_item: {
    type: Object,
    default() {
      return {};
    },
  },
});

const project = toRef(props, "project_item");
const unconfirmed = computed(() => project.value.unconfirmed);
const default_overview = ref();
watchEffect(() => {
  if (project.value?.overviews) {
    default_overview.value =
      project.value.overviews.find(
        (i) => i.version === project.value.default_version
      ) || project.value.overviews[0];
  }
});
const emit = defineEmits(["enterProject", "refetchProjects"]);
const enterProject = (id) => {
  if (unconfirmed.value) return;
  emit("enterProject", id);
};
// 管理人员可能随时通过加入请求
// 所以设置当鼠标进入到“待确认”加入的项目条目上时，就重新请求以下项目列表
// 更新当前项目是不是“unconfirmed”
const refetchProjects = () => {
  emit("refetchProjects");
};
</script>

<style lang="scss" scoped></style>
