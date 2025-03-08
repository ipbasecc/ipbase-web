<template>
    <VueDraggable v-if="enable_settings?.length > 0" v-model="enable_settings" :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true"
      :fallbackOnBody="true" handle=".dragBar" filter=".undrag" group="enable_settings" chosenClass="chosenGroupClass"
      ghostClass="ghostColumn" fallbackClass="chosenGroupClass" @sort="onSort()"
      ref="draggableRef" class="row">
      <div v-for="i in enable_settings" :key="i.val" class="col-6 q-pa-sm items-stretch"
        :class="$q.screen.gt.xs ? 'col-6' : 'col-12'">
        <q-card bordered class="full-height">
          <q-card-section class="row no-wrap items-center gap-xs">
            <q-icon :name="i.icon" size="lg" :class="i.name === 'multiple_boards' ? 'undrag' : 'dragBar'" />
            <div class="font-bold-800 font-x-large q-ml-md">{{ $t(i.label) }}</div>
            <q-space />
            <q-toggle v-model="i.member_enable" dense left-label
              checked-icon="check"
              unchecked-icon="clear"
              label="成员可见"
              :color="i.member_enable ? 'primary' : 'negative'"
              :disable="loading" @update:model-value="updatePreferences()"
            />
            <q-toggle v-model="i.staff_enable" dense left-label
              checked-icon="check"
              unchecked-icon="clear"
              label="运营人员可见"
              :color="i.staff_enable ? 'primary' : 'negative'"
              :disable="loading" @update:model-value="updatePreferences()"
            />
          </q-card-section>
          <q-card-section class="q-pt-none">
            {{ $t(i.description) }}
          </q-card-section>
        </q-card>
      </div>
    </VueDraggable>
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
    enable_settings.value.forEach(setting => {
      if (setting.member_enable === null) setting.member_enable = false;
      if (setting.staff_enable === null) setting.staff_enable = false;
    });
  })

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
