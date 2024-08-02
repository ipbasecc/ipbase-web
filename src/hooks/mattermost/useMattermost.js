import {onUnmounted, ref} from "vue";
import {
  getUser,
  getUserPreferences,
  getTeam,
  getChannelByID,
  getMembersByTeamID,
  getUsersByIDs,
  getUserStatusBy_ids, viewChannel,
} from "src/api/mattermost.js";

import localforage from "localforage";
import {mmstore, mmUser, uiStore} from "src/hooks/global/useStore.js";

export function mergePosts(post1, post2, post3) {
  const mergedPosts = {};

  if (post1) {
    for (const key in post1) {
      mergedPosts[key] = post1[key];
    }
  }
  if (post2) {
    for (const key in post2) {
      mergedPosts[key] = post2[key];
    }
  }
  if (post3) {
    for (const key in post3) {
      mergedPosts[key] = post3[key];
    }
  }

  return mergedPosts;
}

// 初始化当前用户的Mattermost账号
const uid = ref(localStorage.getItem("mmUserId") || null);
export async function init_mmuser() {
  try {
    let _ = await localforage.getItem("mm_profile");
    if (_) {
      mmUser.user = _;
    }

    let res = await getUser(uid.value);
    if (res) {
      mmUser.user = res.data;
    }
  } catch (error) {
    console.error(error);
  }
}

// 获取指定ID的Mattermost用户的资料
const mmuser_byID = ref();
export async function get_mmuser(user_id) {
  const key = `__mm_user__${user_id}`;
  try {
    let _ = await localforage.getItem(key);
    if (_) {
      mmuser_byID.value = _;
    }

    let res = await getUser(user_id);
    if (res) {
      mmuser_byID.value = res.data;
    }
  } catch (error) {
    console.error(error);
  }
}

// 获取当前用户偏好设置
const user_preferences = ref();
export async function fetch_userPreferences() {
  try {
    let res = await getUserPreferences(uid.value);
    if (res) {
      user_preferences.value = res.data;
      mmstore.preferences = res.data;
    }
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

// 获取Mattermost团队信息
export async function getMmTeam(team_id) {
  let res = await getTeam(team_id);
  if (res) {
    mmstore.team = res.data;
    mmstore.current_team_id = team_id;
    mmstore.current_teamName = res.data?.name;
    return res;
  }
}

export async function getMmChannel(channel_id) {
  const res = await getChannelByID(channel_id);
  if (res) {
    mmstore.projectChannel = res.data;
    await localforage.setItem(`__channel_${channel_id}`, res.data);
  }
}

export async function getTeamMembers(team_id, page, per_page) {
  let res = await getMembersByTeamID(team_id, page, per_page);
  if (res) {
    let members = res.data;
    const users_ids = members.map((i) => i.user_id);

    let profiles = await getUsersByIDs(users_ids);
    let _status = await getUserStatusBy_ids(users_ids);

    if (profiles) {
      for (let user of members) {
        user.profile = profiles.data?.find((i) => i.id === user.user_id);
      }
    }
    if (_status) {
      for (let user of members) {
        user.status = _status?.find((i) => i.user_id === user.user_id);
      }
    }
    mmstore.members = members;
  }
}

// 执行view事件，保持与Mattermost的连接
const mm_user_id = localStorage.getItem("mmUserId");
const mm_channel_id = ref()
const viewed = ref(false);
const channelIndex = ref()
const findIndex = (_mm_channel_id) => {
  const index = uiStore.unreads?.channels.findIndex(
    i => i.channel_id === _mm_channel_id)
  if(index !== -1){
    channelIndex.value = index
  }
}
const updateUnreadCount = (_mm_channel_id) => {
  if(!channelIndex.value) return
  const unreadCount = uiStore.unreads.channels[channelIndex.value].msg_count;
  uiStore.unreads.channels[channelIndex.value].msg_count = 0;
  uiStore.unreads.team.msg_count = uiStore.unreads.team.msg_count - unreadCount
}
export async function __viewChannel(channel_id) {
  const view = async () => {
    if(!channel_id || viewed.value) return
    findIndex(channel_id);
    if(!channelIndex.value) return

    mm_channel_id.value = channel_id
    let params = {
      channel_id: channel_id,
    };
    let res = await viewChannel(mm_user_id, params);
    if (res) {
      viewed.value = true;
      updateUnreadCount(channel_id);
      setTimeout(() => {
        viewed.value = false;
      }, 3000);
    }
  }
  await view();
// 当用户点击页面时，如果 viewed 为 false，则执行 view
  window.addEventListener("click", view,
    { passive: true }
  );
  // 当浏览器标签页面由非活跃状态切换为活跃状态时，执行 view
  document.addEventListener("visibilitychange", view);
  onUnmounted(() => {
    window.removeEventListener('click', view)
    window.removeEventListener('visibilitychange', view)
  })
}
