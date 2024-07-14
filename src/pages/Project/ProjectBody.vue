<template>
  <div class="absolute-full flex flex-center">
    <q-card v-if="project && !project.id" bordered style="min-width: 400px">
      <q-card-section v-if="userStore?.me?.username" class="border-bottom">
        Hi:
        <span class="font-bold-600 q-ml-sm">{{ userStore.me.username }}</span>
      </q-card-section>
      <q-card-section class="font-larger font-medium q-pa-xl">
        {{ project }}
      </q-card-section>
      <q-card-section class="border-top q-pa-sm">
        <q-btn
          color="primary"
          icon="arrow_back_ios"
          align="left"
          label="返回项目首页"
          class="full-width"
          @click="$router.push('/projects')"
        />
      </q-card-section>
    </q-card>

    <RouterView
      v-else-if="project_id && project?.id"
      :key="project_id"
    ></RouterView>
    <BgBrand v-else></BgBrand>
    <q-dialog
      v-model="projectRemoved"
      persistent
      full-height
      full-width
      class="blur-md"
    >
      <div class="fit flex flex-center">
        <q-card bordered style="min-width: 400px">
          <q-card-section>
            <ol>
              <li>当前项目可能已经被删除，即将跳转到项目管理首页...</li>
              <li>如果您刚刚申请加入，请等待管理员审核后在访问项目</li>
            </ol>
          </q-card-section>
          <q-card-actions>
            <q-btn
              label="立即跳转"
              color="primary"
              class="full-width"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  onBeforeMount,
  ref,
  watch,
  computed,
  onBeforeUnmount,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { findCard } from "src/api/strapi/project.js";
import { viewChannel } from "src/api/mattermost.js";
import {
  fetch_userPreferences,
  getMmChannel,
  getMmTeam,
  getTeamMembers,
} from "src/hooks/mattermost/useMattermost.js";

import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import useUserStore from "src/stores/user.js";
import localforage from "localforage";
import { db } from "src/boot/dexie.js";

import {
  getProjectCache,
  fetchProject,
  putProjectCache,
} from "src/hooks/project/useProcess.js";

import { toRefs } from "vue";

const props = defineProps({
  proj_id: {
    type: String,
    default: null,
  },
});

const { proj_id: _project_id } = toRefs(props);
const project_id = computed(() => Number(_project_id.value));

const router = useRouter();
const route = useRoute();
const mm_wsStore = useMmws();
const projectStore = useProjectStore();
const userStore = useUserStore();

const project = ref();
const chat_service = ref();
const getProject = async (_id) => {
  await localforage.setItem("last_project_id", _id);
  const cache = await getProjectCache(_id);
  if (cache) {
    project.value = cache;
  }
  const fetch = await fetchProject(_id);
  if (fetch) {
    project.value = fetch;
    await putProjectCache(fetch);
  } else {
    projectRemoved.value = true;
    projectRemovedFn();
  }
  chat_service.value = project.value?.chat_service;
};

watch(
  project_id,
  async () => {
    if (project_id.value) {
      const id = Number(project_id.value);
      await getProject(id);
    }
  },
  { immediate: true, deep: false }
);
watch(
  project,
  async () => {
    if (project.value) {
      await putProjectCache(project.value);

      // 有许多Mattermost提供的功能需要在项目中联合调用，一次在进入项目后初始化
      // 初始化对应的Mattermost频道、成员资料
      const m_team_id = chat_service.value?.mmTeamId;
      const m_channel_id = chat_service.value?.mmChannelId;
      if (m_team_id) {
        await getMmTeam(m_team_id);
        await getTeamMembers(m_team_id);
        await getMmChannel(m_channel_id);
        await fetch_userPreferences();
      }
    }
  },
  { immediate: false, deep: true }
);

onBeforeMount(async () => {
  projectStore.rightDrawerOpen = false;
  await localforage
    .getItem("__project_leftDrawerOpen")
    .then((res) => {
      projectStore.leftDrawerOpen = res;
    })
    .catch((err) => {
      console.error(err);
    });
});
const autoEnterInner = async () => {
  let entries = Object.keys(route.params);
  if (entries?.length === 1 && entries[0] === "proj_id") {
    let res = await localforage.getItem(
      `__last_navigation_of_project_${project_id.value}`
    );
    if (res) {
      router.push(`/projects/${route.params.proj_id}/${res}`);
    } else {
      if (projectStore.project?.chat_service) {
        router.push(`/projects/${route.params.proj_id}/chat`);
      } else {
        router.push(`/projects/${route.params.proj_id}/kanban`);
      }
    }
  }
};
onMounted(() => {
  // console.log("onMounted");
  // 如果用户直接通过URL访问到项目页面，但没有进入到具体模块
  // 读取上一次访问的模块并自动进入 否则 直接进入 chat 模块
  autoEnterInner();
});

watch(route, () => {
  if (route.params) {
    autoEnterInner();
  }
});

const projectRemoved = ref(false);
const projectRemovedFn = () => {
  setTimeout(async () => {
    await db.projects.delete(project_id.value);
    await localforage.removeItem(`last_project_id`);
    await localforage.removeItem(
      `___last_kanban_of_project_${project_id.value}`
    );
    projectStore.need_refecth_projects = true;
    projectRemoved.value = false;
    router.push("/projects");
  }, 3000);
};

// 执行view事件，保持与Mattermost的连接
const mm_user_id = localStorage.getItem("mmUserId");
const viewed = ref(false);
const __viewChannel = async () => {
  let params = {
    channel_id: chat_service.value?.mmChannelId,
  };
  let res = await viewChannel(mm_user_id, params);
  if (res) {
    viewed.value = true;
    setTimeout(() => {
      viewed.value = false;
    }, 3000);
  }
};
// 当用户点击页面时，如果 viewed 为 false，则执行 view
window.addEventListener("click", () => {
  if (!viewed.value) {
    __viewChannel();
  }
});
onMounted(() => {
  __viewChannel();
});
// 当浏览器标签页面由非活跃状态切换为活跃状态时，执行 view
onBeforeUnmount(() => {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      __viewChannel();
    }
  });
});

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        // console.log("strapi", strapi);
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project?.id &&
          (strapi.data.action === "delete" || strapi.data.action === "archive")
        ) {
          projectRemoved.value = true;
          projectRemovedFn();
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data.action === "projectDeleted" &&
          strapi.data.project_id === projectStore.project?.id
        ) {
          projectStore.need_refecth_projects = true;
          await localforage.removeItem("last_project_id");
          router.push("/projects");
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "projece_preference_Updated"
        ) {
          projectStore.project.preferences = strapi.data.preferences;
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "member_joined"
        ) {
          projectStore.project.project_members = [
            ...projectStore.project.project_members,
            strapi.data?.new_member,
          ];
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "member_updated"
        ) {
          const updatedMember = strapi.data?.updatedMember;
          const __ = projectStore.project.project_members.filter(
            (i) => i.id != updatedMember.id
          );
          projectStore.project.project_members = [...__, updatedMember];
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id == projectStore.project?.id &&
          strapi.data.action === "member_removed"
        ) {
          projectStore.project.project_members =
            projectStore.project.project_members.filter(
              (i) => i.id != strapi.data?.removedMember_id
            );
          if (strapi.data.removeUser_id == userStore.userId) {
            await localforage.removeItem("last_project_id");
            projectStore.need_refecth_projects = true;
            router.push("/projects");
          }
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data.action === "role_updated" &&
          strapi.data.project_id === projectStore.project?.id
        ) {
          const res = await getProject(projectStore.project?.id);
          if (res?.data) {
            projectStore.project.member_roles = res.data.member_roles;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.action === "role_updated" &&
          strapi.data.card_id === projectStore.card?.id
        ) {
          try {
            let res = await findCard(strapi.data.card_id);
            if (res?.data) {
              projectStore.card.member_roles = res.data.member_roles;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  projectStore.project = null;
});
</script>

<style lang="scss"></style>
