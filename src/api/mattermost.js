import { mmapi } from "boot/mmapi";
import localforage from "localforage";
import { mmUser } from "src/hooks/global/useStore.js";

const token = localStorage.getItem("mmtoken");

//注册
export async function regist(params) {
  try {
    const res = await mmapi.post(`users`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}

//登录
export async function login(params) {
  try {
    const res = await mmapi.post(`users/login`, params);
    if (res) {
      mmUser.user = res.data;
      mmUser.user_id = res.data.id;

      localStorage.setItem("mmtoken", res.headers.token);
      localStorage.setItem("mmUserId", res.data.id);

      await localforage.setItem("__mm_token", res.headers.token);
      await localforage.setItem("__mm_user_id", res.data.id);

      await localforage.setItem("mm_profile", res.data);
      return res;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}
//获取用户 - 指定ID
export async function getUser(uid) {
  try {
    const res = await mmapi.get(`users/${uid}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//获取用户 - 指定ID
export async function getMe() {
  try {
    const res = await mmapi.get(`users/me`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//更新资料
export async function pathMe(params) {
  try {
    const res = await mmapi.put(`users/me/patch`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}
//注销
export async function logout() {
  try {
    const res = await mmapi.post(`users/logout`);
    if (res) {
      return res;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}
//Create a team
//https://api.mattermost.com/#tag/teams/operation/CreateTeam
//https://your-mattermost-url.com/api/v4/teams
export async function createTeam(params) {
  try {
    const res = await mmapi.post(`/teams`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取邀请信息 - 需要 邀请ID
//Get invite info for a team
//https://api.mattermost.com/#tag/teams/operation/GetTeamInviteInfo
//https://your-mattermost-url.com/api/v4/teams/invite/{invite_id}
export async function getInviteInfo(invite_id) {
  try {
    const res = await mmapi.get(`teams/members/invite?invite_id=${invite_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//重新生成邀请ID并返回邀请链接
//Regenerate the Invite ID from a Team
//https://your-mattermost-url.com/api/v4/teams/{team_id}/regenerate_invite_id
//https://api.mattermost.com/#tag/teams/operation/RegenerateTeamInviteId
export async function createInvite(team_id) {
  try {
    const res = await mmapi.post(`teams/${team_id}/regenerate_invite_id`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//通过邮件邀请用户
//Invite users to the team by email
//https://api.mattermost.com/#tag/teams/operation/InviteUsersToTeam
export async function createInviteByEmail(team_id, params) {
  try {
    const res = await mmapi.post(`teams/${team_id}/invite/email`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//通过邮件邀请访客
//Invite guests to the team by email
//https://api.mattermost.com/#tag/teams/operation/InviteGuestsToTeam
//https://your-mattermost-url.com/api/v4/teams/{team_id}/invite-guests/email
export async function createInviteGuestsByEmail(team_id) {
  try {
    const res = await mmapi.post(`teams/${team_id}/invite-guests/email`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a team
//https://api.mattermost.com/#tag/teams/operation/GetTeam
//https://your-mattermost-url.com/api/v4/teams/{team_id}
export async function getTeam(team_id) {
  try {
    const res = await mmapi.get(`teams/${team_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Delete a team
//https://api.mattermost.com/#tag/teams/operation/SoftDeleteTeam
//https://your-mattermost-url.com/api/v4/teams/{team_id}
export async function deleteTeam(team_id) {
  try {
    const res = await mmapi.delete(`teams/${team_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Add user to team
//https://api.mattermost.com/#tag/teams/operation/AddTeamMember
//https://your-mattermost-url.com/api/v4/teams/{team_id}/members
// {
//     "team_id": "string",
//     "user_id": "string"
//  }
export async function addUserToTeam(team_id, params) {
  try {
    const res = await mmapi.post(`teams/${team_id}/members`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//从邀请添加用户 - token
//Add user to team from invite
//https://api.mattermost.com/#tag/teams/operation/AddTeamMemberFromInvite
//https://your-mattermost-url.com/api/v4/teams/members/invite
export async function addToTeamByInvite(invite_id) {
  try {
    const res = await mmapi.post(`teams/members/invite?invite_id=${invite_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Patch a team
//https://api.mattermost.com/#tag/teams/operation/PatchTeam
//https://your-mattermost-url.com/api/v4/teams/{team_id}/patch
export async function patchTeam(team_id, params) {
  try {
    const res = await mmapi.put(`teams/${team_id}/patch`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Remove user from team
//https://api.mattermost.com/#tag/teams/operation/RemoveTeamMember
//https://your-mattermost-url.com/api/v4/teams/{team_id}/members/{user_id}
export async function deleteTeamUser(team_id, user_id) {
  try {
    const res = await mmapi.delete(`teams/${team_id}/members/${user_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取用户团队
export async function getCurUserTeams(uid) {
  try {
    const res = await mmapi.get(`/users/${uid}/teams`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取团队频道
export async function getCurUserChannels(uid, tid) {
  try {
    const res = await mmapi.get(`/users/${uid}/teams/${tid}/channels`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取频道 - 频道ID
//Get a channel
export async function getChannelByID(channel_id) {
  try {
    const res = await mmapi.get(`/channels/${channel_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Create a channel
//https://api.mattermost.com/#tag/channels/operation/CreateChannel
//https://your-mattermost-url.com/api/v4/channels
// {
//     "team_id": "string", *
//     "name": "string", *
//     "display_name": "string", *
//     "purpose": "string",
//     "header": "string",
//     "type": "string" *
//   }
export async function createChannel(params) {
  try {
    const res = await mmapi.post(`/channels`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Update a channel
// https://api.mattermost.com/#tag/channels/operation/UpdateChannel
// https://your-mattermost-url.com/api/v4/channels/{channel_id}
// {
//     "id": "string", //required
//     "name": "string",
//     "display_name": "string",
//     "purpose": "string",
//     "header": "string"
// }
export async function updateChannel(channel_id, params) {
  try {
    const res = await mmapi.put(`/channels/${channel_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function patchChannel(channel_id, params) {
  try {
    const res = await mmapi.put(`/channels/${channel_id}/patch`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// Delete a channel
// https://api.mattermost.com/#tag/channels/operation/DeleteChannel
// https://your-mattermost-url.com/api/v4/channels/{channel_id}
export async function deleteChannel(channel_id) {
  try {
    const res = await mmapi.delete(`/channels/${channel_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取频道 - 用户团队ID

export async function getChannelByUserTeamID(user_id, team_id) {
  try {
    const res = await mmapi.get(`/users/${user_id}/teams/${team_id}/channels`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取团队频道 - 团队ID 频道ID
export async function getTeamChannels(team_id, channel_ids) {
  try {
    const res = await mmapi.post(`/teams/${team_id}/channels/ids`, channel_ids);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取频道posts
//https://api.mattermost.com/#tag/posts/operation/GetPostsForChannel
export async function getPostsOfChannel(channel_id, options) {
  try {
    const res = await mmapi.get(
      `channels/${channel_id}/posts?${options}&skipFetchThreads=false&collapsedThreads=true&collapsedThreadsExtended=false`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// Get a post
// https://api.mattermost.com/#tag/posts/operation/GetPost
// https://your-mattermost-url.com/api/v4/posts/{post_id}

export async function getPost(post_id) {
  try {
    const res = await mmapi.get(`posts/${post_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取频道用户
// https://mattermost.yihu.team/api/v4/users?in_channel=e9kb5nimrjyoimmmmgzsbuetxw&page=0&per_page=100&sort=admin
export async function getUsers(params) {
  try {
    const res = await mmapi.get(
      `users?in_channel=${params.channel_id}&page=${params.page}&per_page=${params.per_page}&sort=${params.sort}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//获取多个用户
export async function getUsersByIDs(ids) {
  try {
    const res = await mmapi.post(`users/ids`, ids);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// Get channel memberships and roles for a user
// https://api.mattermost.com/#tag/channels/operation/GetChannelMembersForUser
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/members
export async function getChannelMembershipsRoles(user_id, team_id) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/teams/${team_id}/channels/members`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Autocomplete users
//https://your-mattermost-url.com/api/v4/users/autocomplete
//https://api.mattermost.com/#tag/users/operation/AutocompleteUsers
export async function autoUsers(params) {
  try {
    const res = await mmapi.get(`users/autocomplete`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取团队用户 - 团队ID
//Get team members
export async function getMembersByTeamID(team_id, page, per_page) {
  try {
    const res = await mmapi.get(
      `teams/${team_id}/members?page=${page}&per_page=${per_page}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取用户头像
// https://your-mattermost-url.com/api/v4/users/{user_id}/image
export async function getAvatar(user_id, props) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/image${props ? "?" + Date.now() : ""}`,
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}

//获取用户自动生成头像
export async function getAutoAvatar(user_id) {
  try {
    const res = await mmapi.get(`users/${user_id}/image/default`);
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}

//Set user's profile image
//https://api.mattermost.com/#tag/users/operation/SetProfileImage
//https://your-mattermost-url.com/api/v4/users/{user_id}/image
export async function setAvatar(user_id, multipartData) {
  try {
    const res = await mmapi.post(`users/${user_id}/image`, multipartData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // 设置内容类型
      },
    });
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//获取用户状态
//Get user status
//https://api.mattermost.com/#tag/status/operation/GetUserStatus
//https://your-mattermost-url.com/api/v4/users/{user_id}/status
export async function getUserStatus(user_id) {
  try {
    const res = await mmapi.get(`users/${user_id}/status`);
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}
//Update user status
//https://api.mattermost.com/#tag/status/operation/UpdateUserStatus
//https://your-mattermost-url.com/api/v4/users/{user_id}/status
// {
//     "user_id": "string",
//     "status": "string",
//     "dnd_end_time": 0
// }
export async function updateUserStatus(user_id, params) {
  try {
    const res = await mmapi.put(`users/${user_id}/status`, params);
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}
//Get user statuses by ids
//https://api.mattermost.com/#tag/status/operation/GetUsersStatusesByIds
//https://your-mattermost-url.com/api/v4/users/status/ids
// [
//     "string"
// ]
export async function getUserStatusBy_ids(params) {
  if (params.length === 0) return;
  try {
    const res = await mmapi.post(`users/status/ids`, params);
    if (res.data) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}

// 发送消息
export async function sendPost(params) {
  try {
    const res = await mmapi.post(`posts`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get team unreads for a user
//https://api.mattermost.com/#tag/teams/operation/GetTeamsUnreadForUser
//https://your-mattermost-url.com/api/v4/users/{user_id}/teams/unread
export async function getTeamUnreads(user_id) {
  try {
    const res = await mmapi.get(`users/${user_id}/teams/unread`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get team unreads for a user
// https://api.mattermost.com/#tag/teams/operation/GetTeamUnread
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/unread
export async function getUnreadsForTeam(user_id, team_id) {
  try {
    const res = await mmapi.get(`users/${user_id}/teams/${team_id}/unread`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Get unread messages
//https://api.mattermost.com/#tag/channels/operation/GetChannelUnread
//https://your-mattermost-url.com/api/v4/users/{user_id}/channels/{channel_id}/unread
export async function getChannelUnreads(user_id, channel_id) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/channels/${channel_id}/unread`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 获取频道用户
//Get channel members
//https://api.mattermost.com/#tag/channels/operation/GetChannelMembers
//https://your-mattermost-url.com/api/v4/channels/{channel_id}/members
export async function getChannelMembers(channel_id) {
  try {
    const res = await mmapi.get(`channels/${channel_id}/members`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// View channel
// https://api.mattermost.com/#tag/channels/operation/ViewChannel
// https://your-mattermost-url.com/api/v4/channels/members/{user_id}/view
export async function viewChannel(user_id, params) {
  try {
    const res = await mmapi.post(`/channels/members/${user_id}/view`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//View channel
//https://api.mattermost.com/#tag/channels/operation/ViewChannel
//https://your-mattermost-url.com/api/v4/channels/members/{user_id}/view
// {
//     "channel_id": "string",
//     "prev_channel_id": "string"
// }
export async function view(user_id, params) {
  try {
    const res = await mmapi.post(`channels/members/${user_id}/view`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Search users
//https://api.mattermost.com/#tag/users/operation/SearchUsers
//https://your-mattermost-url.com/api/v4/users/search
// {
//     "term": "j",
//     "team_id": "ingwc3g1njru8ka318z4azooah",
//     "not_in_channel_id": "nmygqwyictybinetswm1fxxo1a",
//     "group_constrained": null
// }
export async function searchMember(params) {
  try {
    const res = await mmapi.post(`users/search`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//修改频道用户权限
//Update the scheme-derived roles of a channel member.
//https://api.mattermost.com/#tag/channels/operation/UpdateChannelMemberSchemeRoles
//https://your-mattermost-url.com/api/v4/channels/{channel_id}/members/{user_id}/schemeRoles
export async function changeChannelRoles_for_member(
  channel_id,
  user_id,
  params
) {
  try {
    const res = await mmapi.put(
      `channels/${channel_id}/members/${user_id}/schemeRoles`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Add user to channel
//https://api.mattermost.com/#tag/channels/operation/AddChannelMember
//https://your-mattermost-url.com/api/v4/channels/{channel_id}/members
// {
//   "user_id": "string",
//   "post_root_id": "string"
// }
export async function addMemberToChannel(channel_id, params) {
  try {
    const res = await mmapi.post(`channels/${channel_id}/members`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Remove user from channel
//https://api.mattermost.com/#tag/channels/operation/RemoveUserFromChannel
//https://your-mattermost-url.com/api/v4/channels/{channel_id}/members/{user_id}
export async function RemoveUserFromChannel(channel_id, user_id) {
  try {
    const res = await mmapi.delete(`channels/${channel_id}/members/${user_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Create a direct message channel
//https://api.mattermost.com/#tag/channels/operation/CreateDirectChannel
// 创建私信频道
export async function createDirect(a, b) {
  try {
    const res = await mmapi.post(`channels/direct`, [a, b]);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Create a group message channel - user ids array
//https://api.mattermost.com/#tag/channels/operation/CreateGroupChannel
//https://your-mattermost-url.com/api/v4/channels/group
export async function createGroup(user_ids_array) {
  try {
    const res = await mmapi.post(`channels/group`, user_ids_array);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 获取用户在指定团队的侧栏分组数据
export async function getUseSidebarDataByTeam(user_id, team_id) {
  try {
    const res = await mmapi.get(
      `/users/${user_id}/teams/${team_id}/channels/categories`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Create user's sidebar category
//https://api.mattermost.com/#tag/channels/operation/CreateSidebarCategoryForTeamForUser
// POST https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/categories
export async function createSidebarCategory(user_id, team_id, params) {
  try {
    const res = await mmapi.post(
      `users/${user_id}/teams/${team_id}/channels/categories`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Get user's sidebar category order
//https://api.mattermost.com/#tag/channels/operation/GetSidebarCategoryOrderForTeamForUser
//https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/categories/order
export async function getSidebarCategoryOrder(user_id, team_id) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/teams/${team_id}/channels/categories/order`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 更新用户在指定团队的侧栏分组条目数据 - 条目
export async function updateSidebarCategory(
  user_id,
  team_id,
  category_id,
  params
) {
  try {
    const res = await mmapi.put(
      `users/${user_id}/teams/${team_id}/channels/categories/${category_id}`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Update user's sidebar categories
//https://api.mattermost.com/#tag/channels/operation/UpdateSidebarCategoriesForTeamForUser
//https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/categories
// 更新用户在指定团队的侧栏数据 - 分组
export async function updateSidebarCategorys(user_id, team_id, params) {
  try {
    const res = await mmapi.put(
      `users/${user_id}/teams/${team_id}/channels/categories`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Delete sidebar category
//https://api.mattermost.com/#tag/channels/operation/RemoveSidebarCategoryForTeamForUser
//https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/categories/{category_id}
export async function deleteSidebarCategorys(user_id, team_id, category_id) {
  try {
    const res = await mmapi.delete(
      `users/${user_id}/teams/${team_id}/channels/categories/${category_id}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 获取用户偏好设置
export async function getUserPreferences(user_id) {
  try {
    const res = await mmapi.get(`users/${user_id}/preferences`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 更新用户偏好设置
export async function updateUserPreferences(user_id, params) {
  try {
    const res = await mmapi.put(`users/${user_id}/preferences`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// Delete user's preferences
// https://your-mattermost-url.com/api/v4/users/{user_id}/preferences/delete
export async function deleteUserPreferences(user_id, params) {
  try {
    const res = await mmapi.post(`users/${user_id}/preferences/delete`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// Threads
// Get all threads that user is following
export async function getThreadsByUserTeamID(user_id, team_id, options) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/teams/${team_id}/threads?${options}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a thread
//https://api.mattermost.com/#tag/posts/operation/GetPostThread
// skipFetchThreads: 这个参数是一个布尔值，表示是否跳过获取线程的详细信息。如果设置为true，那么返回的结果中只包含线程的基本信息
// 如ID，创建时间，更新时间，回复数，参与者等
// 如果设置为false，那么返回的结果中还会包含线程的所有回复的内容，发送者，附件等。

//2
// collapsedThreads: 这个参数是一个布尔值，表示是否启用折叠线程的功能
// 如果设置为如果设置为true，那么返回的结果中会根据用户的偏好设置，把一些线程折叠起来，只显示未读的或者关注的线程
// 如果设置为false，那么返回的结果中会显示所有的线程。

//3
// collapsedThreadsExtended: 这个参数是一个布尔值，表示是否返回折叠线程的扩展信息
//如果设置为false，那么返回的结果中不会包含任何折叠线程的扩展信息
//如果设置为true，那么返回的结果中会包含折叠线程的所有扩展信息，如最后一条回复的内容，发送者，时间等。
export async function getThread(post_id, options) {
  try {
    const res = await mmapi.get(
      `posts/${post_id}/thread?${options}&skipFetchThreads=false&collapsedThreads=false&collapsedThreadsExtended=true&direction=up`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a thread followed by the user
//https://api.mattermost.com/#tag/threads/operation/GetUserThread
//https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/threads/{thread_id}
export async function getFollowedThread(user_id, team_id, thread_id) {
  try {
    const res = await mmapi.get(
      `users/${user_id}/teams/${team_id}/threads/${thread_id}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// Start following a thread
// 关注主题
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/threads/{thread_id}/following
export async function followThread(user_id, team_id, thread_id) {
  try {
    const res = await mmapi.put(
      `users/${user_id}/teams/${team_id}/threads/${thread_id}/following`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/threads/{thread_id}/following
// 取消关注主题
export async function removeThread(user_id, team_id, thread_id) {
  try {
    const res = await mmapi.delete(
      `users/${user_id}/teams/${team_id}/threads/${thread_id}/following`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/threads/read
// Mark all threads that user is following as read
export async function readAllThreads(user_id, team_id) {
  try {
    const res = await mmapi.put(
      `users/${user_id}/teams/${team_id}/threads/read`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Mark a thread that user is following read state to the timestamp
//https://api.mattermost.com/#tag/threads/operation/UpdateThreadReadForUser
//PUT https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/threads/{thread_id}/read/{timestamp}
export async function readThread(user_id, team_id, thread_id) {
  try {
    const res = await mmapi.put(
      `users/${user_id}/teams/${team_id}/threads/${thread_id}/read/${Date.now()}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Mark a thread that user is following as unread based on a post id

export async function unreadThread(user_id, team_id, thread_id, post_id) {
  try {
    const res = await mmapi.post(
      `users/${user_id}/teams/${team_id}/threads/${thread_id}/set_unread/${post_id}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Get a channel's pinned posts
//https://api.mattermost.com/#tag/channels/operation/GetPinnedPosts
export async function getPinneds(channel_id) {
  try {
    const res = await mmapi.get(`channels/${channel_id}/pinned`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a list of flagged posts
//https://api.mattermost.com/#tag/posts/operation/GetFlaggedPostsForUser
export async function getFlagged(user_id, options) {
  try {
    const res = await mmapi.get(`users/${user_id}/posts/flagged?${options}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Pin a post to the channel
//https://your-mattermost-url.com/api/v4/posts/{post_id}/pin

export async function pinPost(post_id) {
  try {
    const res = await mmapi.post(`posts/${post_id}/pin`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//Unpin a post to the channel
//https://your-mattermost-url.com/api/v4/posts/{post_id}/unpin

export async function unpinPost(post_id) {
  try {
    const res = await mmapi.post(`posts/${post_id}/unpin`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//表情
//Create a reaction
//https://api.mattermost.com/#tag/reactions/operation/SaveReaction
//https://your-mattermost-url.com/api/v4/reactions
// {
//     "user_id": "string",
//     "post_id": "string",
//     "emoji_name": "string",
//     "create_at": 0
// }
export async function addReaction(params) {
  try {
    const res = await mmapi.post(`reactions`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// Get a list of custom emoji
// https://api.mattermost.com/#tag/emoji/operation/GetEmojiList
// https://your-mattermost-url.com/api/v4/emoji
export async function getCustomEmoji() {
  try {
    const res = await mmapi.get(`emoji`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// Get a list of reactions to a post
// https://api.mattermost.com/#tag/reactions/operation/GetReactions
// https://your-mattermost-url.com/api/v4/posts/{post_id}/reactions
export async function getReaction(post_id) {
  try {
    const res = await mmapi.get(`posts/${post_id}/reactions`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//文件处理
//Get a file
//https://api.mattermost.com/#tag/files/operation/GetFile
//https://your-mattermost-url.com/api/v4/files/{file_id}
export async function file(file_id) {
  try {
    const res = await mmapi.get(`files/${file_id}`, {
      responseType: "arraybuffer",
    });
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a file's thumbnail
export async function fileThumbnail(file_id) {
  try {
    const res = await mmapi.get(`files/${file_id}/thumbnail`, {
      responseType: "arraybuffer",
    });
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a file's preview
export async function filePreview(file_id) {
  try {
    const res = await mmapi.get(`files/${file_id}/preview`, {
      responseType: "arraybuffer",
    });
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//Get a public file link
export async function fileLink(file_id) {
  try {
    const res = await mmapi.get(`files/${file_id}/link`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//单文件上传
//Upload a file
//https://api.mattermost.com/#tag/files/operation/UploadFile
//https://your-mattermost-url.com/api/v4/files
export async function uploadFile(params) {
  try {
    const res = await mmapi.post(`files`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//大文件上传
//Create an upload
//https://api.mattermost.com/#tag/uploads/operation/CreateUpload

//1.创建上传会话
//https://your-mattermost-url.com/api/v4/uploads
// {
//     "channel_id": "string",
//     "filename": "string",
//     "file_size": 0
// }
export async function create_a_upload(params) {
  try {
    const res = await mmapi.post(`uploads`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//2.获取会话ID
//https://api.mattermost.com/#tag/uploads/operation/GetUpload
//https://your-mattermost-url.com/api/v4/uploads/{upload_id}

export async function createUploadSession(upload_id, params) {
  try {
    const res = await mmapi.post(`uploads/${upload_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//3.上传文件
//Perform a file upload
//https://api.mattermost.com/#tag/uploads/operation/UploadData
//https://your-mattermost-url.com/api/v4/uploads/{upload_id}

//支持的格式
// Binary file content streamed in request's body
// multipart/form-data

export async function upload(upload_id, data) {
  try {
    const res = await mmapi.post(`uploads/${upload_id}`, data);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
