<template>
  <ServerList v-if="uiStore.setServer" :bordered="bordered" @setCompleted="setCompleted" />
  <q-card
    v-else
    :bordered="bordered"
    v-bind="$attrs"
    flat
    class="column no-wrap scroll-y q-pa-xs radius-sm"
    :class="`${assignStyle ? assignStyle : $q.dark.mode ? '' : 'bg-white text-grey-10'} ${
      spaced ? 'fit' : ''
    }`"
    style="min-width: 12rem; max-height: 26rem"
  >
    <q-list
      dense
      class="q-space column no-wrap scroll-y radius-sm"
      :class="teams?.length > 0 ? 'q-pa-xs' : ''"
    >
      <template v-if="teams?.length === 0">
        <div class="q-space q-pa-sm">
          <q-btn
            color="primary"
            icon="add"
            :label="$t('create_team')"
            class="full-width"
            @click="createTeam()"
          />
        </div>
      </template>
      <template v-else>
        <q-item
          v-for="(i, index) in teams"
          :key="i.id"
          clickable
          v-ripple
          v-close-popup="!i.status"
          class="radius-xs q-mb-xs"
          :class="`${
            teamStore.team?.id === i.id ? 'bg-primary text-white' : ''
          } ${disabled(i) ? 'op-5' : ''}`"
          @click="toggleTeamFn(i)"
          @mouseenter="getTeam(i)"
        >
          <q-item-section side>
            <q-avatar
              v-if="i.team_logo?.url"
              square
              class="radius-xs"
              size="sm"
            >
              <q-img
                :src="i.team_logo?.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="22px"
              />
            </q-avatar>
            <q-avatar
              v-else
              square
              class="radius-xs"
              size="sm"
              text-color="white"
              :style="`background-color: ${colorByAt(index * i.id, true)};`"
              >{{ i.display_name.charAt(0) }}</q-avatar
            >
          </q-item-section>
          <q-item-section>{{ i.display_name }}</q-item-section>
        </q-item>
      </template>
    </q-list>
    <q-space v-if="spaced" />
    <q-separator v-if="separator && teams?.length > 0" spaced class="op-3" />
    <div class="row no-wrap gap-xs items-center">
      <q-btn dense flat icon="group_add" :label="$t('create_team')" class="q-space" @click="createTeam()" />
      <q-btn dense flat icon="mdi-server-network" @click="setServer()" />
    </div>
  </q-card>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { getTeams, toggleTeam } from "src/pages/team/hooks/useTeam.js";
import { getTeamByID } from "src/api/strapi/team.js";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import { colorByAt } from "src/hooks/utilits.js";
import ServerList from 'src/pages/team/settings/ServerList.vue'
import { i18n } from 'src/boot/i18n.js';
import localforage from "localforage";

const $t = i18n.global.t;

const $q = useQuasar();
const props = defineProps({
  bordered: {
    type: Boolean,
    default: true,
  },
  spaced: {
    type: Boolean,
    default: false,
  },
  separator: {
    type: Boolean,
    default: false,
  },
  assignStyle: {
    type: String,
    default: null,
  },
  forceDard: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const teams = computed(() => teamStore.teams);

onMounted(async () => {
  await getTeams();
});
const emit = defineEmits(["createTeam"]);
const createTeam = () => {
  emit("createTeam");
};
const disabled = (team) => {
  const isDisabled = ["unconfirmed", "blocked"];
  return isDisabled.includes(team.status);
};
const toggleTeamFn = async (team) => {
  if (team.status === "unconfirmed") {
    $q.notify($t('no_verifild_cant_access'));
  } else if (team.status === "blocked") {
    $q.notify($t('was_blocked_cant_access'));
  } else {
    const res = await toggleTeam(team);
    if (res?.data) {
      await localforage.setItem('default_team', res.data)
      await router.push("/teams");
    }
  }
};
const setServer = () => {
  uiStore.setServer = true
}
const setCompleted = () => {
  uiStore.setServer = false
}
const getTeam = async (team) => {
  const status_needFetch = ["unconfirmed", "blocked"];
  if (!status_needFetch.includes(team?.status)) return;
  const res = await getTeamByID(team.id);
  if (res?.data) {
    const _team = res?.data;
    teamStore.teams = teamStore.teams.map((i) =>
      i.id === _team.id ? _team : i
    );
  }
};
</script>

<style lang="scss" scoped></style>
