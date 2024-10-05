<template>
  <div v-if="card_settings?.length > 0" class="row gap-md">
    <q-list>
      <template v-if="card_settings">
        <q-item-label header>{{ $t('card_preference_settings') }}</q-item-label>
        <q-separator spaced inset class="op-5" />
        <q-item
          v-for="i in card_settings"
          :key="i.val"
          tag="label"
          v-ripple
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
            <q-toggle v-model="i.enable" color="green" @update:model-value="updatePreferences()" />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { updateProject } from "src/api/strapi/project.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";

const preferences = ref([]);
const card_settings = ref([]);
watchEffect(() => {
  preferences.value = teamStore.project?.preferences;
  card_settings.value = teamStore.project?.preferences?.card_settings;
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
</script>

<style lang="scss" scoped></style>
