
import { visitInvite, acceptInvite } from "src/api/strapi/project.js";
import {
  visitTeamInvite,
  acceptTeamInvite,
  visitChannelInvite,
  acceptChannelInvite,
} from "src/api/strapi/team.js";


export async function join(team_id, channel_id, project_id, invite_code) {
    if(!invite_code) return;
    if(!team_id && !channel_id && !project_id) return;
    let res;
    if (team_id) {
        res = await acceptTeamInvite(team_id, invite_code);
    }
    if (channel_id) {
        res = await acceptChannelInvite(channel_id, invite_code);
    }
    if (project_id) {
        res = await acceptInvite(project_id, invite_code);
    }
    if (res?.data) {
      console.log("res.data", res.data);
      return res.data;
    }
}

export async function get_inviteInfo (team_id, channel_id, project_id, invite_code, target) {
    if (!localStorage.getItem("jwt")) {
      return;
    }
    if(!invite_code) return;
    if(!team_id && !channel_id && !project_id) return;
    let errorMsg;
    let inviteInfo;
    try {
      let res;
      if (team_id) {
        res = await visitTeamInvite(team_id, invite_code);
      }
      if (channel_id) {
        res = await visitChannelInvite(channel_id, invite_code);
      }
      if (project_id) {
        res = await visitInvite(project_id, invite_code);
      }
      if (res) {
        console.log("res.data?.props", res.data?.props);
        if (res.data?.props === "isCreator") {
          errorMsg = res.data?.message;
        } else if (res.data?.error) {
          let __ = res.data?.error?.name;
          if (__ === "NotFoundError") {
            errorMsg = `未找到与该邀请码匹配的${target}，请检查邀请链接是否完整、有效。`;
          } else {
            errorMsg = res.data?.error?.message;
          }
        } else {
          inviteInfo = res.data;
        }
        return { errorMsg, inviteInfo };
      }
    } catch (error) {
      console.log("error", error);
    }
}