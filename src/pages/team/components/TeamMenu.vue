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
        v-if="calc_auth('team', 'invite_uris', 'team')"
        clickable
        v-close-popup
        @click="inviteFn()"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="mdi-send" />
        </q-item-section>
        <q-item-section>邀请成员</q-item-section>
      </q-item>
      <q-item
        v-if="calc_auth('team', 'manageMember', 'team')"
        @click="memberManager = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="manage_accounts" />
        </q-item-section>
        <q-item-section>成员管理</q-item-section>
      </q-item>
      <q-item
        v-if="calc_auth('team', 'modify', 'team')"
        @click="teamSettings = true"
        clickable
        v-close-popup
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon name="tune" />
        </q-item-section>
        <q-item-section>团队设置</q-item-section>
      </q-item>
      <q-separator
        v-if="
          calc_auth('team', 'invite_uris', 'team') ||
          calc_auth('team', 'manageMember', 'team') ||
          calc_auth('team', 'modify', 'team')
        "
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
        <q-item-section>创建团队</q-item-section>
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
        <q-item-section>离开团队</q-item-section>
      </q-item>
      <q-item
        v-else
        @click="removeTeamFn(teamStore?.team?.id)"
        clickable
        :v-close-popup="confirmRemove"
        class="radius-xs"
        :class="confirmRemove ? 'bg-negative' : ''"
      >
        <q-item-section side>
          <q-icon name="close" />
        </q-item-section>
        <q-item-section>删除团队</q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item clickable v-close-popup class="radius-xs text-blue-5">
        <q-item-section side
          ><q-icon name="lightbulb" size="sm" color="blue-5"
        /></q-item-section>
        <q-item-section>了解团队</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <q-dialog v-model="invite" persistent>
    <TeamInvite :byInfo />
  </q-dialog>
  <q-dialog v-model="createing" persistent>
    <CreateTeam @cannelCreate="createing = false" />
  </q-dialog>
  <q-dialog v-model="memberManager" persistent>
    <q-card
      bordered
      style="min-width: 640px; max-height: 80vh; min-height: 50vh"
      class="column q-pb-lg"
    >
      <q-card-section class="border-bottom">
        <div class="row no-wrap items-center">
          <div class="text-h6">成员管理</div>
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
    正在执行操作，请稍候...
  </q-dialog>
  <q-dialog v-model="cant_leave" persistent>
    <q-card bordered>
      <q-card-section
        class="row gap-md items-center q-pa-sm font-large text-orange border-bottom"
      >
        <q-icon size="lg" name="info" />
        <span>不能执行此操作</span>
      </q-card-section>
      <q-card-section>
        <div class="row no-wrap items-center gap-md q-pa-xl">
          <span class="font-medium">{{ message }}</span>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm border-top">
        <q-btn color="primary" label="返回" padding="xs lg" v-close-popup />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, toRefs } from "vue";
import TeamInvite from "src/pages/team/components/widgets/TeamInvite.vue";
import CreateTeam from "src/pages/team/components/CreateTeam.vue";
import MemberManager from "src/pages/team/settings/MemberManager.vue";
import TeamSettings from "src/pages/team/components/teamSettings.vue";
import { leaveTeam, removeTeam } from "src/api/strapi/team.js";
import { useQuasar } from "quasar";
import { teamStore, uiStore, userStore } from "src/hooks/global/useStore.js";
import { useRouter } from "vue-router";

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
const createing = ref(false);
const memberManager = ref(false);
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
    return;
  }
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
    _members[0].by_user.id === Number(userStore.userId)
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
</script>

<style lang="scss" scoped></style>
