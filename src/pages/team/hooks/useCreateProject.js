import { createProject } from "src/api/strapi/project.js";
import { createChannel } from "src/api/mattermost.js";

import { Notify, uid } from "quasar";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

export async function createProjectFn(_params) {
  let create_res;
  let params = _params;
  const mm_team_id = _params.by_team?.mm_team?.id;
  if (!mm_team_id) {
    // console.log("没有对应的Mattermost团队！");
    return;
  }

  const create_mmChannel_parmars = {
    team_id: mm_team_id,
    name: `${params.by_team?.id}${uid()}mmchannel`, // Mattermost 会使用此字段作为channel url标识，要求唯一
    display_name: params.name,
    type: params.type,
  };
  // 先在Mattermost中创建一个频道，获取到结果数据后作为创建项目的mm_channel字段数据
  let create_mmChannel_res = await createChannel(create_mmChannel_parmars);
  if (create_mmChannel_res.data) {
    params.by_team = _params.by_team?.id;
    params.mm_channel = create_mmChannel_res.data;
    let res = await createProject(params);
    if (res?.data) {
      create_res = res.data;
      return create_res;
    }
  } else {
    Notify.create($t('create_chat_channel_fiald_try_refresh'));
  }
}
