<template>
  <div class="q-space column flex-center">
    <div v-if="loading" class="absolute-full flex flex-center z-max">
      <span>请稍候...</span>
    </div>
    <template v-else>
      <div
        v-if="!projectStore.project_id"
        class="column justify-center items-start gap-sm"
      >
        <template v-if="isChannelAdmin">
          <span>当前频道尚未创建任务管理功能，点击下方按钮开始创建</span>
          <q-btn
            color="primary"
            label="开启任务管理"
            @click="create_asign_project()"
          />
        </template>
        <span v-else
          >当前频道尚未启用任务管理功能，如您需要，可以联系管理员</span
        >
      </div>
      <ProjectBody v-else-if="projectStore.project_id" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import useMmStore from "src/stores/mmstore.js";
import useMmuser from "src/stores/mmuser.js";
import { getChannelMembershipsRoles } from "src/api/mattermost.js";
import { getMmChannelProject } from "src/api/strapi/mm_team.js";
import { createProjectFn } from "src/hooks/project/useCreateProject.js";
import localforage from "localforage";

import ProjectBody from "src/pages/Chat/components/Task/components/ProjectBody.vue";

import useProjectStore from "src/stores/project.js";
const projectStore = useProjectStore();
projectStore.inChat = true;
const mmstore = useMmStore();
const mmuser = useMmuser();
const mm_profile = ref();
const get_mm_profile_from_lf = async () => {
  let res = await localforage.getItem("mm_profile");
  if (res) {
    mm_profile.value = res;
  }
};
get_mm_profile_from_lf();
const getMmChannelProjectFn = async () => {
  let res = await getMmChannelProject(mmstore.channel?.id);
  if (res?.data) {
    projectStore.project_id = res.data.id;
  } else {
    projectStore.project_id = null;
  }
};
getMmChannelProjectFn();
const mm_user_id = computed(() => mmuser.user.id || mm_profile.value?.id);

const roles = ref();
watchEffect(async () => {
  if (mm_user_id.value && mmstore.team?.id) {
    let res = await getChannelMembershipsRoles(
      mm_user_id.value,
      mmstore.team?.id
    );
    if (res?.data) {
      roles.value = res.data;
    }
  }
});

const loading = ref(false);
const isChannelAdmin = computed(() =>
  roles.value
    ?.filter((i) => i.roles.includes("channel_admin"))
    .map((j) => j.user_id)
    .includes(mm_user_id.value)
);
const create_asign_project = async () => {
  loading.value = true;
  let params = {
    name: mmstore.channel?.display_name || mmstore.channel?.name,
    mm_channel_id: mmstore.channel?.id,
  };
  let res = await createProjectFn(params, mmstore.channel?.id);
  if (res) {
    console.log(res);
    projectStore.project_id = res.id;
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped></style>
