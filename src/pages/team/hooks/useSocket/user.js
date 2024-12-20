export default function (socket, processEvent) {
    socket.on("user:project:joined", (data) => {
        processEvent({
            event: "user:project:joined",
            ...data
        });
    });
    socket.on("user:friend:request", (data) => {
        processEvent({
            event: "user:friend:request",
            ...data
        });
    });
    socket.on("user:friend:accept", (data) => {
        processEvent({
            event: "user:friend:accept",
            ...data
        });
    });
  }
