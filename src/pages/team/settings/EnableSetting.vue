<template>
  <div v-if="enable_settings?.length > 0" class="row">
    <VueDraggable v-model="enable_settings" :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true"
      :fallbackOnBody="true" handle=".dragBar" filter=".undrag" group="enable_settings" chosenClass="chosenGroupClass"
      ghostClass="ghostColumn" fallbackClass="chosenGroupClass" @sort="onSort()"
      ref="draggableRef" class="row">
      <div v-for="i in enable_settings" :key="i.val" class="col-6 q-pa-sm items-stretch"
        :class="$q.screen.gt.xs ? 'col-6' : 'col-12'">
        <q-card bordered class="full-height">
          <q-card-section class="row no-wrap items-center">
            <q-icon :name="i.icon" size="lg" color="positive" :class="i.name === 'multiple_boards' ? 'undrag' : 'dragBar'" />
            <div class="font-bold-800 font-x-large q-ml-md">{{ $t(i.label) }}</div>
            <q-space />
            <q-toggle v-model="i.enable" color="primary" :disable="loading || calc_lock(i)" @update:model-value="updatePreferences()" />
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ $t(i.description) }}
          </q-card-section>
        </q-card>
      </div>
    </VueDraggable>
  </div>
</template>

<script setup>
  import { ref, watchEffect, nextTick } from "vue";
  import { updateProject } from "src/api/strapi/project.js";
  import { teamStore } from "src/hooks/global/useStore.js";
  import { VueDraggable } from 'vue-draggable-plus'

  const preferences = ref([]);
  const enable_settings = ref([]);

  watchEffect(() => {
    preferences.value = teamStore.project?.preferences;
    enable_settings.value = preferences.value.find(i => i.name === 'enable_settings')?.settings;
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

  const loading = ref(false);
  const updatePreferences = async () => {
    loading.value = true;
    // preferences.value.enable_settings = enable_settings.value;
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

  const onSort = async () => {
    await nextTick();
    preferences.value.find(i => i.name === 'enable_settings').settings = enable_settings.value;
    await updatePreferences();
  }
  const dragStart = (e) => {
    console.log(e);
  }
  const dragEnd = (e) => {
    console.log(e);
  }
</script>

<style lang="scss" scoped></style>
