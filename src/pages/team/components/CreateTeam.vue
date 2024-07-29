<template>
  <q-card bordered style="min-width: 24rem">
    <q-toolbar class="transparent q-px-md border-bottom">
      <span class="font-medium">{{ $t('create_team') }}</span>
      <q-space />
      <q-btn
        flat
        round
        dense
        unelevated
        size="sm"
        icon="close"
        :color="$q.dark.mode ? 'grey-1' : 'grey-10'"
        @click="cannelCreate()"
      />
    </q-toolbar>
    <q-card-section class="q-pa-lg">
      <div class="column gap-sm no-wrap">
        <q-input
          v-model="create_params.display_name"
          filled
          outlined
          type="text"
          :label="$t('team_name')"
          class="radius-xs overflow-hidden"
          @keydown.enter="create()"
        />
      </div>
    </q-card-section>
    <q-card-section class="row items-center no-wrap q-pa-sm border-top">
      <q-btn flat :label="$t('cancel')" v-close-popup />
      <q-space />
      <q-btn color="primary" padding="xs md" :label="$t('create')" @click="create()" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from "vue";
import { createStrapiTeam } from "src/pages/team/hooks/useTeam.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";

const create_params = ref({
  name: "",
  display_name: "",
  type: "I",
});
const emit = defineEmits(["cannelCreate", "completedCreate"]);
const cannelCreate = () => {
  emit("cannelCreate");
};
const create = async () => {
  const now = new Date();
  let timestamp = now.getTime();
  create_params.value.name = `u${userStore?.userId}at${timestamp}`;

  const res = await createStrapiTeam(create_params.value);
  if (res?.data) {
    if (teamStore.teams?.length > 0) {
      teamStore.teams.push(res?.data);
    } else {
      teamStore.teams = [res?.data];
    }
    cannelCreate();
  }
};
</script>

<style lang="scss" scoped></style>
