import { getUser } from "src/api/mattermost.js";
import localforage from "localforage";
import mmUserStore from "src/stores/mmuser.js";
import { init_user } from "src/api/strapi/project";

import { refreshToken } from 'src/api/strapi.js'
import { jwtDecode } from "jwt-decode";

let needRefreshToken = false;
let needLogin = false;
const checkToken = () => {
  const token = localStorage.getItem('jwt');
  if(token){
    const decoded = jwtDecode(token);
    const exp = decoded?.exp;
    // 获取过期时间
    const expirationDate = exp * 1000;
    // 获取当前时间
    const now = new Date();
    const currentDate = now.getTime();
    if((expirationDate - currentDate) < 24 * 60 * 60 * 1000 * 2){
      needLogin = true;
    } else if ((expirationDate - currentDate) < 24 * 60 * 60 * 1000) {
      needRefreshToken = true;
    }
  }
}

const mm_user_id = localStorage.getItem("mmUserId");
const mmUser = mmUserStore();

let invalid = [undefined, null, NaN, ""];
export async function fetch_MmMe() {
  let me = await localforage.getItem("mm_profile");
  if (me && !invalid.includes(me)) {
    mmUser.user = me;
    mmUser.user_id = me?.id;
    return me;
  } else {
    let res = await getUser(mm_user_id);
    if (res) {
      await localforage.setItem("mm_profile", res.data);
      mmUser.user = res.data;
      mmUser.user_id = res.data?.id;
      return res.data;
    }
  }
}

export async function fetch_StrapiMe(option = "cache") {
  let _me
  const unuseCache = async () => {
    let res = await init_user();
    if (res) {
      return res.data;
    }
  }
  const useCache = async () => {
    let _strapiMe = await localforage.getItem("init");
    if (_strapiMe && !invalid.includes(_strapiMe)) {
      return _strapiMe;
    } else {
      return unuseCache();
    }
  }
  if (option === "cache") {
    _me = await useCache();
  } else {
    _me = await unuseCache();
  }

  if(_me){
    checkToken()

    if(needRefreshToken){
      await refreshToken();
    }
    return _me;
  }
}