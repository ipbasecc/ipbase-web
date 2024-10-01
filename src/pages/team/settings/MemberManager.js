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
  const res = await setRole(project_id, params);
  if (res?.data) {
    teamStore.project = res.data;
    let chat_Msg = {
      body: `项目成员被更新`,
      props: {
        strapi: {
          data: {
            is: "project",
            by_user: userStore.userId,
            action: "project_member_updated",
            team_id: teamStore.team?.id,
            project_id: project_id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
    const member_updated = res?.data.project_members.find(
      (i) => i.id === member_id
    );
    return member_updated;
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
    let chat_Msg = {
      body: `卡片成员被更新`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            action: "card_member_updated",
            team_id: teamStore.team?.id,
            card_id: card_id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
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
    let chat_Msg = {
      body: `频道成员被更新`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            action: "channel_member_updated",
            team_id: teamStore.team?.id,
            channel_id: channel_id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
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
    let chat_Msg = {
      body: `${userStore.me?.username}移除了团队成员${member.by_user.username}`,
      props: {
        strapi: {
          data: {
            is: "team",
            by_user: userStore.userId,
            action: "member_removed",
            removedMember_id: member.id,
            removeUser_id: member.by_user.id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
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
    let chat_Msg = {
      body: `${userStore.me?.username}移除了项目成员${member.by_user.username}`,
      props: {
        strapi: {
          data: {
            is: "project",
            by_user: userStore.userId,
            project_id: project_id,
            action: "member_removed",
            removedMember_id: member.id,
            removeUser_id: member.by_user.id,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
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
    // teamStore.card = res.data;
    let chat_Msg = {
      body: `${userStore.me?.username}移除了频道成员${member.by_user.username}`,
      props: {
        strapi: {
          data: {
            is: "channel",
            by_user: userStore.userId,
            channel_id: channel_id,
            removeMember_id: member.id,
            action: "member_removed",
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const removeCardMember = async (card_id, member) => {
  const params = {
    remove_member: member.id,
  };
  const res = await updateCard(card_id, params);
  if (res?.data) {
    // teamStore.card = res.data;
    let chat_Msg = {
      body: `${userStore.me?.username}已除了卡片：${useCardname(
        teamStore.card
      )}成员：${member.nickname || member.by_user.username}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: card_id,
            member_id: member.id,
            action: "card_member_removed",
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
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
