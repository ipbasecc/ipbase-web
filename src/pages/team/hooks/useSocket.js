import { ref, reactive } from "vue";
import { io, Socket } from "socket.io-client";
import { onMounted, onUnmounted } from 'vue';
import { teamStore } from 'src/hooks/global/useStore.js';
import { Notify } from 'quasar';
import { errorProcess } from 'src/boot/error.js';
import team from './useSocket/team.js'
import channel from './useSocket/channel.js'
import project from './useSocket/project.js'
import card from './useSocket/card.js'
import board from './useSocket/board.js'
import group from './useSocket/group.js'
import kanban from './useSocket/kanban.js'
import overview from './useSocket/overview.js'
import document from './useSocket/document.js'
import storage from './useSocket/storage.js'
import schedule from './useSocket/schedule.js'
import todo from './useSocket/todo.js'
import column from './useSocket/column.js'
import memberRole from './useSocket/member-role.js'
import payment from "./useSocket/payment.js";
import user from "./useSocket/user.js";

export function useSocket() {
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const SERVER_URL = process.env.BACKEND_URI || "https://api.yihu.team";  
  const JWT_TOKEN = jwt;

  let socket = null;
  const events = reactive(new Set());
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 3;

  onMounted(() => {
    if (JWT_TOKEN) {
      socket = io(SERVER_URL, {
        auth: {
          strategy: "jwt",
          token: JWT_TOKEN,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      });

      // 添加 Strapi Socket.IO 错误处理
      socket.on("connect_error", (error) => {
        console.error("Strapi Socket.IO connection error:", error);
        reconnectAttempts++;

        if (error.message?.includes('blocked by CORS policy') || 
            error.message?.includes('502') || 
            error.message?.includes('Bad Gateway')) {
          
          Notify.create({
            message: 'Strapi 实时连接失败，10秒后将尝试重新连接...',
            icon: 'sync',
            color: 'warning',
            position: 'top',
            timeout: 3000
          });

          errorProcess(10000);
        }

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          Notify.create({
            message: 'Strapi 服务连接失败，请检查网络后刷新页面',
            icon: 'error',
            color: 'negative',
            position: 'top',
            timeout: 5000,
            actions: [
              { 
                label: '刷新',
                color: 'white',
                handler: () => {
                  errorProcess(0);
                }
              }
            ]
          });
          errorProcess(5500);
        }
      });

      const processEvent = (props) => {
        const { event, data } = props;
        events.add(event);
        teamStore.income = {
          event: event,
          data: data,
        };
      }
      
      socket.on("connect", () => {
        console.log("Socket connected!");
        reconnectAttempts = 0; // 重置重连次数
        socket.on("room:join", (data) => {
            processEvent({
              event: "room:join",
              data: data
            });
        });
        team(socket, processEvent);
        channel(socket, processEvent);
        project(socket, processEvent);
        card(socket, processEvent);
        board(socket, processEvent);
        group(socket, processEvent);
        kanban(socket, processEvent);
        overview(socket, processEvent);
        document(socket, processEvent);
        storage(socket, processEvent);
        schedule(socket, processEvent);
        todo(socket, processEvent);
        column(socket, processEvent);
        memberRole(socket, processEvent);
        payment(socket, processEvent);
        user(socket, processEvent);
      });
    }
  });

  onUnmounted(() => {
    if (socket) {
      for (const event of events) {
        socket.off(event);
      }
      socket.disconnect();
    }
  });
}