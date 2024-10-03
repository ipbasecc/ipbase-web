import { computed, ref, watchEffect, watch } from "vue";
import {
  removeUser as removeProjectUser,
  setRole,
  updateCardRole,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { useCardname } from "src/hooks/project/useCardname.js";

import {
  setTeamRole,
  setChannelRole,
  removeTeamUser,
  removeChannelUser,
} from "src/api/strapi/team.js";
import { updateCard } from "src/api/strapi/project.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";

export async function setTeamRoleFn(team_id, member_id, new_roles_IDs) {
  let params = {
    update_member: {
      member_id: member_id,
      new_roles: new_roles_IDs,
    },
  };
  const res = await setTeamRole(team_id, params);
  if (res?.data) {
    // return
    return res?.data;
  }
}
export async function setProjectRoleFn(project_id, member_id, new_roles_IDs) {
  let params = {
    data: {
      member_id: member_id,
      new_roles: new_roles_IDs,
    },
  };
  const {data} = await setRole(project_id, params);
  if (data) {
    return data;
  }
}
export async function setCardRoleFn(card_id, member_id, new_roles_IDs) {
  let params = {
    update_member: {
      member_id: member_id,
      new_roles: new_roles_IDs,
    },
  };
  const res = await updateCardRole(card_id, params);
  if (res?.data) {
    const member_updated = res?.data.card_members.find((i) => i.id === card_id);
    return member_updated;
  }
}
export async function setChannelRoleFn(channel_id, member_id, new_roles_IDs) {
  let params = {
    update_member: {
      member_id: member_id,
      new_roles: new_roles_IDs,
    },
  };
  const res = await setChannelRole(channel_id, params);
  if (res?.data) {
    return res?.data;
  }
}

const removeTeamMember = async (team_id, member) => {
  let params = {
    data: {
      removeMember_id: member.id,
    },
  };
  const res = await removeTeamUser(team_id, params);
  if (res) {
    return
  }
};
const removeProjectMember = async (project_id, member) => {
  const params = {
    data: {
      removeMember_id: member.id,
    },
  };
  const res = await removeProjectUser(project_id, params);
  if (res) {
  }
};
const removeChannelMember = async (channel_id, member) => {
  const params = {
    data: {
      removeMember_id: member.id,
    },
  };
  const res = await removeChannelUser(channel_id, params);
  if (res) {
  }
};
const removeCardMember = async (card_id, member) => {
  const params = {
    remove_member: member.id,
  };
  const res = await updateCard(card_id, params);
  if (res?.data) {
    return res?.data;
  }
};

export async function removeMember(byInfo, member) {
  if (byInfo.team_id) {
    await removeTeamMember(byInfo.team_id, member);
  }
  if (byInfo.project_id) {
    await removeProjectMember(byInfo.project_id, member);
  }
  if (byInfo.channel_id) {
    await removeChannelMember(byInfo.channel_id, member);
  }
  if (byInfo.card_id) {
    await removeCardMember(byInfo.card_id, member);
  }
}

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

export const new_roles_IDs = ref();
export const set_new_roles_IDs = (member) => {
  if (!member) return [];
  new_roles_IDs.value = member?.member_roles?.map((i) => i.id);
};