import { getAvatar } from "src/api/mattermost.js";
import localforage from "localforage";
import useMmuser from "src/stores/mmuser.js";
const mmUserStore = useMmuser();

export async function useFetchAvatar(user_id, val) {
  let avatar_key = `__${user_id}_avatar`;
  let _cache = await localforage.getItem(avatar_key);

  //没缓存 - 找后端
  if (!_cache || val === "force") {
    let res = await getAvatar(user_id, "force");
    if (res) {
      await localforage.setItem(avatar_key, res);
      const blob = new Blob([res]);
      let url = window.URL.createObjectURL(blob);
      if (user_id === mmUserStore.user_id) {
        mmUserStore.current_user_avatar = url;
      }
      return url;
    }
  } else {
    // console.log('头像来自缓存');
    const blob = new Blob([_cache]);
    let url = window.URL.createObjectURL(blob);
    if (user_id === mmUserStore.user_id) {
      mmUserStore.current_user_avatar = url;
    }
    return url;
  }
}

export async function useFetchAvatarArrayBuffer(user_id, val) {
  // let avatar_key = `__${user_id}_avatar`
  // let _cache = await localforage.getItem(avatar_key);

  let res = await getAvatar(user_id);
  if (res) {
    // await localforage.setItem(avatar_key,res);
    return res;
  }
}

export async function useFecthCacheAvatar(user_id, val) {
  let avatar_key = `__${user_id}_avatar`;
  let _cache = await localforage.getItem(avatar_key);

  //没缓存 - 找后端
  if (!_cache || val === "force") {
    let res = await getAvatar(user_id);
    if (res) {
      let cache = await localforage.setItem(avatar_key, res);
      if (cache) {
        return cache;
      }
    }
  } else {
    return _cache;
  }
}
