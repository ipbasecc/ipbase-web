import { computed } from "vue";
import {createTeam, getCurUserChannels, getUser} from "src/api/mattermost.js";

import {
  fetchTeams,
  createTeam_strapi,
  setDefaultTeam,
} from "src/api/strapi/team.js";
import localforage from "localforage";
import { teamStore } from "src/hooks/global/useStore.js";

const mm_profile = computed(() => localforage.getItem("mm_profile"));

export async function getTeams() {
  try {
    const res = await fetchTeams();
    if (res?.data) {
      teamStore.teams = res.data;
    }
  } catch (error) {
    console.error(`fetchTeam ${error}`);
  }
}
export async function toggleTeam(team) {
  const params = {
    data: {
      default_team: team.id,
    },
  };
  const res = await setDefaultTeam(params);
  if (res?.data) {
    // teamStore.$reset_team();
    teamStore.team = res.data;
    teamStore.init.default_team = res.data;
    teamStore.mm_team = res.data.mm_team;
    return res;
  }
}

export async function createStrapiTeam(params, mm_user_id) {
  //   const mm_parmars = {
  //     name: "",
  //     display_name: "",
  //     type: "I",
  //   };
  let _mm_uid = mm_user_id || mm_profile.value?.id;
  if (!_mm_uid) {
    _mm_uid = localStorage.getItem("mmUserId");
  }
  try {
    // 创建Mattermost团队
    let mm_create = await createTeam(params);
    if (mm_create) {
      let channels;
      // 获取Mattermost团队下所有公开频道
      const get_channels = await getCurUserChannels(_mm_uid, mm_create.data.id);
      if (get_channels?.data?.length > 0) {
        channels = get_channels.data.filter((i) => i.type === "O");
      }
      let strapi_create;
      if (mm_create?.status_code !== 400) {
        try {
          let strapi_params = {
            data: {
              name: params.name,
              display_name: params.display_name,
              mm_team: mm_create.data,
            },
          };
          // 将所有Mattermost公开频道数据作为参数传递给后端
          // 后端在创建Strapi team时，需要同步创建对应的频道与Mattermost频道绑定
          if (channels) {
            strapi_params.data.mm_channels = channels;
          }
          strapi_create = await createTeam_strapi(strapi_params);
        } catch (error) {
          console.error(`createTeam_strapi ${error}`);
        }
      }
      if (strapi_create) {
        return strapi_create;
      }
    }
  } catch (error) {
    console.error(`mm_create ${error}`);
  }
}

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
      return user.data;
    }
  }
}
