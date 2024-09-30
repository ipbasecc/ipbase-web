// useSocket.js
import { io, Socket } from "socket.io-client";
import { onMounted, onUnmounted } from 'vue';

export function useSocket() {
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const SERVER_URL = import.meta.env.VITE_BACKEND_URI || "http://api.yihu.team";
  const JWT_TOKEN = jwt;

  let socket = null;

  onMounted(() => {
    if (JWT_TOKEN) {
      socket = io(SERVER_URL, {
        auth: {
          strategy: "jwt",
          token: JWT_TOKEN,
        },
      });

      socket.on("connect", () => {
        console.log("Socket connected!");
        socket.on("todo:create", (data) => {
          console.log("todo created!", data);
        });
        socket.on("todo:update", (data) => {
          console.log("todo updated!", data);
        });
        socket.on("todo:delete", (data) => {
          console.log("todo deleted!", data);
        });
      });
    }
  });

  onUnmounted(() => {
    if (socket) {
      socket.off("todo:create");
      socket.off("todo:update");
      socket.off("todo:delete");
      socket.disconnect();
    }
  });
}
