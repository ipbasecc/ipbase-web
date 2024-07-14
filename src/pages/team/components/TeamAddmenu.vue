<template>
  <q-menu v-bind="$attrs" class="radius-sm" @hide="hideMenu()">
    <q-list
      bordered
      dense
      class="radius-sm q-pa-xs"
      :class="$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-white text-grey-10'"
    >
      <q-item
        v-if="!openCreateChannel"
        clickable
        class="radius-xs"
        @click="openCreateChannel = true"
      >
        <q-item-section side>
          <q-icon name="forum" />
        </q-item-section>
        <q-item-section class="q-pr-md">新建频道</q-item-section>
      </q-item>
      <q-item
        v-else
        clickable
        class="radius-xs"
        :class="openCreateChannel ? 'no-padding' : ''"
      >
        <q-item-section>
          <q-input
            v-model="createChannelparams.data.name"
            square
            filled
            dense
            type="text"
            placeholder="频道名称"
            @keyup.enter="createChannelFn()"
            @keyup.esc="openCreateChannel = false"
          >
            <template #prepend>
              <q-btn flat dense size="sm" :icon="createChannelIcon">
                <q-menu class="radius-sm">
                  <q-list dense bordered class="radius-sm q-pa-xs">
                    <q-item
                      clickable
                      auto-close
                      class="radius-xs"
                      @click.stop="setCreateType('O')"
                    >
                      <q-item-section side
                        ><q-icon name="public"
                      /></q-item-section>
                      <q-item-section>开放频道</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      auto-close
                      class="radius-xs"
                      @click.stop="setCreateType('P')"
                    >
                      <q-item-section side
                        ><q-icon name="lock"
                      /></q-item-section>
                      <q-item-section>私有频道</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </template>
            <template v-if="createChannelparams.data.name" #append>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="check"
                v-close-popup
                @click="createChannelFn()"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item
        v-if="!openCreateChannel"
        clickable
        v-close-popup
        class="radius-xs"
        @click="createProject()"
      >
        <q-item-section side>
          <q-icon name="mdi-trello" />
        </q-item-section>
        <q-item-section class="q-pr-md">新建项目</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <q-dialog v-model="openCreateProject" persistent>
    <CreateProject @projectCreated="projectCreated" />
  </q-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import { createChannel } from "src/pages/team/hooks/useCreateChannel.js";
import CreateProject from "./CreateProject.vue";

const loading = ref(false);
const openCreateChannel = ref(false);
const createChannelparams = ref({
  team_id: computed(() => teamStore.team?.id),
  data: {
    name: "",
    type: "P",
  },
});
const createChannelIcon = computed(() =>
  createChannelparams.value.data.type === "O" ? "public" : "lock"
);
const setCreateType = (val) => {
  createChannelparams.value.data.type = val;
};
const createChannelFn = async () => {
  loading.value = true;

  await createChannel(createChannelparams.value);

  createChannelparams.value.data.name = "";
  openCreateChannel.value = false;
  loading.value = false;
};

const openCreateProject = ref(false);
const createProject = async () => {
  openCreateProject.value = true;
};
const projectCreated = (val) => {
  teamStore.team.projects =
    teamStore.team.projects?.length > 0
      ? [...teamStore.team.projects, val]
      : [val];
  openCreateProject.value = false;
};

const hideMenu = () => {
  openCreateChannel.value = false;
};
</script>

<style lang="scss" scoped></style>
