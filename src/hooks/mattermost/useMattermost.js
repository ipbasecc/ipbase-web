import {ref,onUnmounted} from "vue";
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

// 废弃方法，测试后删除
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

const mm_user_id = localStorage.getItem("mmUserId");
const mm_channel_id = ref()
const channelIndex = ref()
const findIndex = (_mm_channel_id) => {
  const index = uiStore.unreads?.channels.findIndex(
    i => i.channel_id === _mm_channel_id)
  if(index > -1){
    channelIndex.value = index
  }
}
const updateUnreadCount = (_mm_channel_id) => {  
  if(channelIndex.value < 0) return

  const unreadCount = uiStore.unreads?.channels[channelIndex.value]?.msg_count;
  uiStore.unreads.team.msg_count = uiStore.unreads?.team?.msg_count - unreadCount
  if(uiStore.unreads?.team?.msg_count < 0){
    uiStore.unreads.team.msg_count = 0;
  }
  if(uiStore.unreads?.channels[channelIndex.value]){
    uiStore.unreads.channels[channelIndex.value].msg_count = 0;
  }
}

// 执行view事件，保持与Mattermost的连接
const viewed = ref(false);
let viewTimer = null;
let autoViewTimer = null;

export async function __viewChannel(channel_id) {
  // 清理之前的定时器
  if (viewTimer) clearTimeout(viewTimer);
  if (autoViewTimer) clearTimeout(autoViewTimer);
  
  if (!channel_id) return;
  const view = async () => {
    viewed.value = true;
    mm_channel_id.value = channel_id;

    let params = {
      channel_id: channel_id,
    };    
    let res = await viewChannel(mm_user_id, params);
    
    if (res) {
      // 5秒内不重复执行
      viewTimer = setTimeout(() => {
        viewed.value = false;
      }, 5000);

      findIndex(channel_id);
      // console.log('findIndex', channelIndex.value);
      
      if (channelIndex.value < 0) return;
      updateUnreadCount(channel_id);
    }
  };

  // 初始执行
  await view();

  // 设置10秒循环执行
  const startAutoView = () => {
    autoViewTimer = setInterval(view, 30000);
  };

  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      view(); // 页面变为可见时立即执行一次
      startAutoView(); // 重新开始自动执行
    } else {
      // 页面不可见时清除定时器
      if (autoViewTimer) clearInterval(autoViewTimer);
    }
  };

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 开始自动执行
  startAutoView();

  // 组件卸载时清理
  onUnmounted(() => {
    if (viewTimer) clearTimeout(viewTimer);
    if (autoViewTimer) clearInterval(autoViewTimer);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });
}