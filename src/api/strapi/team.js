import { api } from "boot/axios";

// 获取用户团队列表
export async function fetchTeams() {
  try {
    const res = await api.get(`teams`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res;
    } else {
      console.log(error);
    }
  }
}
// 获取指定团队
export async function getTeamByID(team_id) {
  try {
    const res = await api.get(`teams/${team_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return error;
    } else {
      console.log(error);
    }
  }
}

// 创建团队
export async function createTeam_strapi(params) {
  try {
    const res = await api.post(`teams`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res;
    } else {
      console.log(error);
    }
  }
}
// 修改团队
export async function updateTeam(team_id, params) {
  try {
    const res = await api.put(`teams/${team_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 离开团队
export async function leaveTeam(team_id) {
  try {
    const res = await api.post(`teams/${team_id}/leave`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 删除团队
export async function removeTeam(team_id) {
  try {
    const res = await api.delete(`teams/${team_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 设置默认团队
export async function setDefaultTeam(params) {
  try {
    const res = await api.put(`users-permissions/user/me/default_team`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res;
    } else {
      console.log(error);
    }
  }
}
// 设置默认团队
/**
 * 
 * @param {Number | String} team_id 
 * @param {Number} page 
 * @param {Number} per_page 
 * @returns 
 */
export async function getTeamDocuments(team_id, page, per_page) {
  if(!team_id){
    throw new Error("team_id is required")
  }
  if(!page){
    throw new Error("page is required")
  }
  if(!per_page){
    throw new Error("per_page is required")
  }
  try {
    const res = await api.get(`teams/${team_id}/documents?page=${page}&per_page=${per_page}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res;
    } else {
      console.log(error);
    }
  }
}
// 创建团队邀请链接
// params: {
//     "max_total": 10,
//     "up_time": 1661012592826
// }
export async function genTeamInvite(team_id, params) {
  try {
    const res = await api.post(`teams/${team_id}/invite`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 访问邀请
export async function visitTeamInvite(team_id, invite_code) {
  try {
    const res = await api.get(`teams/visit_invite/${team_id}/${invite_code}`);
    if (res) {
      return res;
    }
  } catch (error) {
    console.log("...", error.response);
    return error.response;
  }
}
// 访问项目邀请链接 成为待确认成员
export async function acceptTeamInvite(team_id, invite_code) {
  try {
    const res = await api.get(`teams/invite/${team_id}/${invite_code}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 拒绝用户
export async function removeTeamUser(team_id, params) {
  try {
    const res = await api.post(`teams/${team_id}/remove_user`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 设置角色
export async function setTeamRole(team_id, params) {
  try {
    const res = await api.post(`teams/${team_id}/set_role`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 创建频道邀请链接
// params: {
//     "max_total": 10,
//     "up_time": 1661012592826
// }
export async function genChannelInvite(channel_id, params) {
  try {
    const res = await api.post(`team-channels/${channel_id}/invite`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 访问邀请
export async function visitChannelInvite(channel_id, invite_code) {
  try {
    const res = await api.get(
      `team-channels/visit_invite/${channel_id}/${invite_code}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    console.log("...", error.response);
    return error.response;
  }
}
// 访问项目邀请链接 成为待确认成员
export async function acceptChannelInvite(channel_id, invite_code) {
  try {
    const res = await api.get(
      `team-channels/invite/${channel_id}/${invite_code}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 拒绝用户
export async function removeChannelUser(channel_id, params) {
  try {
    const res = await api.post(
      `team-channels/${channel_id}/remove_user`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 设置角色
export async function setChannelRole(channel_id, params) {
  try {
    const res = await api.post(`team-channels/${channel_id}/set_role`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 获取频道
export async function getChannelByID(channel_id) {
  try {
    const res = await api.get(`team-channels/${channel_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 创建频道
export async function createChannel(params) {
  try {
    const res = await api.post(`team-channels`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 更新频道
export async function updateChannel(channel_id, params) {
  try {
    const res = await api.put(`team-channels/${channel_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 删除频道
export async function removeChannel(channel_id) {
  try {
    const res = await api.delete(`team-channels/${channel_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
