import { ref } from "vue";
import { updateUsersBasicinfo } from "src/apollo/api/api.js";
import { createStrapiTeam } from "src/pages/team/hooks/useTeam.js";

export async function init_mm(user_id, mm_profile) {
  if (!user_id) {
    console.error("user_id 不能少");
    return;
  }
  if (!mm_profile) {
    console.error("mm_profile 不能少");
    return;
  }
  const now = new Date();
  let timestamp = now.getTime();

  // 使用当前用户的ID和当前时间戳,以当前用户身份创建一个团队
  const params = {
    name: `u${user_id}at${timestamp}`,
    display_name: "默认团队",
    type: "I",
  };
  try {
    const mm_user_id = mm_profile.id;
    const team = await createStrapiTeam(params, mm_user_id);
    // console.log("team", team);
    if (team) {
      let strapi_team;
      if (team?.data) {
        strapi_team = team.data.mm_team;
        // mattermost用户数据同步给strapi
        try {
          const updateUsersBasicinfoParams = ref({
            updateUsersPermissionsUserId: user_id,
            data: {
              default_team: team.data?.id,
            },
          });
          const {
            mutate: updateUsersBasicinfoMutate,
            onDone: updateUsersBasicinfoOnDone,
            onError: updateUsersBasicinfoError,
          } = updateUsersBasicinfo(updateUsersBasicinfoParams);
          await updateUsersBasicinfoMutate();
        } catch (error) {
          console.log(error);
        }
        // console.log("strapi_team", strapi_team);
        return strapi_team;
      }
    }
  } catch (error) {
    console.error(error);
  }
}
