import { findMe } from "src/apollo/api/api.js";
import { getUser } from "src/api/mattermost.js";
import localforage from "localforage";
import mmUserStore from "src/stores/mmuser.js";
import useUserStore from "src/stores/user.js";
import useTeamStore from "src/stores/team.js";

const teamStore = useTeamStore();
const mm_user_id = localStorage.getItem("mmUserId");
const mm_token = localStorage.getItem("mmtoken");
const strapi_jwt = localStorage.getItem("jwt");

const mmUser = mmUserStore();
const userStore = useUserStore();

export async function fetch_StrapiMe() {
  let invalid = [undefined, null, NaN, ""];
  let me = await localforage.getItem("__strapi_me");
  if (me && !invalid.includes(me)) {
    // console.log("me", me);
    userStore.me = me;
    return me;
  } else {
    try {
      const { loading, error, result: me_res } = await findMe(); // Assuming findMe returns a promise
      if (me_res.value) {
        await localforage.setItem(
          "__strapi_me",
          JSON.parse(JSON.stringify(me_res.value))
        );
        let me = me_res.value.me;
        userStore.me = me;
        teamStore.me = me;
        return me;
      }
    } catch (error) {
      console.error("Error fetching Strapi data:", error);
    }
  }
}
export async function fetch_MmMe() {
  let invalid = [undefined, null, NaN, ""];
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
