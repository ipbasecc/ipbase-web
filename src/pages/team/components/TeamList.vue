<template>
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
      <q-responsive
        v-for="(i, index) in teams"
        :key="i.id"
        v-bind="$attrs"
        :ratio="1"
        class="full-width"
      >
        <div class="fit radius-sm q-pa-sm" :class="teamStore.team?.id === i.id ? 'border-primary border-solid' : ''">
          <q-btn
            class="fit"
            :class="`${disabled(i) ? 'op-5' : ''}`"
            padding="none" flat
            @click="toggleTeamFn(i)"
          >
            <q-avatar
              v-if="i.team_logo?.url"
              square
              class="radius-xs fit"
            >
              <q-img
                :src="$resize(i.team_logo?.url, [64, 64])"
                :ratio="1"
                spinner-color="primary"
                spinner-size="22px"
              />
            </q-avatar>
            <q-avatar
              v-else
              square
              class="radius-xs fit"
              size="sm"
              text-color="white"
              :style="`background-color: ${colorByAt(index * i.id, true)};`"
              >{{ i.display_name.charAt(0) }}</q-avatar
            >
          </q-btn>
        </div>
      </q-responsive>
    </template>
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
const createTeam = () => {
  uiStore.createTeam = true;
};
const disabled = (team) => {
  const isDisabled = ["unconfirmed", "blocked"];
  return isDisabled.includes(team.status);
};
const toggleTeamFn = async (team) => {
  uiStore.app = 'teams'
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
