import localforage from "localforage";
import { findMe, FindUserMatedate } from "src/apollo/api/api.js";
import { getUser } from "src/api/mattermost.js";

import { userStore } from "src/hooks/global/useStore.js";

export async function init_stratpi() {
  const strapi_token = localStorage.getItem("jwt");
  if (strapi_token) {
    const fetch_strapi_me = () => {
      const { loading, error, result: getMe } = findMe();
      if (getMe) {
        return getMe.value;
      }
    };
    const fetch_strapi_userMatedate = () => {
      const parmas = userStore.queryParmars;
      const {
        loading,
        error,
        result: getUserMatedate,
        refetch,
      } = FindUserMatedate(parmas);
      if (getUserMatedate) {
        return getUserMatedate.value;
      }
    };

    let strapi_me = fetch_strapi_me();
    let strapi_userMatedate = fetch_strapi_userMatedate();

    if (strapi_me) {
      await localforage.setItem("__strapi_me", strapi_me);
    }
    if (strapi_userMatedate) {
      await localforage.setItem("__strapi_me", strapi_userMatedate);
    }
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
