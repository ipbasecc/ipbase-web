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
  watch,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  provide,
} from "vue";
import { useRouter } from "vue-router";
import { findCard } from "src/api/strapi/project.js";

import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import localforage from "localforage";

import {
  getProjectCache,
  fetchProject,
  putProjectCache,
} from "src/hooks/project/useProcess.js";

import { teamStore, userStore, mm_wsStore, uiStore } from "src/hooks/global/useStore.js";

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
const mm_channel = computed(() => teamStore.mm_channel);
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
  teamStore.channel = computed(() => teamStore.project?.mm_channel);
};
onBeforeMount(async () => {
  if (project_id.value) {
    const id = Number(project_id.value);
    if(id){
      await getProject(id);
      teamStore.mm_channel = project.value?.mm_channel
    }
  }
})

const projectRemoved = ref(false);
const projectRemovedFn = () => {
  setTimeout(() => {
    teamStore.need_refecth_projects = true;
    projectRemoved.value = false;
    teamStore.project = null;
    router.push("/teams");
  }, 3000);
};

onBeforeUnmount(
  () => {
    teamStore.project = null;
    document.removeEventListener("visibilitychange");
  },
  { passive: true }
);

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project?.id &&
          (strapi.data.action === "delete" || strapi.data.action === "archive")
        ) {
          projectRemoved.value = true;
          projectRemovedFn();
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data.action === "projectDeleted" &&
          strapi.data.project_id === teamStore.project?.id
        ) {
          teamStore.need_refecth_projects = true;
          await localforage.removeItem("last_project_id");
          await router.push("/teams");
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "projece_preference_Updated"
        ) {
          teamStore.project.preferences = strapi.data.preferences;
        }

        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "member_joined"
        ) {
          console.log("strapi.data?.new_member", strapi.data?.new_member);
          console.log(
            "teamStore.project?.member_roles",
            teamStore.project?.member_roles
          );
          console.log(
            "teamStore.project?.project_members",
            teamStore.project?.project_members
          );
          teamStore.project = {
            ...teamStore.project,
            member_roles: teamStore.project?.member_roles.map((i) => ({
              ...i,
              member_roles:
                i.subject === "unconfirmed" && i.members?.length > 0
                  ? [...i.members, strapi.data?.new_member]
                  : i.members,
            })),
            project_members:
              teamStore.project?.project_members?.length > 0
                ? [
                    ...teamStore.project.project_members,
                    strapi.data?.new_member,
                  ]
                : [strapi.data?.new_member],
          };
          console.log("teamStore.project", teamStore.project);
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "member_updated"
        ) {
          const updatedMember = strapi.data?.updatedMember;
          const __ = teamStore.project.project_members.filter(
            (i) => i.id !== updatedMember.id
          );
          teamStore.project.project_members = [...__, updatedMember];
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "member_removed"
        ) {
          teamStore.project.project_members =
            teamStore.project.project_members.filter(
              (i) => i.id !== strapi.data?.removedMember_id
            );
          if (strapi.data.removeUser_id === userStore?.userId) {
            teamStore.need_refecth_projects = true;
            await localforage.removeItem("last_project_id");
            await router.push("/teams");
          }
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data.action === "role_updated" &&
          strapi.data.project_id === teamStore.project?.id
        ) {
          const res = await getProject(teamStore.project?.id);
          if (res?.data) {
            teamStore.project.member_roles = res.data.member_roles;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.action === "role_updated" &&
          strapi.data.card_id === teamStore.card?.id
        ) {
          try {
            let res = await findCard(strapi.data.card_id);
            if (res?.data) {
              teamStore.card.member_roles = res.data.member_roles;
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

</script>

<style lang="scss"></style>
