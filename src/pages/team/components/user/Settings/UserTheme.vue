<template>
  <div class="q-pa-lg row flex-center">
    <div
      class="radius-sm border-sm border-solid q-space"
      :class="$q.dark.mode ? 'border-primary' : 'border-op-full'"
    >
      <q-item
        clickable
        @click="updateTheme('dark') && $q.dark.set(true)"
        class="radius-sm q-space"
      >
        <q-item-section avatar>
          <q-avatar icon="mdi-theme-light-dark" />
        </q-item-section>
        <q-item-section>
          <q-item-label>深色</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="$q.dark.mode ? 'task_alt' : 'radio_button_unchecked'"
            :color="$q.dark.mode ? 'green' : 'grey-3'"
          />
        </q-item-section>
      </q-item>
    </div>
    <div
      class="radius-sm border-sm border-solid q-space"
      :class="!$q.dark.mode ? 'border-primary' : 'border-op-full'"
    >
      <q-item
        clickable
        @click="updateTheme('lighter') && $q.dark.set(false)"
        class="radius-sm q-space"
      >
        <q-item-section avatar>
          <q-avatar icon="dark_mode" />
        </q-item-section>
        <q-item-section>
          <q-item-label>亮色</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="!$q.dark.mode ? 'task_alt' : 'radio_button_unchecked'"
            :color="!$q.dark.mode ? 'green' : 'grey-3'"
          />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup>
import { modifyConfig } from "src/api/strapi.js";
import localforage from "localforage";
// 修改风格
const updateTheme = async (name) => {
  const setStrapiTheme = async () => {
    const params = {
      data: {
        theme: name,
      },
    };
    await modifyConfig(params);
  };
  await setStrapiTheme();
  await localforage.setItem("__theme_style_dark", name === "dark");
  await localforage.removeItem("__strapi_userMatedate");
};
</script>

<style lang="scss" scoped></style>
