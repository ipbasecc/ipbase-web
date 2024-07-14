import useProjectStore from "src/stores/project.js";
import { sendPost } from "src/api/mattermost.js";

import { Notify } from "quasar";

import useMmws from "src/stores/mmws.js";
const mm_wsStore = useMmws();
const projectStore = useProjectStore();

export async function send_MattersMsg(MsgContent, channel_id) {
  console.log("online", mm_wsStore.online);
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event?.data?.post &&
      (mm_wsStore.event.data.post = JSON.stringify(MsgContent));
    return;
  }
  let mmChannelId =
    channel_id || projectStore.project?.chat_service?.mmChannelId || null;
  if (!mmChannelId) {
    Notify.create({
      message: "实时消息服务离线，其他人需要刷新页面才能看到你的更新",
    });
    return;
  }
  const MattersMsg = await sendPost({
    channel_id: mmChannelId,
    message: MsgContent.body,
    props: MsgContent.props,
  });
  if (MattersMsg) {
    return MattersMsg;
  }
}
export async function send_ProjectMsg(MsgContent, relation_action) {
  // console.log('online',mm_wsStore.online);
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event.data.post = JSON.stringify(MsgContent);
    return;
  }
  let mmChannelId = projectStore.project?.chat_service?.mmChannelId || null;
  if (!mmChannelId) {
    Notify.create({
      message: "实时消息服务离线，其他人需要刷新页面才能看到你的更新",
    });
    return;
  }
  MsgContent.relation_action = relation_action;
  const ProjectMsg = await sendPost({
    channel_id: mmChannelId,
    root_id: projectStore.project.chat_service.projectRootChatID,
    message: MsgContent.body,
  });
  if (ProjectMsg) {
    return ProjectMsg;
  }
}
export async function send_CardMsg(MsgContent, relation_action) {
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event.data.post = JSON.stringify(MsgContent);
    return;
  }
  let mmChannelId = projectStore.project?.chat_service?.mmChannelId || null;
  if (!mmChannelId) {
    Notify.create({
      message: "实时消息服务离线，其他人需要刷新页面才能看到你的更新",
    });
    return;
  }
  MsgContent.relation_action = relation_action;
  const CardMsg = await sendPost({
    channel_id: mmChannelId,
    root_id: projectStore.card.chat_service.chatService_postId,
    message: MsgContent.body,
  });
  if (CardMsg) {
    return CardMsg;
  }
}
export async function send_WelcomeMsg(MsgContent, cardChatService_id) {
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event.data.post = JSON.stringify(MsgContent);
    return;
  }
  let mmChannelId = projectStore.project?.chat_service?.mmChannelId || null;
  if (!mmChannelId) {
    Notify.create({
      message: "实时消息服务离线，其他人需要刷新页面才能看到你的更新",
    });
    return;
  }
  const WelcomeMsg = await sendPost({
    channel_id: mmChannelId,
    root_id: cardChatService_id,
    message: MsgContent.body,
  });
  if (WelcomeMsg) {
    return WelcomeMsg;
  }
}
