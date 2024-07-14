<template>
  <q-header height-hint="98">
    <q-bar
      class="border-bottom items-center gap-xs"
      :class="
        $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-2 text-grey-10'
      "
      style="height: 40px"
    >
      <q-btn flat icon="menu" padding="xs" @click="toggleleftDrawerOpen" />
      <template v-if="projectStore.project">
        <ProjectBrand />
        <ProjectNavigation />
        <q-space />
        <MembersIndicator
          v-if="projectStore.project?.id"
          @click="toggleRightpannel"
        />
        <q-btn
          v-if="projectStore.project?.id"
          flat
          dense
          icon="more_vert"
          @click="project_settings = true"
        />
        <q-dialog
          v-model="project_settings"
          persistent
          position="top"
          transition-show="slide-down"
          transition-hide="slide-up"
        >
          <div class="q-pt-xl" style="min-width: 61dvw; min-height: 560px">
            <ProjectSetting @projectDeleted="projectDeleted" />
          </div>
        </q-dialog>
      </template>
      <q-space v-else />
      <q-btn
        flat
        dense
        icon="task_alt"
        :class="
          projectStore.rightDrawerOpen && rightDrawerRef === 'person_todos'
            ? ''
            : 'op-5'
        "
        :color="
          projectStore.rightDrawerOpen && rightDrawerRef === 'person_todos'
            ? 'positive'
            : ''
        "
        @click="toggle_persontodos()"
      >
        <q-tooltip> 个人待办 </q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="mdi-bookmark-plus-outline"
        :class="
          projectStore.rightDrawerOpen && rightDrawerRef === 'flaggeds'
            ? ''
            : 'op-5'
        "
        :color="
          projectStore.rightDrawerOpen && rightDrawerRef === 'flaggeds'
            ? 'positive'
            : ''
        "
        @click="toggle_flaggeds()"
      >
        <q-tooltip> 收藏的消息 </q-tooltip>
      </q-btn>
    </q-bar>
  </q-header>
</template>

<script setup>
import { ref, toRef, watch, computed } from "vue";
import MembersIndicator from "src/pages/Project/components/widgets/MembersIndicator.vue";
import ProjectSetting from "src/pages/Project/components/project/ProjectSetting.vue";
import ProjectNavigation from "src/pages/Project/components/project/ProjectNavigation.vue";

import useProjectStore from "src/stores/project.js";
import localforage from "localforage";
import ProjectBrand from "./ProjectBrand.vue";

const projectStore = useProjectStore();
const props = defineProps({
  rightDrawer: {
    type: String,
    default: null,
  },
});
const rightDrawerRef = toRef(props, "rightDrawer");

const overview = computed(
  () =>
    projectStore.project?.overviews.find(
      (i) => i.version === projectStore.project.default_version
    ) || projectStore.project?.overviews[0]
);

const emit = defineEmits(["toggleRightpannel"]);
const toggleRightpannel = () => {
  if (rightDrawerRef.value === "member_manager") {
    projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
  } else {
    emit("toggleRightpannel", "member_manager");
    if (!projectStore.rightDrawerOpen) {
      projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
    }
  }
};
const toggle_persontodos = () => {
  if (rightDrawerRef.value === "person_todos") {
    projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
  } else {
    emit("toggleRightpannel", "person_todos");
    if (!projectStore.rightDrawerOpen) {
      projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
    }
  }
};
const toggle_flaggeds = () => {
  if (rightDrawerRef.value === "flaggeds") {
    projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
  } else {
    emit("toggleRightpannel", "flaggeds");
    if (!projectStore.rightDrawerOpen) {
      projectStore.rightDrawerOpen = !projectStore.rightDrawerOpen;
    }
  }
};
const left_pannel_icons = [
  { val: "overview", icon: "mdi-developer-board" },
  { val: "chat", icon: "forum" },
  { val: "matters", icon: "manage_search" },
];
const leftDrawerIcon = ref();
const toggleleftDrawerOpen = async () => {
  projectStore.leftDrawerOpen = !projectStore.leftDrawerOpen;
  await localforage.setItem(
    "__project_leftDrawerOpen",
    projectStore.leftDrawerOpen
  );
};
const project_settings = ref(false);
watch(
  [projectStore, leftDrawerIcon],
  () => {
    if (projectStore.leftPannel) {
      // console.log(projectStore.leftPannel);
      leftDrawerIcon.value = left_pannel_icons.find(
        (i) => i.val === projectStore.leftPannel
      )?.icon;
    }
    if (!leftDrawerIcon.value) {
      leftDrawerIcon.value = "mdi-developer-board";
    }
  },
  { immediate: true, deep: true }
);

const projectDeleted = () => {
  project_settings.value = false;
};
</script>
