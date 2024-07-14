import {getUser} from "src/api/mattermost.js";
import localforage from "localforage";
import {useFetchAvatar} from "pages/Chat/hooks/useFetchAvatar";
import {ref} from "vue";
export async function get_mmProfileByUID(mm_user_id) {
  if (!mm_user_id) return;
  const key = `__mm_user__${mm_user_id}`;
  const res = await localforage
    .getItem(key)
    .catch((e) => error(`get_mmProfileByUID_error: ${e}`));
  if (res) {
    return res;
  } else {
    const user = await getUser(mm_user_id);
    if(user?.data){
      await localforage.setItem(key, user.data);
      return user.data;
    }
  }
}

const all_user_ids = ref([]);

export async function sync_all_profiles(_ids) {
  all_user_ids.value = [...all_user_ids.value, ..._ids];
  const promises = all_user_ids.value.map(async (_mid) => {
    if(_mid){
      await useFetchAvatar(_mid)
      return await get_mmProfileByUID(_mid);
    }
  })
  return await Promise.allSettled(promises);
}
