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
    socket.on("channel:member_updated", (data) => {
        processEvent({
            event: "channel:member_updated",
            ...data
        });
    });
    socket.on("channel:member_leaved", (data) => {
        processEvent({
            event: "channel:member_leaved",
            ...data
        });
    });
    socket.on("channel:member_join", (data) => {
        processEvent({
            event: "channel:member_join",
            ...data
        });
    });
  }
