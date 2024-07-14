<template>
  <q-list>
    <div v-if="byInfo.project_id" class="q-pa-md">
      <q-btn
        color="primary"
        dense
        class="full-width"
        :disable="!calc_auth(authBase.collection, 'invite_uris', authBase.of)"
        @click="open_invite = true"
      >
        <q-icon name="group_add" size="xs" />
        <span class="q-ml-md">邀请</span>
      </q-btn>
      <q-dialog v-model="open_invite" persistent>
        <InviteBlock />
      </q-dialog>
      <q-tooltip
        v-if="!calc_auth(authBase.collection, 'invite_uris', authBase.of)"
        class="bg-black font-smaller"
      >
        您没有邀请成员的权限
      </q-tooltip>
    </div>
    <template v-for="g in members" :key="g.group">
      <template v-if="g.members?.length > 0">
        <q-item-label header>{{ translate(g.group) }}</q-item-label>
        <q-item v-for="i in g.members" :key="i.id">
          <q-item-section top avatar>
            <UserAvatar
              v-if="i.by_user?.mm_profile?.id"
              :user_id="i.by_user?.mm_profile?.id"
              :size="34"
              :disable_card="true"
              :indicator_size="'10px'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ i.by_user.username }}</q-item-label>
          </q-item-section>
          <q-item-section
            v-if="calc_auth(authBase.collection, 'manageMember', authBase.of)"
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
                    :clickable="!disable?.includes(role.id)"
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
                          new_roles_IDs?.includes(role.id) ? 'op-none' : 'op-0'
                        "
                      />
                    </q-item-section>
                    <q-item-section>
                      {{ translate(role.subject) }}</q-item-section
                    >
                  </q-item>
                  <q-separator class="op-3 q-my-xs" />
                  <q-item
                    clickable
                    v-close-popup
                    class="radius-xs text-no-wrap"
                    @click="removeUserFn(i)"
                  >
                    <q-item-section>移除用户</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </template>
    </template>
  </q-list>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import {
  getOneProject,
  removeUser,
  setRole,
  updateCardRole,
} from "src/api/strapi/project.js";

import { __dict } from "src/hooks/dict.js";
import useMmws from "src/stores/mmws.js";
import InviteBlock from "src/pages/Project/components/project/widgets/InviteBlock.vue";
import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
import { toRefs } from "vue";

const props = defineProps({
  byInfo: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { byInfo } = toRefs(props);
const { userId, me } = useMatedate;

const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();
const open_invite = ref(false);

const authBase = computed(() => {
  let res;
  let isInCard;
  if (projectStore.card) {
    const members = projectStore.card.card_members.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "project",
      of: "project",
    };
  }
  return res;
});

const project_members = computed(() => projectStore.project?.project_members);
const card_members = computed(() => projectStore.card?.card_members);
const project_member_roles = computed(() => projectStore.project?.member_roles);
const card_member_roles = computed(() => projectStore.card?.member_roles);

const members = ref();
const member_roles = ref();
let hideRoles = ["creator", "owner", "unconfirmed"];
const member_roles_forChange = computed(() => {
  if (byInfo.value.card_id) {
    hideRoles = [...hideRoles, "external"];
  }
  return member_roles.value?.filter((i) => !hideRoles.includes(i.subject));
});
const unconfirmed_members = ref();
const confirmed_members = ref();

watchEffect(() => {
  if (project_members.value) {
    confirmed_members.value = project_members.value?.filter((i) =>
      i.member_roles.map((j) => j.subject).some((j) => !hideRoles.includes(j))
    );
    unconfirmed_members.value = project_members.value?.filter((i) =>
      i.member_roles.map((j) => j.subject)?.includes("unconfirmed")
    );
    member_roles.value = project_member_roles.value;
  }
  if (card_members.value) {
    confirmed_members.value = card_members.value?.filter((i) =>
      i.member_roles.map((j) => j.subject).some((j) => !hideRoles.includes(j))
    );
    unconfirmed_members.value = card_members.value?.filter((i) =>
      i.member_roles.map((j) => j.subject)?.includes("unconfirmed")
    );
    member_roles.value = card_member_roles.value;
  }
  members.value = [
    {
      group: "member",
      members: confirmed_members.value,
    },
    {
      group: "unconfirmed",
      members: unconfirmed_members.value,
    },
  ];
});

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

const new_roles_IDs = ref();
const set_new_roles_IDs = (member) => {
  new_roles_IDs.value = member.member_roles?.map((i) => i.id);
};
const unconfirmed_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "unconfirmed")?.id
);
const external_role_id = computed(
  () => member_roles.value?.find((i) => i.subject === "external")?.id
);

const disable = computed(() => {
  let res;
  if (byInfo.value.card_id) {
    res = [unconfirmed_role_id.value];
  }
  return res;
});
const setRoleFn = async (member, role) => {
  if (!disable.value?.includes(role.id)) {
    const process_id = role.id;

    // 已经是该角色 则减 否则 加
    let cur = new_roles_IDs.value;

    cur = (cur.includes(process_id) && cur.filter((i) => i != process_id)) || [
      ...cur,
      process_id,
    ];

    // 如果删掉所有角色，那就切换成 待审核 角色
    if (cur.length === 0) {
      cur = [unconfirmed_role_id.value];
    }
    // 如果用户有待审核，移除待审核角色
    if (cur.length > 1 && cur.includes(unconfirmed_role_id.value)) {
      cur = cur.filter((i) => i != unconfirmed_role_id.value);
    }
    new_roles_IDs.value = cur;
  } else return;

  // console.log("member", member.id);
  let params = {
    data: {
      member_id: member.id,
      new_roles: new_roles_IDs.value,
    },
  };
  if (new_roles_IDs.value.length > 0) {
    let _;
    let res;
    if (byInfo.value.project_id) {
      res = await setRole(projectStore.project.id, params);
      if (res?.data) {
        projectStore.project = res.data;
        _ = res.data?.project_members?.find((i) => i.id === member.id);
      }
    }
    if (byInfo.value?.card_id) {
      let params = {
        update_member: {
          member_id: member.id,
          new_roles: new_roles_IDs.value,
        },
      };
      res = await updateCardRole(byInfo.value.card_id, params);
      if (res?.data) {
        projectStore.card = res.data;
        _ = res.data?.card_members?.find((i) => i.id === member.id);
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
  let params = {
    data: {
      removeMember_id: member.id,
    },
  };
  // 此处直接执行即可，相关ws事件在服务端已处理
  const res = await removeUser(projectStore.project.id, params);
  if (res) {
    console.log("removeUser", res);
    let chat_Msg = {
      body: `${userStore.me?.username}移除了项目成员${member.by_user.username}`,
      props: {
        strapi: {
          data: {
            is: byInfo.value.by,
            by_user: userStore.userId,
            action: "member_removed",
            removedMember_id: member.id,
            removeUser_id: member.by_user.id,
          },
        },
      },
    };
    if (byInfo.value.card_id) {
      chat_Msg.props.strapi.data.card_id = byInfo.value.card_id;
    }
    if (byInfo.value.project_id) {
      chat_Msg.props.strapi.data.project_id = byInfo.value.project_id;
    }
    send_chat_Msg(chat_Msg);
  }
};
</script>
