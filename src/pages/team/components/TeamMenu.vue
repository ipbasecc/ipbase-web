<template>
  <q-menu v-bind="$attrs" class="radius-sm" ref="menu">
    <q-list
      style="min-width: 12rem"
      bordered
      dense
      class="radius-sm q-pa-xs"
      :class="$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-white text-grey-10'"
    >
      <q-item
        v-if="(teamStore.team?.config?.mode === 'toMany' || _isCurTeamCreator()) && useAuths('invite_uris', ['team'])"
        clickable
        v-close-popup
        @click="inviteFn()"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="mdi-send" />
        </q-item-section>
        <q-item-section>{{ $t('invite_member') }}</q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('manageMember', ['team'])"
        @click="openMemberManager = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="manage_accounts" />
        </q-item-section>
        <q-item-section>{{ $t('manage_member') }}</q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('modify', ['team'])"
        @click="teamSettings = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="tune" />
        </q-item-section>
        <q-item-section>{{ $t('team_settings') }}</q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('modify', ['team'])"
        @click="setNotification = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="mdi-bullhorn" />
        </q-item-section>
        <q-item-section>{{ $t('set_team_notification') }}</q-item-section>
      </q-item>
      <q-separator
        v-if="(teamStore.team?.config?.mode === 'toMany' || _isCurTeamCreator()) && (
          useAuths('invite_uris', ['team']) ||
          useAuths('manageMember', ['team']) || 
          useAuths('modify', ['team'])
        )"
        spaced
      />
      <q-item
        @click="createing = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="add_circle" />
        </q-item-section>
        <q-item-section>{{ $t('create_team') }}</q-item-section>
      </q-item>
      <q-item
        v-if="!removeAuth"
        @click="leaveTeamFn()"
        clickable
        :v-close-popup="confirmLeave"
        class="radius-xs"
        :class="confirmLeave ? 'bg-negative' : ''"
      >
        <q-item-section side>
          <q-icon name="mdi-export" />
        </q-item-section>
        <q-item-section>{{ $t('leave_team') }}</q-item-section>
      </q-item>
      <q-item
        v-else
        @click="removeTeamFn(teamStore?.team?.id)"
        clickable
        :v-close-popup="confirmRemove"
        class="radius-xs"
        :class="confirmRemove ? 'bg-negative' : ''"
        @mouseleave="confirmRemove = false"
      >
        <q-item-section side>
          <q-icon name="close" />
        </q-item-section>
        <q-item-section>{{ $t('delete_team') }}</q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item clickable v-close-popup class="radius-xs text-blue-5" @click="showAboutTeam()">
        <q-item-section side
          ><q-icon name="lightbulb" size="sm" color="blue-5"
        /></q-item-section>
        <q-item-section>{{ $t('about_team') }}</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <q-dialog v-model="aboutTeam" persistent allow-focus-outside :maximized="!$q.screen.gt.xs">
    <AboutTeam />
  </q-dialog>
  <q-dialog v-model="invite" persistent>
    <TeamInvite :byInfo />
  </q-dialog>
  <q-dialog v-model="setNotification" persistent>
    <SetNotification />
  </q-dialog>
  <q-dialog v-model="createing" persistent>
    <CreateTeam @cannelCreate="createing = false" />
  </q-dialog>
  <q-dialog v-model="openMemberManager" persistent>
    <q-card
      bordered
      style="min-width: 640px; max-height: 80vh; min-height: 50vh"
      class="column q-pb-lg"
    >
      <q-card-section class="border-bottom">
        <div class="row no-wrap items-center">
          <div class="text-h6">{{ $t('manage_member') }}</div>
          <q-space />
          <q-btn dense size="sm" round icon="close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="column q-space">
        <MemberManager :byInfo />
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="teamSettings" persistent>
    <TeamSettings :team />
  </q-dialog>
  <q-dialog v-model="leaving" persistent maximized>
    {{ $t('doing_wait') }}
  </q-dialog>
  <q-dialog v-model="cant_leave" persistent>
    <q-card bordered>
      <q-card-section
        class="row gap-md items-center q-pa-sm font-large text-orange border-bottom"
      >
        <q-icon size="lg" name="info" />
        <span>{{ $t('cannt_do_it') }}</span>
      </q-card-section>
      <q-card-section>
        <div class="row no-wrap items-center gap-md q-pa-xl">
          <span class="font-medium">{{ message }}</span>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm border-top">
        <q-btn color="primary" :label="$t('back')" padding="xs lg" v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, toRefs, onMounted } from "vue";
import TeamInvite from "src/pages/team/components/widgets/TeamInvite.vue";
import CreateTeam from "src/pages/team/components/CreateTeam.vue";
import MemberManager from "src/pages/team/settings/MemberManager.vue";
import TeamSettings from "src/pages/team/components/teamSettings.vue";
import { leaveTeam, removeTeam } from "src/api/strapi/team.js";
import { useQuasar } from "quasar";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import { useRouter } from "vue-router";
import AboutTeam from '../AboutTeam.vue'
import SetNotification from './SetNotification.vue'
import useMember from 'src/hooks/team/useMember.js'

const { _isCurTeamCreator } = useMember();
const $q = useQuasar();
const props = defineProps({
  team: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["teamUpdated"]);
const router = useRouter();
const { team } = toRefs(props);

const menu = ref(null);
const invite = ref(false);
const setNotification = ref(false);
const createing = ref(false);
const openMemberManager = ref(false);
const teamSettings = ref(false);

const byInfo = ref({
  by: "team",
  team_id: computed(() => team.value?.id),
});
const inviteFn = () => {
  invite.value = true;
};
const leaving = ref(false);
const cant_leave = ref(false);
const message = ref(false);
const confirmLeave = ref(false);
const leaveTeamFn = async () => {
  if (!confirmLeave.value) {
    confirmLeave.value = true;
  } else {
    await confirmLeaveTeamFn();
  }
}
const confirmLeaveTeamFn = async () => {
  if (leaving.value) return;
  leaving.value = true;
  const res = await leaveTeam(team.value?.id);

  if (res?.data?.status === "sucess") {
    teamStore.init.default_team = void 0;
    teamStore.team.$reset_team();
    $q.notify(res?.data?.message);
  }
  if (res?.data?.status === "error") {
    cant_leave.value = true;
    message.value = res?.data?.message;
  }
  leaving.value = false;
  confirmLeave.value = false;
  menu.value.hide();
};

const removeAuth = computed(() => {
  const _members = teamStore.team?.members;
  return (
    _members?.length === 1 &&
    _members[0].by_user.id === teamStore.init?.id
  );
});

const confirmRemove = ref(false);
const removeTeamFn = async () => {
  if (!confirmRemove.value) {
    confirmRemove.value = true;
    return;
  }
  const res = await removeTeam(teamStore?.team?.id);
  if (res) {
    teamStore.$reset_team();
    teamStore.$reset_project();
    uiStore.showToggleTeam = true;
    await router.push("/teams");
  }
};

const aboutTeam = ref(false);
const showAboutTeam = () => {
  aboutTeam.value = true;
}

defineExpose({
  openMemberManager,
  menu
});

</script>

<style lang="scss" scoped></style>
