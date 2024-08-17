import { Dark } from "quasar";
import { teamStore, userStore } from "src/hooks/global/useStore";

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
export async function loginAndInit () {
    const _mm_me = await fetch_MmMe();
    const _strapi_me = await fetch_StrapiMe();
    const init = (_me) => {
        console.log('init', _me);
        
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