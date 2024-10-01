export default function (socket, processEvent) {
    socket.on("channel:channel_created", (data) => {
        processEvent({
            event: "channel:channel_created",
            ...data
        });
    });
    socket.on("channel:channel_deleted", (data) => {
        processEvent({
            event: "channel:channel_deleted",
            ...data
        });
    });
    socket.on("channel:channel_updated", (data) => {
        processEvent({
            event: "channel:channel_updated",
            ...data
        });
    });
  }