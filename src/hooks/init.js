import { Dark } from "quasar";
import { teamStore, userStore } from "src/hooks/global/useStore";
import { refreshToken } from 'src/api/strapi.js'
const jwt = require('jsonwebtoken');

import { fetch_MmMe, fetch_StrapiMe } from "src/hooks/global/useFetchme";
const process = (res) => {
    if(res.config?.theme === 'lighter'){
      Dark.set(false);
    } else if(res.config?.theme === 'dark'){
      Dark.set(true);
    } else {
      Dark.set(Dark.isActive);
    }
    teamStore.init = res;
    if(res.default_team){
      teamStore.team = res.default_team;
      teamStore.mm_team = res.default_team?.mm_team;
    }
    userStore.todogroups = res.todogroups;
    teamStore.need_refecth_projects = false;
};
const isNeedRefreshToken = () => {
  const jwt = localStorage.getItem('jwt');
  if(jwt){
    const decoded = jwt.decode(jwt, { complete: true });
    const exp = decoded?.payload?.exp;
    // 获取过期时间
    const expirationDate = new Date(exp * 1000);
    // 获取当前时间
    const currentDate = new Date();
    // 判断过期时间是否小于1天
    if ((expirationDate - currentDate) < 86400000) { // 86400000毫秒等于1天
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}
export async function loginAndInit () {
  if(isNeedRefreshToken){
    await refreshToken();
  }
  const _mm_me = await fetch_MmMe();
  const _strapi_me = await fetch_StrapiMe();
  const init = (_me) => {        
    userStore.$process(_me);
    process(_me);
  }
  if (_mm_me && _strapi_me) {
    init(_strapi_me)
  }
  const _fetch = await fetch_StrapiMe('unCache');
  if(_fetch){
    init(_fetch)
  }
}
export async function refetchUser () {
    const init = (_me) => {        
      userStore.$process(_me);
      process(_me);
    }
    const _fetch = await fetch_StrapiMe('unCache');
    if(_fetch){
      init(_fetch)
    }
}