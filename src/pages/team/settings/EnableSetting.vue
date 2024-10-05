<template>
  <div v-if="enable_settings?.length > 0" class="row">
    <div
      v-for="i in enable_settings"
      :key="i.val"
      class="col-6 q-pa-sm items-stretch"
      :class="
          $q.screen.gt.xs ? 'col-6' : 'col-12'
        "
    >
      <q-card bordered class="full-height">
        <q-card-section class="row no-wrap items-center">
          <q-icon :name="i.icon" size="lg" color="positive" />
          <div class="font-bold-800 font-x-large q-ml-md">{{ $t(i.label) }}</div>
          <q-space />
          <q-toggle
            v-model="i.enable"
            color="primary"
            :disable="loading || calc_lock(i)"
            @click.stop="updatePreferences()"
          >
            <q-tooltip v-if="calc_lock(i)">
              {{ $t(calc_tip(i)) }}
            </q-tooltip>
          </q-toggle>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ $t(i.description) }}
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { updateProject } from "src/api/strapi/project.js";
import { useProjectCanEnableItems } from "src/hooks/project/useSettingTemplate.js";
import { teamStore } from "src/hooks/global/useStore.js";

const preferences = ref([]);
const enable_settings = ref([]);

watchEffect(() => {
  preferences.value = teamStore.project?.preferences;
  enable_settings.value = teamStore.project?.preferences?.enable_settings;
})

const calc_lock = (i) => {
  if (i.name === "multiple_boards") {
    // 如果存在多个工作区，那么禁止关闭多工作区功能
    const boards_byType = (_type) => {
      return teamStore.project?.boards.filter((i) => i.type === _type)
    }
    // console.log('boards_byType_kanban', boards_byType('kanban'));
    return boards_byType('kanban')?.length > 1;
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
    data: {
      preferences: preferences.value,
    }
  };
  try {
    let res = await updateProject(teamStore.project?.id, params);
    loading.value = false;
    if (res?.data) {
      
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped></style>
