import useMmws from "src/stores/mmws.js";
import { Notify } from "quasar";
import { login as mmLogin } from "src/api/mattermost.js";

const mm_wsStore = useMmws();
const token = localStorage.getItem("mmtoken");

let ws;
let reConnectCount = 0;
let mm_loged = void 0;
let isReconnecting = false; // 添加重连锁

export function _ws() {
  if (!token) return;
  ws = new WebSocket(`wss://${import.meta.env.VITE_MM_SITE}/api/v4/websocket`);

  function reConnect() {
    if (isReconnecting) {
      // 如果已经在重连中，则不执行任何操作
      return;
    }
    const _token = localStorage.getItem("mmtoken");
    if (_token) {
      reConnectCount++;
      if (reConnectCount < 10) {
        isReconnecting = true; // 设置重连锁
        if (token) {
          ws = new WebSocket(`wss://${import.meta.env.VITE_MM_SITE}/api/v4/websocket`);
          wsConnect();
        }
      } else {
        Notify.create({
          message:
            "WebSocket 无法连接，部分功能可能无法使用，如果发现功能没有正常执行，可以在操作后手动刷新页面",
          position: "top",
          color: "negative",
        });
        isReconnecting = false; // 重连失败，释放重连锁
      }
    }
  }

  // 连接到Mattermost WebSocket
  function wsConnect() {
    // 定义具名处理函数
    function handleOpen() {
      ws.send(
        JSON.stringify({
          seq: 1,
          action: "authentication_challenge",
          data: {
            token: token,
          },
        })
      );
    }

    function handleMessage(event) {
      mm_wsStore.online = true;
      mm_wsStore.event = JSON.parse(event.data);
    }

    async function handleError(event) {
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
      setTimeout(() => {
        console.log(`WebSocke 离线，10秒后尝试重连...`);
        closeWs();
        reConnect();
      }, 10000);
    }

    function handleDisconnect() {
      console.log(`WebSocket已断开`);
      mm_wsStore.online = false;
      setTimeout(() => {
        console.log(`WebSocke 离线，10秒后尝试重连...`);
        closeWs();
        reConnect();
      }, 10000);
    }

    function handleClose(event) {
      mm_wsStore.online = false;
      console.log("WebSocket closed:", event.code, event.reason);
      if (!isReconnecting) {
        setTimeout(() => {
          console.log(`WebSocke 离线，10秒后尝试重连...`);
          closeWs();
          reConnect();
        }, 10000);
      }
    }

    // 使用具名函数添加事件监听器
    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("disconnect", handleDisconnect);
    ws.addEventListener("close", handleClose);
  }
  wsConnect();
}

export function closeWs() {
  if (ws) {
    // 移除所有事件监听器
    ws.removeEventListener('open', wsConnect);
    ws.removeEventListener('message', handleMessage);
    ws.removeEventListener('error', handleError);
    ws.removeEventListener('disconnect', handleDisconnect);
    ws.removeEventListener('close', handleClose);
    
    ws.close();
    mm_wsStore.online = false;
  }
}