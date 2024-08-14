import { getUser } from "src/api/mattermost.js";
import localforage from "localforage";
import mmUserStore from "src/stores/mmuser.js";

const mm_user_id = localStorage.getItem("mmUserId");
const mmUser = mmUserStore();

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
