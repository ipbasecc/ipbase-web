<template>
  <q-layout view="lHr LpR lfr" container>
    <ProjectHeader
      :rightDrawer="rightDrawer"
      @toggleRightpannel="toggleRightpannel"
    />
    <q-drawer
      v-model="projectStore.leftDrawerOpen"
      side="left"
      class="column border-right"
      :width="240"
    >
      <div v-if="!projectStore.project" class="fit q-pa-sm column no-wrap">
        <LoadingBlock v-if="loading" />
        <template v-if="projects">
          <template v-if="projects?.length > 0">
            <q-scroll-area class="q-space">
              <template v-if="projects?.length > 0">
                <ProjectItem
                  v-for="i in projects.filter((j) => !!j)"
                  :key="i.id"
                  class="q-px-sm"
                  :project_item="i"
                  @enterProject="enterProject"
                  @deleteProject="deleteProject"
                  @refetchProjects="refetchProjects"
                />
              </template>
              <div
                v-if="total_projects > projects?.length && page > 1"
                class="full-width row flex-center q-mt-md op-5"
              >
                <q-btn
                  dense
                  flat
                  label="加载更多"
                  @click="getMoreProjectsFn()"
                />
              </div>
            </q-scroll-area>
            <q-btn
              size="md"
              flat
              class="full-width"
              :class="projects?.length > 0 ? 'border' : 'bg-primary text-white'"
              @click="createProject_ing = true"
            >
              <q-icon size="1rem" class="op-5" name="add" />
              <span>新建项目</span>
            </q-btn>
          </template>
          <div v-else>
            <q-btn
              size="md"
              flat
              class="full-width bg-primary text-white"
              @click="createProject_ing = true"
            >
              <q-icon size="1rem" class="op-5" name="add" />
              <span>新建项目</span>
            </q-btn>
          </div>
        </template>
      </div>
      <template v-else>
        <!-- {{ schedules_list_byInfo }} -->
        <!-- {{ route.params }} -->
        <BoradsList v-if="projectStore.navigation === 'kanban'" />
        <ChatList v-if="projectStore.navigation === 'chat'" />
        <StorageList
          v-if="
            projectStore.navigation === 'storage' &&
            projectStore.project?.storages
          "
          :storages="projectStore.project?.storages"
        />
        <ScheduleList
          v-if="projectStore.navigation === 'schedule'"
          :schedules="projectStore.project?.schedules"
          :by_info="byInfo"
        />
        <DocumentList
          v-if="projectStore.navigation === 'document'"
          :documents="projectStore.project?.project_documents"
          :by_info="byInfo"
        />
      </template>
      <q-dialog
        v-model="createProject_ing"
        persistent
        transition-show="slide-down"
        transition-hide="slide-up"
        :transition-duration="600"
      >
        <CreateProject @projectCreated="projectCreated" />
      </q-dialog>
    </q-drawer>
    <q-drawer
      v-if="projectStore?.rightPannel"
      v-model="projectStore.rightDrawerOpen"
      side="right"
      :width="420"
      class="bg-black q-pl-xs border-left"
    >
      <MemberManager
        v-if="rightDrawer === 'member_manager' && projectStore?.project?.id"
        :byInfo
      />
      <TodoPage v-if="rightDrawer === 'person_todos'" :kanban_id="null" />

      <FlagsContainder v-if="rightDrawer === 'flaggeds'" :headerless="true" />
    </q-drawer>

    <q-page-container>
      <div class="absolute-full">
        <router-view v-if="projectStore.project_id" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, watchEffect, computed } from "vue";
import OverView from "src/pages/Project/components/project/OverView.vue";
import localforage from "localforage";
import { init_user, getProjects } from "src/api/strapi/project.js";
import { useRouter, useRoute } from "vue-router";
import { fetch_StrapiMe } from "src/hooks/global/useFetchme.js";

import CreateProject from "src/pages/Project/components/project/CreateProject.vue";
import ProjectItem from "src/pages/Project/components/project/ProjectItem.vue";
import FlagsContainder from "src/pages/Project/chat/FlagsContainder.vue";

import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";

import LoadingBlock from "../../components/VIewComponents/LoadingBlock.vue";
import ProjectHeader from "src/pages/Project/components/project/ProjectHeader.vue";
import BoradsList from "src/pages/Project/components/project/BoradsList.vue";
import ChatList from "src/pages/Project/components/project/ChatList.vue";
import StorageList from "src/pages/Project/components/project/StorageList.vue";
import ScheduleList from "src/pages/Project/components/project/ScheduleList.vue";
import DocumentList from "src/pages/Project/components/project/DocumentList.vue";
import TodoPage from "src/pages/Project/todo/TodoPage.vue";
import MemberManager from "src/pages/Project/components/settings/MemberManager.vue";

import { _ws, closeWs } from "src/pages/Chat/ws.js";
import useMmws from "src/stores/mmws.js";
import {
  getProjectsCache,
  putProjectsCache,
  fetchProjects,
} from "src/hooks/project/useProcess.js";

const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const rightDrawer = ref();
const toggleRightpannel = (val) => {
  rightDrawer.value = val;
};

const byInfo = ref({
  by: "project",
  project_id: computed(() => projectStore?.project?.id),
});

onMounted(() => {
  _ws();
});
onUnmounted(() => {
  closeWs();
});

const router = useRouter();
const route = useRoute();
// 没有打开具体的看板或者讨论时，二级导航始终显示
watch(
  route,
  () => {
    // 将路由 params 提取为一个数组，当数组中只有 proj_id时，二级导航设置为开启状态
    const paramsArr = Object.keys(route.params);
    // console.log("paramsArr", paramsArr);
    if (paramsArr?.length === 1 && paramsArr[0] === "proj_id") {
      projectStore.leftDrawerOpen = true;
    }
  },
  { immediate: true, deep: true }
);
// 入口函数，获取用户后，开始初始化
const me = ref();
const _StrapiMe = async () => {
  try {
    let res = await fetch_StrapiMe();
    if (res) {
      me.value = res;
      initFn(me.value.id);
      return res;
    }
  } catch (error) {
    console.error("Error fetching Strapi data:", error);
  }
};

_StrapiMe();

const projects = ref();
const todogroups = ref();
const total_projects = ref();
const init = ref();
const initFn = async (id) => {
  const res = await init_user();
  if (res) {
    init.value = res.data;
    projectStore.init = res.data;

    todogroups.value = res.data.todogroups;
    projectStore.need_refecth_projects = false;
    userStore.init = res.data;
    userStore.storages = res.data.storages;

    await init_projectList(id);
  }
};

// 请求项目列表的分页
// 初始由 getProjects 获取
const page = ref(1);
const per_page = ref(15);
const loading = ref(false);

const init_projectList = async (user_id) => {
  loading.value = true;
  const setProjects = (val) => {
    projects.value = val;
    projectStore.projects = projects.value;
  };
  // 先从缓存获取用户项目列表，如果有，先用缓存数据初始化
  const cache = await getProjectsCache(user_id);
  if (cache?.projects && projects.value?.length === 0) {
    setProjects(cache.projects);
  }
  // 继续从后台获取
  const res = await fetchProjects(page.value, per_page.value, user_id);
  // 获取到后台数据后开始更新
  if (res?.data?.projects) {
    total_projects.value = res.data.total;
    // 重新初始化项目列表
    setProjects(res?.data.projects);
    // 更新缓存
    await putProjectsCache(user_id, res?.data.projects);
    loading.value = false;
    return projects.value;
  }
};

const refetchProjects = async () => {
  // 将现有的请求参数保存一份
  const data_for_restore = {
    page: page.value,
    per_page: per_page.value,
  };
  // 修正现有的请求参数，一次性重新请求现有的所有条目
  per_page.value = page.value * per_page.value;
  page.value = 1;
  const res = await init_projectList();
  // 重新请求完毕后，恢复原始的请求设置
  if (res) {
    per_page.value = data_for_restore.per_page;
    page.value = data_for_restore.page;
  }
};

const getProjectsFn = async () => {
  const res = await getProjects(page.value, per_page.value);
  // 获取到后台数据后开始更新
  if (res?.data?.projects) {
    total_projects.value = res.data.total;
    return res?.data?.projects;
  }
};
const getMoreProjectsFn = async () => {
  page.value++;
  let res = await getProjectsFn();
  if (res) {
    projects.value = [...projects.value, ...res];
    projectStore.projects = projects.value;
  }
};

watch(
  [projects, me],
  async () => {
    if (projects.value && me.value) {
      await putProjectsCache(me.value?.id, projects.value);
    }
  },
  { immediate: false, deep: true }
);

const enterProject = async (id) => {
  // console.log("enterProject", id);
  projectStore.$reset_project();
  projectStore.project_id = id;
  projectStore.rightDrawerOpen = false;
  router.push(`/projects/${id}`);
};

// 自动进入上次访问的项目
const autoEnter = async () => {
  let res = await localforage.getItem("last_project_id");

  let invalid = ["undefined", "null", "NaN", "", -1];
  if (res && !invalid.includes(res) && !route.params?.proj_id) {
    // console.log("enterProject", res, typeof res);
    enterProject(res);
  }
  if (invalid.includes(res)) {
    await localforage.removeItem("last_project_id");
  }
};
onMounted(() => {
  autoEnter();
});

watch(
  route,
  () => {
    if (route.params.proj_id) {
      projectStore.project_id = route.params.proj_id;
    }
  },
  { immediate: true, deep: true }
);

const need_refecth_projects = computed(
  () => projectStore.need_refecth_projects
);
watch(
  need_refecth_projects,
  async () => {
    if (need_refecth_projects.value) {
      await refetchProjects();
      projectStore.need_refecth_projects = false;
    }
  },
  { immediate: false, deep: false }
);

const related_cards = ref([]);
watchEffect(() => {
  let followedCards = init.value?.followed_cards || [];
  let executorColumnCards =
    init.value?.executor_of_columns.map((c) => c.cards || []).flat(2) || [];
  related_cards.value = [...followedCards, ...executorColumnCards];
  if (!projectStore.project) {
    rightDrawer.value = "person_todos";
  }
});

const createProject_ing = ref(false);
const projectCreated = (val) => {
  // // console.log('projectCreated',val);
  projects.value.push(val);
  createProject_ing.value = false;
};
const deleteProject = (id) => {
  projects.value = projects.value.filter((i) => i.id != id);
};
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore?.event?.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
