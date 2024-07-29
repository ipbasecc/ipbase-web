import { sendPost } from "src/api/mattermost.js";

import { Notify } from "quasar";

import { computed } from "vue";
import { mm_wsStore, teamStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const offlineNotify = () => {
  Notify.create({
    message: $time('ws_offline_tip'),
  });
};

export async function send_MattersMsg(MsgContent, channel_id) {
  const project_mmChannel = computed(() => teamStore.project?.mm_channel?.id);
  // console.log("online", mm_wsStore.online);
  // 在此处先对 mm_wsStore 数据赋值，组件会监视到数据改变从而立刻更新数据
  // 这是为了让当前操作者在操作生效后立刻看到UI变化，而不必等待WS的反馈
  // 但是如果发现界面闪烁，此处可能是引发的原因之一，需要排查
  const localRsps = () => {
    mm_wsStore.event = {
      ...mm_wsStore.event,
      event: 'posted',
      data: {
        post: JSON.stringify(MsgContent),
      }
    }
  }
  localRsps();
  let mmChannelId = channel_id || project_mmChannel.value;
  if (!mmChannelId) {
    console.log('!mmChannelId')
  } else if (!mm_wsStore.online) {
    console.log('!mm_wsStore.online')
    offlineNotify();
  } else {
    // 解决当前用户直接更新UI，其它用户等待ws数据更新UI的问题：
    // 如果是增、删操作，当前用户用因为直接操作和ws操作而带来两次相同操作的问题
    // 在发送ws消息前，为消息props赋值客户端ID，这样，直接赋值ws数据的当前用户是没有客户端ID的
    // 在用户访问页面时，路由守卫生成唯一客户端ID并存入ws store，在页面watch时检查客户端ID，
    // 如果相同，则说明是当前用户的操作，不在执行ws事件操作
    MsgContent.props.clientId = mm_wsStore.clientId;
    const MattersMsg = await sendPost({
      channel_id: mmChannelId,
      message: MsgContent.body,
      props: MsgContent.props,
    });
    if (MattersMsg) {
      return MattersMsg;
    }
  }
}
export async function send_CardMsg(MsgContent, relation_action) {
  const project_mmChannel = computed(() => teamStore.project?.mm_channel?.id);
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event.data.post = JSON.stringify(MsgContent);
    return;
  }
  let mmChannelId = project_mmChannel.value;
  if (!mmChannelId) {
    offlineNotify();
    return;
  }
  MsgContent.relation_action = relation_action;
  const CardMsg = await sendPost({
    channel_id: mmChannelId,
    root_id: teamStore.card?.mm_thread?.id,
    message: MsgContent.body,
  });
  if (CardMsg) {
    return CardMsg;
  }
}
export async function send_WelcomeMsg(MsgContent, cardChatService_id) {
  const project_mmChannel = computed(() => teamStore.project?.mm_channel?.id);
  if (!mm_wsStore.online) {
    mm_wsStore.event.event = "posted";
    mm_wsStore.event.data.post = JSON.stringify(MsgContent);
    return;
  }
  let mmChannelId = project_mmChannel.value;
  if (!mmChannelId) {
    offlineNotify();
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
