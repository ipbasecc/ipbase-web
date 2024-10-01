export default function (socket, processEvent) {
    socket.on("team:create", (data) => {
        processEvent({
            event: "team:create",
            data: data
        });
    });
    socket.on("team:update", (data) => {
        processEvent({
            event: "team:update",
            ...data
        });
    });
    socket.on("team:delete", (data) => {
        processEvent({
            event: "team:delete",
            ...data
        });
    });
    socket.on("team:join", (data) => {
        processEvent({
            event: "team:join",
            ...data
        });
    });
    socket.on("team:leave", (data) => {
        processEvent({
            event: "team:leave",
            ...data
        });
    });
    socket.on("team:member_updated", (data) => {
        processEvent({
            event: "team:member_updated",
            ...data
        });
    });
    socket.on("team:member_leaved", (data) => {
        processEvent({
            event: "team:member_leaved",
            ...data
        });
    });
  }