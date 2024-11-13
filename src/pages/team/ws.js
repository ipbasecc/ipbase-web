import { Notify } from "quasar";
import { mm_wsStore } from "src/hooks/global/useStore.js";
import { $server } from 'src/boot/server.js'
import { i18n } from 'src/boot/i18n.js';
const $t = i18n.global.t;

const TYPE = process.env.DEV ? 'wss' : 'wss'
let token = localStorage.getItem("mmtoken");
let ws;
let reConnectCount = 0;
let wsLink
const getPoint = async () => {
  let { ws_api_endpoint } = await $server();
  if(!ws_api_endpoint || ws_api_endpoint !== "") {
    ws_api_endpoint = `${TYPE}://${process.env.MM_SITE}/api/v4/websocket`
  }
  wsLink = ws_api_endpoint
}
export async function _ws() {
  // console.log("ws token",token);
  if (!token) return;
  function reConnect() {
    // 检查WebSocket是否处于CONNECTING状态
    if (ws && ws.readyState === WebSocket.CONNECTING) {
      // 如果处于CONNECTING状态，则放弃并关闭连接
      console.log("WebSocket is already connecting. Aborting and closing the connection.");
      ws.close();
      ws = void 0;
    }
    reConnectCount++;
    token = localStorage.getItem("mmtoken");
    if (!token) return
    if (reConnectCount < 10) {
      if (token) {
        ws = void 0;
        wsConnect();
      }
    } else {
      Notify.create({
        message: $t('ws_error_need_refresh_tip'),
        position: "top",
        color: "negative",
        actions: [
          { label: $t('refresh'), color: 'positive', handler: () => { window.location.reload() } },
        ]
      });
    }
  }

  // 连接到Mattermost WebSocket
  function wsConnect() {
    ws = new WebSocket(wsLink);
    // new WebSocket(`${connectionUrl}?connection_id=${this.connectionId}&sequence_number=${this.serverSequence}${this.postedAck ? '&posted_ack=true' : ''}`);
    ws.addEventListener("open", () => {
      // 连接成功后，发送一个认证请求，使用您的mattermost用户ID和令牌
      // console.log("ws connecting...");
      ws.send(
        JSON.stringify({
          seq: 1,
          action: "authentication_challenge",
          data: {
            token: token,
          },
        })
      );
    });

    // 监听websocket消息事件
    ws.addEventListener("message", (event) => {
      mm_wsStore.event = JSON.parse(event.data);
      // console.log('GET WS_MESSAGE - event.data', mm_wsStore.event.data)
      if (mm_wsStore.event?.data?.connection_id) {
        mm_wsStore.online = true;
        console.log('ws connected && mm_wsStore.online = ', mm_wsStore.online)
      }
    });

    ws.addEventListener("error", (event) => {
      console.error(`WebSocket error: ${event}`);
      closeWs();
      token = localStorage.getItem("mmtoken");
      if(token){
        // 重新连接
        setTimeout(() => {
          console.log(`WebSocke offline,10 secends later reconnect...`);
          reConnect();
        }, 10000);
      }
    });

    ws.addEventListener("close", (event) => {
      console.log("WebSocket closed:", event);
      closeWs();
      // 重新连接

      token = localStorage.getItem("mmtoken");
      if(token) {
        setTimeout(() => {
          console.log(`WebSocke offline,10 secends later reconnect...`);
          reConnect();
        }, 10000);
      }
    });
  }
  await getPoint();
  wsConnect();
}

// 定义一个closeWs函数，用来关闭ws连接
export function closeWs() {
  // 判断ws是否存在
  if (ws) {
    ws.close();
    ws = null;
    mm_wsStore.online = false;
  }
}
