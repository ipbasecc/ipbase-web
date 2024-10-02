import { ref, reactive } from "vue";
import { io, Socket } from "socket.io-client";
import { onMounted, onUnmounted } from 'vue';
import { teamStore } from 'src/hooks/global/useStore.js';
import team from './useSocket/team.js'
import channel from './useSocket/channel.js'
import project from './useSocket/project.js'

export function useSocket() {
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const SERVER_URL = process.env.BACKEND_URI || "https://api.yihu.team";  
  const JWT_TOKEN = jwt;

  let socket = null;
  const events = reactive(new Set());

  onMounted(() => {
    if (JWT_TOKEN) {
      socket = io(SERVER_URL, {
        auth: {
          strategy: "jwt",
          token: JWT_TOKEN,
        },
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
        socket.on("room:join", (data) => {
            processEvent({
              event: "room:join",
              data: data
            });
        });
        team(socket, processEvent);
        channel(socket, processEvent);
        project(socket, processEvent);
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