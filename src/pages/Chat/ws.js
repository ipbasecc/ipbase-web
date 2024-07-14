import useMmws from "src/stores/mmws.js";
import { Notify } from "quasar";
import { login as mmLogin } from "src/api/mattermost.js";

const mm_wsStore = useMmws();
const token = localStorage.getItem("mmtoken");

let ws;
let reConnectCount = 0;
let mm_loged = void 0;
export function _ws() {
  // console.log("ws token",token);
  if (!token) return;
  // 创建一个websocket客户端
  ws = new WebSocket(`wss://${process.env.MM_SITE}/api/v4/websocket`);

  function reConnect() {
    const _token = localStorage.getItem("mmtoken");
    if (_token) {
      reConnectCount++;
      if (reConnectCount < 10) {
        if (token) {
          ws = new WebSocket(`wss://${process.env.MM_SITE}/api/v4/websocket`);
          wsConnect();
        }
      } else {
        Notify.create({
          mesage:
            "WebSocket 无法连接，部分功能可能无法使用，如果发现功能没有正常执行，可以在操作后手动刷新页面",
          position: "top",
          color: "negative",
        });
      }
    }
  }

  // 连接到Mattermost WebSocket
  function wsConnect() {
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
      mm_wsStore.online = true;
      mm_wsStore.event = JSON.parse(event.data);
    });

    ws.addEventListener("error", async (event) => {
      console.error(`WebSocket错误: ${event}`);
      if (mm_loged === false) {
        localStorage.clear();
        return;
      }
      mm_wsStore.online = false;
      let res = await mmLogin(loginParmars.value);
      if (res?.data) {
        mm_loged = true;
      } else {
        mm_loged = false;
        localStorage.clear();
        return;
      }
      // 重新连接
      setTimeout(() => {
        console.log(`WebSocke 离线，10秒后尝试重连...`);
        closeWs();
        reConnect();
        wsConnect();
      }, 10000);
    });

    ws.addEventListener("disconnect", () => {
      console.log(`WebSocket已断开`);
      mm_wsStore.online = false;
      // 重新连接
      setTimeout(() => {
        console.log(`WebSocke 离线，10秒后尝试重连...`);
        closeWs();
        reConnect();
        wsConnect();
      }, 10000);
    });

    ws.addEventListener("close", (event) => {
      mm_wsStore.online = false;
      console.log("WebSocket closed:", event.code, event.reason);
      // 重新连接
      setTimeout(() => {
        console.log(`WebSocke 离线，10秒后尝试重连...`);
        closeWs();
        reConnect();
        wsConnect();
      }, 10000);
    });
  }
  wsConnect();
}

// 定义一个closeWs函数，用来关闭ws连接
export function closeWs() {
  // 判断ws是否存在
  if (ws) {
    // 调用ws.close方法，关闭ws连接
    ws.close();
    mm_wsStore.online = false;
    // 打印日志
    //   console.log("ws closed");
    // 触发一些事件，比如通知其他组件
    // ...
  }
}
