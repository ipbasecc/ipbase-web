<template>
  <div class="column no-wrap gap-md">
    <template v-for="mode in preferences.filter(i => i.name !== 'enable_settings')" :key="mode.name">
      <q-list>
        <template v-if="mode.settings?.length > 0">
          <q-item-label header class="border-bottom">{{ $t(mode.label) }}</q-item-label>
          <q-item
            v-for="i in mode.settings"
            :key="i.val"
            tag="label"
            :v-ripple="!i.selected"
            class="radius-sm"
          >
            <q-item-section>
              <q-item-label class="font-larger font-bold-600">{{
                $t(i.label)
              }}</q-item-label>
              <q-item-label v-if="i.description" caption lines="2" class="op-7">{{
                $t(i.description)
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-if="!i.selected" v-model="i.enable" color="green" :disable="calc_lock(i)" @update:model-value="updatePreferences()">
                <q-tooltip v-if="calc_lock(i) && i.locked_tip">
                  {{ $t(i.locked_tip) }}
                </q-tooltip>
              </q-toggle>
              <q-select v-else v-model="i.selected" :options="i.options" emit-value map-options color="green" outlined
                popup-content-class="border q-pa-xs radius-sm" style="min-width: 16rem;"
                @update:model-value="updatePreferences()">
                <template v-slot:selected>
                  {{ $t(i.options.find(o => o.value === i.selected)?.label) }}
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" style="max-width: 15rem;" class="radius-xs">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t(scope.opt.label) }}</q-item-label>
                      <q-item-label caption lines="2" class="op-5">{{ $t(scope.opt.description) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </template>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { updateProject } from "src/api/strapi/project.js";
import { teamStore } from "src/hooks/global/useStore.js";

const preferences = ref([]);
const card_settings = ref([]);
const project_settings = ref([]);
const kanban_settings = ref([]);
watchEffect(() => {
  preferences.value = teamStore.project?.preferences;
  const project_settings = preferences.value?.find(i => i.name === 'project_settings')?.settings;
  if(!project_settings?.find(i => i.val === 'chat_mode')) {
    project_settings.push({
      val: 'chat_mode',
      label: 'project_settings_chat_mode_label',
      selected: 'chat',
      options: [
        {
          value: 'chat',
          label: 'project_settings_chat_mode_chat_label',
          description: 'project_settings_chat_mode_chat_desc',
          icon: 'mdi-forum'
        },
        {
          value: 'info',
          label: 'project_settings_chat_mode_info_label',
          description: 'project_settings_chat_mode_info_desc',
          icon: 'mdi-newspaper'
        },
      ],
      description: 'project_settings_chat_mode_desc'
    })
  }
  card_settings.value = teamStore.project?.preferences?.card_settings;
  project_settings.value = teamStore.project?.preferences?.project_settings;
  kanban_settings.value = teamStore.project?.preferences?.kanban_settings;
})

const loading = ref(false);
const updatePreferences = async () => {
  preferences.value.card_settings = card_settings.value;
  let params = {
    data: {
      preferences: preferences.value,
    }
  };
  try {
    let res = await updateProject(teamStore.project?.id, params);
    if (res?.data) {
      preferences.value = res.data.preferences;
      return res;
    }
  } catch (error) {
    console.log(error);
  }
};


const calc_lock = (i) => {
  if (i.val === "multiple_boards") {
    // 如果看板内存在多个工作区，那么禁止关闭多工作区功能
    const boards_byType = (_type) => {
      return teamStore.project?.boards.filter((i) => i.type === _type)
    }
    // console.log('boards_byType_kanban', boards_byType('kanban'));
    return boards_byType('kanban')?.length > 1;
  }
};
</script>

<style lang="scss" scoped></style>
