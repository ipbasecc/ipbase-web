import localforage from "localforage";
import { findMe, FindUserMatedate } from "src/apollo/api/api.js";
import { getUser } from "src/api/mattermost.js";
import { watch } from "vue";

import { userStore } from "src/hooks/global/useStore.js";

export async function init_stratpi() {
  const strapi_token = localStorage.getItem("jwt");
  if (strapi_token) {
    const fetch_strapi_me = () => {
      const { loading, error, result: getMe } = findMe();
      watch(() => getMe.value, async (newVal) => {
        if (newVal){
          fetch_strapi_userMatedate()
        }
      })
    };
    const fetch_strapi_userMatedate = () => {
      const parmas = {
        userId: userStore.userId,
        ...userStore.queryParmars
      };
      const {
        loading,
        error,
        result: getUserMatedate,
        refetch,
      } = FindUserMatedate(parmas);
      
      watch(() => getUserMatedate.value, async (newVal) => {
        if (newVal){
          fetch_strapi_userMatedate()
        }
      })
    };
  }
}

export async function init_mattermost() {
  const mattermost_token = localStorage.getItem("mmtoken");
  const mattermost_id = localStorage.getItem("mmUserId");

  if (mattermost_token) {
    let res = await getUser(mattermost_id);
    if (res) {
      await localforage.setItem("mm_profile", res.data);
    }
  }
}
