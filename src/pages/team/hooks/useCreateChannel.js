import { makeid } from "src/hooks/utilits.js";
import { teamStore } from "src/hooks/global/useStore.js";
import { createChannel as createStrapiChannel } from "src/api/strapi/team.js";
import { createChannel as createMmChannel } from "src/api/mattermost.js";

export async function createChannel(params) {
  const mm_team = teamStore.team?.mm_team;
  if (!mm_team) return;
  const _id = makeid(12);

  const mm_params = {
    name: _id,
    display_name: params.data.name,
    team_id: mm_team.id,
    type: params.data.type,
  };
  // console.log("mm_params", mm_params);
  const mm_channel = await createMmChannel(mm_params);
  if (mm_channel?.data) {
    params.data.mm_channel = mm_channel.data;
    const res = await createStrapiChannel(params);
    if (res?.data) {
      teamStore.team.team_channels.push(res.data);
    }
  }
}
