export default function (socket, processEvent) {
    socket.on("user:project:joined", (data) => {
        processEvent({
            event: "user:project:joined",
            ...data
        });
    });
  }
