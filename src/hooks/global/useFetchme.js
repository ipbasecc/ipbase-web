import { getUser } from "src/api/mattermost.js";
import localforage from "localforage";
import mmUserStore from "src/stores/mmuser.js";
import { init_user } from "src/api/strapi/project";

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
    return await useCache();
  } else {
    return await unuseCache();
  }
}