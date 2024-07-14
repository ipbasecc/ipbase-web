import { Notify } from "quasar";
import { mm_wsStore } from "src/hooks/global/useStore.js";
import { $server } from 'src/boot/server.js'

const TYPE = process.env.DEV ? 'ws' : 'wss'
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
export function _ws() {
  // console.log("ws token",token);
  if (!token) return;
  function reConnect() {
    token = localStorage.getItem("mmtoken");
    if (token) {
      reConnectCount++;
      if (reConnectCount < 10) {
        if (token) {
          wsConnect();
        }
      } else {
        Notify.create({
          message:
            "WebSocket 无法连接，部分功能可能无法使用，如果发现功能没有正常执行，可以在操作后手动刷新页面",
          position: "top",
          color: "negative",
          actions: [
            { label: '刷新', color: 'positive', handler: () => { window.location.reload() } }
          ]
        });
      }
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
      // Linux系统下，Edge浏览器有时候需要清理之后才能受到后续消息，因此这里必须收到服务端成功连接的消息以后才能正式判定连接成功
      if (mm_wsStore.event?.data?.connection_id) {
        mm_wsStore.online = true;
        console.log('ws connected && mm_wsStore.online = ', mm_wsStore.online)
      }
    });

    ws.addEventListener("error", (event) => {
      console.error(`WebSocket错误: ${event}`);
      closeWs();
      token = localStorage.getItem("mmtoken");
      if(token){
        // 重新连接
        setTimeout(() => {
          console.log(`WebSocke 离线，10秒后尝试重连...`);
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
          console.log(`WebSocke 离线，10秒后尝试重连...`);
          reConnect();
        }, 10000);
      }
    });
  }
  getPoint().then(() => {
    wsConnect();
  })
}

// 定义一个closeWs函数，用来关闭ws连接
export function closeWs() {
  // 判断ws是否存在
  if (ws) {
    ws.close();
    mm_wsStore.online = false;
  }
}
