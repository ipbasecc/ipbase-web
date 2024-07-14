<template>
  <div v-if="enable_settings?.length > 0" class="row gap-md">
    <q-card v-for="i in enable_settings" :key="i.val" bordered class="col-6">
      <q-card-section class="row no-wrap items-center">
        <div class="text-h6">{{ i.label }}</div>
        <q-space />
        <q-toggle
          v-model="i.enable"
          color="primary"
          :disable="loading || calc_lock(i)"
          @click.stop="updatePreferences()"
        >
          <q-tooltip v-if="calc_lock(i)">
            {{ calc_tip(i) }}
          </q-tooltip>
        </q-toggle>
      </q-card-section>
      <q-card-section class="q-pt-none">
        {{ i.description }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import { updateProject } from "src/api/strapi/project.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { useProjectCanEnableItems } from "src/hooks/project/useSettingTemplate.js";

const projectStore = useProjectStore();
const userStore = useUserStore();

const preferences = ref(projectStore.project?.preferences);
const enable_settings = ref(projectStore.project?.preferences?.enable_settings);

const calc_lock = (i) => {
  if (i.name === "multiple_boards") {
    // 如果存在多个工作区，那么禁止关闭多工作区功能
    return projectStore.project?.boards?.length > 1;
  }
};
const calc_tip = (i) => {
  if (i.name === "multiple_boards") {
    return useProjectCanEnableItems().find((i) => i.name === "multiple_boards")
      .locked_tip;
  }
};

const loading = ref(false);
const updatePreferences = async () => {
  loading.value = true;
  preferences.value.enable_settings = enable_settings.value;
  let params = {
    preferences: preferences.value,
  };
  try {
    let res = await updateProject(projectStore.project?.id, params);
    loading.value = false;
    if (res?.data) {
      preferences.value = res.data.preferences;
      let chat_Msg = {
        body: `${userStore.me?.username}修改了项目：${projectStore.project?.name}`,
        props: {
          strapi: {
            data: {
              is: "project",
              by_user: userStore.userId,
              project_id: projectStore.project?.id,
              action: "projece_preference_Updated",
              preferences: preferences.value,
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    }
  } catch (error) {
    console.log(error);
  }
};

const send_chat_Msg = (MsgContent) => {
  send_MattersMsg(MsgContent);
};
</script>

<style lang="scss" scoped></style>
