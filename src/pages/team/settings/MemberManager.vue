<template>
  <div class="fit column q-space">
    <template v-if="authBase && __members && member_roles">
      <div v-if="can_invite" class="q-pa-md">
        <q-chip v-if="!teamStore.teamMembersExceeded && show_member_exceeded_tip"
          v-model="show_member_exceeded_tip" color="info" outline size="md"
          class="full-width border q-pa-md" :label="$t('team_members_exceeded_tip')" removable
        />
        <q-btn-group dense unelevated class="full-width">
          <q-btn color="primary" class="q-space"
            :disable="!useAuths('invite_uris', [authBase.collection], auth?.members, auth?.roles) || teamStore.teamMembersExceeded"
            @click="inviteFn(teamStore.project)"
          >
            <q-icon name="group_add" size="xs" />
            <span class="q-ml-md">{{ $t('invite') }}</span>
            <q-tooltip v-if="byInfo.by !== 'team'" class="font-medius border" :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
              {{ teamStore.teamMembersExceeded ? $t('team_members_exceeded') : $t('add_member_by_invite_link') }}
            </q-tooltip>
          </q-btn>
          <q-btn v-if="byInfo.by !== 'team' && (byInfo?.by !== 'channel' || teamStore.mm_channel?.type !== 'O')" split color="blue" icon="mdi-account-plus" @click="toggleAddFromeTeam()">
            <q-tooltip class="font-medius border" :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
              {{ $t('add_member_from_team') }}
            </q-tooltip>
          </q-btn>
        </q-btn-group>
        <q-dialog v-model="open_invite" persistent>
          <TeamInvite :byInfo />
        </q-dialog>
        <q-tooltip
          v-if="!useAuths('invite_uris', [authBase.collection], auth?.members, auth?.roles)"
          class="bg-black font-smaller"
        >
          {{ $t('no_premission_to_invite') }}
        </q-tooltip>
      </div>
      <div class="q-space relative-position">
        <q-scroll-area v-if="members?.filter(i => i.members?.length > 0)?.length > 0" class="absolute-full">
          <template v-for="g in members" :key="g.group">
            <template v-if="g.members?.length > 0">
              <q-item-label header>{{ translate(g.group) }}</q-item-label>
              <q-item v-for="i in g.members" :key="i.id">
                <q-item-section top avatar>
                  <UserAvatar
                    v-if="i.by_user?.mm_profile?.id"
                    :user_id="i.by_user?.mm_profile?.id"
                    :strapi_member="i"
                    :size="34"
                    :indicator_size="'10px'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ i.by_user?.username }}</q-item-label>
                </q-item-section>
                <q-item-section
                  v-if="
                    useAuths('manageMember', [authBase.collection], auth?.members, auth?.roles) && !protectedRoles.includes(g.group)
                  "
                  side
                >
                  <q-btn flat dense round size="sm" icon="mdi-dots-vertical">
                    <q-menu
                      class="radius-sm"
                      @show="set_new_roles_IDs(i)"
                      @hide="set_new_roles_IDs(i)"
                    >
                      <q-list
                        v-if="new_roles_IDs && member_roles_forChange"
                        bordered
                        dense
                        class="radius-sm q-pa-xs column no-wrap gap-xs"
                        style="min-width: 220px"
                      >
                        <q-item
                          v-for="role in member_roles_forChange"
                          :key="role.id"
                          clickable
                          class="radius-xs text-no-wrap"
                          @click="setRoleFn(i, role)"
                        >
                          <q-item-section
                            v-if="new_roles_IDs?.includes(role.id)"
                            side
                          >
                            <q-icon
                              name="mdi-checkbox-marked-circle"
                              size="xs"
                              color="green"
                              :class="
                                new_roles_IDs?.includes(role.id)
                                  ? 'op-none'
                                  : 'op-0'
                              "
                            />
                          </q-item-section>
                          <q-item-section>
                            {{ translate(role.subject) }}</q-item-section
                          >
                        </q-item>
                        <template v-if="byInfo?.by !== 'channel' || (teamStore.mm_channel?.type !== 'O' && g.group !== 'admin')">
                          <q-separator class="op-3 q-my-xs" />
                          <q-item
                            clickable
                            v-close-popup
                            class="radius-xs text-no-wrap"
                            @click="removeUserFn(i)"
                          >
                            <q-item-section>{{ $t('remove_member') }}</q-item-section>
                          </q-item>
                        </template>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </template>
          </template>
        </q-scroll-area>
        <slot v-else name="tip"></slot>
      </div>
    </template>
    <div v-else>{{ $t('no_premission_to_view') }}</div>
    <q-dialog v-model="addFromTeam" persistent>
      <q-card bordered style="min-width: 24rem; min-height: 32rem;">
        <q-card-section class="border-bottom row items-center">
          {{ $t('add_member_from_team') }}
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item v-for="i in members_for_from" :key="i.id" clickable v-ripple class="radius-xs">
                <q-item-section top avatar>
                  <UserAvatar
                    v-if="i.by_user?.mm_profile?.id"
                    :user_id="i.by_user?.mm_profile?.id"
                    :strapi_member="i"
                    :size="34"
                    :indicator_size="'10px'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ i.by_user?.username }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn dense flat round icon="mdi-plus"
                  @click="setRoleFn(i,member_roles.find(i => i.subject === 'member'),'add')" />
                </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect, onBeforeMount } from "vue";
import {
  setTeamRoleFn,
  setChannelRoleFn,
  setProjectRoleFn,
  setCardRoleFn,
  removeMember,
  new_roles_IDs,
  set_new_roles_IDs
} from "./MemberManager.js";

import { getTeamMembers } from "src/api/strapi/team.js"

import { __dict } from "src/hooks/dict.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import { toRefs } from "vue";
import TeamInvite from "../components/widgets/TeamInvite.vue";
import {useAuths} from "src/pages/team/hooks/useAuths.js";
import { teamStore } from "src/hooks/global/useStore.js";
import useMember from 'src/hooks/team/useMember.js'

const { _isCurTeamCreator } = useMember();

const props = defineProps({
  byInfo: {
    type: Object,
    default() {
      return null;
    },
  },
  auth: {
    type: Object,
    default() {
      return null;
    },
  },
});
const { byInfo, auth } = toRefs(props);
const userId = computed(() => teamStore.init?.id);

const can_invite = computed(() => (_isCurTeamCreator() || teamStore.team?.config?.mode === 'toMany') && byInfo.value?.by !== 'card')
const open_invite = ref(false);
const inviteTarget = ref(null);
const inviteFn = (project) => {
  open_invite.value = true;
  inviteTarget.value = project;
};

const show_member_exceeded_tip = ref(true)
const authBase = computed(() => {
  let res = {};
  let isInCard;
  let isInProject;
  let isInTeam;
  let isInChannel;
  let members
  if (teamStore.card) {
    members = teamStore.card?.card_members?.map((i) => i.by_user?.id);
    isInCard = members?.includes(userId.value);
  }
  if (teamStore.project) {
    members = teamStore.project?.project_members?.map(
      (i) => i.by_user?.id
    );
    isInProject = members?.includes(userId.value);
  }
  if (teamStore.team) {
    members = teamStore.team?.members?.map((i) => i.by_user?.id);
    isInTeam = members?.includes(userId.value);
  }
  if (teamStore.channel) {
    members = teamStore.channel?.members?.map((i) => i.by_user?.id);
    isInChannel = members?.includes(userId.value);
  }
  if (byInfo.value?.by === "card" && isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  }
  if (byInfo.value?.by === "project" && isInProject) {
    res = {
      collection: "project",
      of: "project",
    };
  }
  if (byInfo.value?.by === "team" && isInTeam) {
    res = {
      collection: "team",
      of: "team",
    };
  }
  if (byInfo.value?.by === "channel") {
    res.collection = "channel";
    if (isInChannel) {
      res.of = "channel";
    } else if (isInTeam) {
      res.of = "team";
    } else {
      res = false;
    }
  }
  return res;
});

const limit = 20;
const offset = ref(1);
const totalCount = ref();
const hasMore = ref(false);
onBeforeMount(async() => {
  // todo 待完善分页查询
  if(byInfo.value.team_id){    
    teamStore.team.members = []
    const team_id = byInfo.value.team_id
    const { data } = await getTeamMembers(team_id, offset.value, limit);
    if(data?.members){      
      if(Array.isArray(teamStore.team?.members)){
        teamStore.team.members.push(...data.members)
      } else {
        teamStore.team.members = data
      }
    }
    totalCount.value = data.totalCount;
    hasMore.value = data.hasMore
  }
})

const addFromTeam = ref(false);
const toggleAddFromeTeam = () => {
  addFromTeam.value = !addFromTeam.value;
};
const sliceNumber = computed(() => teamStore.level_detail.team_members_limit === -1 ? 0 : teamStore.level_detail.team_members_limit)
const project_members = computed(() => teamStore.project?.project_members?.slice(0, sliceNumber.value));
const card_members = computed(() => teamStore.card?.card_members);
const team_members_not_in_card = computed(() => team_members.value.filter(i => !card_members.value.map(j => j.id).includes(i.id)));
const team_members = computed(() => teamStore.team?.members?.slice(0, sliceNumber.value));
const team_members_not_in_project = computed(() => team_members.value.filter(i => !project_members.value.map(j => j.id).includes(i.id)));
const channel_members = computed(() => teamStore.channel?.members?.slice(0, sliceNumber.value));
const team_members_not_in_channel = computed(() => team_members.value.filter(i => !channel_members.value.map(j => j.id).includes(i.id)));
const members_for_from = computed(() => {
  let members
  if (byInfo.value?.by === "project") {
    members = team_members_not_in_project.value;
  }
  if (byInfo.value?.by === "card") {
    members = team_members_not_in_card.value;
  }
  if (byInfo.value?.by === "channel") {
    members = team_members_not_in_channel.value;
  }
  return members
});

const project_member_roles = computed(() => teamStore.project?.member_roles);
const card_member_roles = computed(() => teamStore.card?.member_roles);
const team_member_roles = computed(() => teamStore.team?.member_roles);
const channel_member_roles = computed(() => teamStore.channel?.member_roles);

const members = ref();
let hideRoles = ["owner", "admin", "unconfirmed", "blocked"];
let protectedRoles = ["creator", "owner"];
const unconfirmed_members = ref();
const confirmed_members = ref();
const external_members = ref();
const admin_members = ref();
const blocked_members = ref();

const member_roles = computed(() => {
  let member_roles;
  if (byInfo.value?.by === "project") {
    member_roles = project_member_roles.value;
  }
  if (byInfo.value?.by === "card") {
    member_roles = card_member_roles.value;
  }
  if (byInfo.value?.by === "team") {
    member_roles = team_member_roles.value;
  }
  if (byInfo.value?.by === "channel") {
    member_roles = channel_member_roles.value;
  }
  return member_roles;
});
const __members = computed(() => {
  let __members;
  if (byInfo.value?.by === "project") {
    __members = project_members.value;
  }
  if (byInfo.value?.by === "card") {
    __members = card_members.value;
  }
  if (byInfo.value?.by === "team") {
    __members = team_members.value;
  }
  if (byInfo.value?.by === "channel") {
    __members = channel_members.value;
  }
  return __members;
});

watchEffect(
  () => {
    console.log('__members', __members);
    
    const adminRole = member_roles.value?.find((i) => i.subject === "admin");
    admin_members.value = adminRole?.id
      ? __members.value?.filter((i) =>
          i.member_roles?.map((j) => j.id).includes(adminRole?.id)
        )
      : [];

    const unconfirmedRole = member_roles.value?.find(
      (i) => i.subject === "unconfirmed"
    );
    unconfirmed_members.value = unconfirmedRole?.id
      ? __members.value?.filter((i) =>
          i.member_roles?.map((j) => j.id).includes(unconfirmedRole?.id)
        )
      : [];

    const blockedRole = member_roles.value?.find((i) => i.subject === "blocked");
    blocked_members.value = blockedRole?.id
      ? __members.value?.filter((i) =>
          i.member_roles?.map((j) => j.id).includes(blockedRole?.id)
        )
      : [];
    const externalRole = member_roles.value?.find(
      (i) => i.subject === "external"
    );
    external_members.value = externalRole?.id
      ? __members.value?.filter((i) =>
          i.member_roles?.map((j) => j.id).includes(externalRole?.id)
        )
      : [];

    const isProtected = (_userId) => {
      const userMember = __members.value?.find((i) => i.by_user?.id === _userId);
      const allRoles_of_member = member_roles.value?.filter((i) =>
        userMember.member_roles?.map((j) => j.id)?.includes(i.id)
      );

      return allRoles_of_member
        .map((j) => j.subject)
        .some((k) => protectedRoles.includes(k));
    };
    confirmed_members.value = __members.value?.filter(
      (i) =>
        !isProtected(i.by_user?.id) &&
        !admin_members.value.map((j) => j.id).includes(i.id) &&
        !unconfirmed_members.value.map((j) => j.id).includes(i.id) &&
        !blocked_members.value.map((j) => j.id).includes(i.id) &&
        !external_members.value.map((j) => j.id).includes(i.id)
    );

    members.value = [
      {
        group: "admin",
        members: admin_members.value,
      },
      {
        group: "member",
        members: confirmed_members.value,
      },
      {
        group: "unconfirmed",
        members: unconfirmed_members.value,
      },
      {
        group: "external",
        members: external_members.value,
      },
    ];
    if (
      useAuths('manageMember', [authBase.value.collection], auth.value?.members, auth.value?.roles)
    ) {
      members.value.push({
        group: "blocked",
        members: blocked_members.value,
      });
    }
  },
  {
    flush: "post",
  }
);

const member_roles_forChange = computed(() => {
  if (!member_roles.value || member_roles.value.length === 0) return [];
  // 临时禁用外部成员，对应的逻辑尚未完成
  // hideRoles = [...hideRoles, "external"];
  // 如果是在管理卡片成员，那么角色中应该不包含“外部成员”分组
  if (byInfo.value.card_id) {
    hideRoles = [...hideRoles, "external"];
  }
  // 如果拥有管理成员权限，那么角色设置下拉菜单中，应该包含 block 分组
  if (useAuths('manageMember', [authBase.value.collection], auth.value?.members, auth.value?.roles)) {
    hideRoles = hideRoles.filter((i) => i !== "blocked");
  }
  return member_roles.value?.filter((i) => !hideRoles.includes(i.subject));
});

const unconfirmed_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "unconfirmed")?.id
);
const external_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "external")?.id
);
const blocked_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "blocked")?.id
);
const member_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "member")?.id
);

const setRoleFn = async (member, role, prop) => {
  const process_id = role.id;
  let cur;
  if(prop === 'add'){
    cur = [role.id]
  } else {
    cur = new_roles_IDs.value;
    const justChanngeRoles = ["unconfirmed", "blocked", "external"];
    const targetMemberRoles = member.member_roles.map((k) => k.subject);
    // 如果是设置为：被屏蔽 或 待审核 或 外部成员，那么直接设置目标角色
    // 如果用户本来就是 待确认 被屏蔽 分组，如果被修改，那么也直接修改成目标分组
    // 如果修改的是卡片成员角色，那么直接修改为目标角色，在卡片中，每个成员只对应一个角色
    let needJustChange =
      justChanngeRoles.filter((item) => new Set(targetMemberRoles).has(item))
        ?.length > 0;
    if (targetMemberRoles.includes("external") && role.subject === "external") {
      cur = [unconfirmed_role_id.value];
    } else if (
      justChanngeRoles.includes(role.subject) ||
      needJustChange ||
      byInfo.value?.card_id
    ) {
      cur = [process_id];
    } else {
      // 已经是该角色 则减 否则 加
      cur = cur.includes(process_id) ? cur.filter((i) => i !== process_id) : [
        ...cur,
        process_id,
      ];
      // 如果删掉所有角色，那就切换成 待审核 角色
      if (cur.length === 0) {
        cur = [unconfirmed_role_id.value];
      }
    }
  }
  // console.log("cur", cur);
  new_roles_IDs.value = cur;

  // console.log("member", member.id);
  if (new_roles_IDs.value.length > 0) {
    let _;
    if (byInfo.value.project_id) {
      const _member_roles_ids = member_roles.value.map((i) => i.id);
      const _ids = new_roles_IDs.value.filter((i) => _member_roles_ids.includes(i));
      
      const res = await setProjectRoleFn(
        byInfo.value.project_id,
        member.id,
        _ids
      );
      if (res) {
        _ = res;
      }
    }else if (byInfo.value?.card_id) {
      const res = await setCardRoleFn(
        byInfo.value.card_id,
        member.id,
        new_roles_IDs.value
      );
      if (res) {
        _ = res;
      }
    }else if (byInfo.value?.team_id) {
      const res = await setTeamRoleFn(
        byInfo.value.team_id,
        member.id,
        new_roles_IDs.value
      );
      if (res) {
        _ = res;
      }
    }else if (byInfo.value?.channel_id) {
      const res = await setChannelRoleFn(
        byInfo.value.channel_id,
        member.id,
        new_roles_IDs.value
      );
      if (res) {
        _ = res;
      }
    }
    set_new_roles_IDs(_);
  }
};

const dict = __dict();
const translate = (i) => {
  return dict.find((item) => item.key === i)?.value || i;
};

const removeUserFn = async (member) => {
  await removeMember(byInfo.value, member);
};
</script>
