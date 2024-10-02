// 此文件作废




import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";

import { createProject, updateProject } from "src/api/strapi/project.js";
import { createChannel, sendPost } from "src/api/mattermost.js";

import { Notify, uid } from "quasar";

const projectStore = useProjectStore();
const userStore = useUserStore();

export async function createProjectFn(_params, mm_channel_id) {
  // console.log(userStore.me);
  let params = _params;
  let new_project = {};
  let projectService_team_id = userStore.init?.mm_projectChatService_team?.id;
  if (!projectService_team_id) {
    Notify.create({
      message: "向项目提供讨论服务的Mattermost团队ID不存在",
    });
    return;
  }
  let chat_service = {};
  chat_service.mmTeamId = projectService_team_id;
  if (mm_channel_id) {
    params.mm_channel_id = mm_channel_id;
  }
  let res = await createProject(params);
  if (res) {
    new_project = res.data;
    // 提供chat服务的mm团队ID;
    if (!mm_channel_id) {
      const create_mmChannel_parmars = {
        team_id: projectService_team_id,
        name: `${new_project.id}_${uid()}_chatserver`, // Mattermost 会使用此字段作为channel url标识，要求唯一
        display_name: new_project.name,
        type: "P",
      };
      // 先在用户的chat服务团队中创建一个以项目名称命名的频道
      let create_mmChannel_res = await createChannel(create_mmChannel_parmars);
      if (create_mmChannel_res.data) {
        chat_service.mmChannelId = create_mmChannel_res.data.id;
      }
    } else {
      chat_service.mmChannelId = mm_channel_id;
    }
    if (chat_service.mmChannelId) {
      // 再在此频道发布第一条消息
      // 此消息将作为项目聊天的根节点，在项目的讨论组件内聊天，其实都是在回复这条消息
      const root_post_res = await sendPost({
        channel_id: chat_service.mmChannelId,
        message: `项目 - ${params.name}：已创建`,
      });
      // 再向此消息发送第一条回复，将此消息转化为Thread
      // 将此Thread作为项目讨论窗口的根节点
      if (root_post_res) {
        // console.log('第一条消息已发布',root_post_res.data);
        // 消息发布成功后，将此消息ID提取存入项目的chat_service
        chat_service.projectRootChatID = root_post_res.data.id;
        const chat_service_post_res = await sendPost({
          channel_id: chat_service.mmChannelId,
          root_id: root_post_res.data.id,
          message: `欢迎加入 - ${params.name}的项目讨论`,
        });
        if (chat_service_post_res) {
          let params = {
            chat_service: chat_service,
            mm_team_id: projectService_team_id,
            mm_channel_id: chat_service.mmChannelId,
          };
          let updateProject_res = await updateProject(new_project.id, params);
          if (updateProject_res?.data) {
            return updateProject_res.data;
          }
        }
      }
    }
  }
}
