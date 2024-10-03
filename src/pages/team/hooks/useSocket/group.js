export default function (socket, processEvent) {
    socket.on("group:created", (data) => {
        processEvent({
            event: "group:created",
            ...data
        });
    });
    socket.on("group:updated", (data) => {
        processEvent({
            event: "group:updated",
            ...data
        });
    });
    socket.on("group:deleted", (data) => {
        processEvent({
            event: "group:deleted",
            ...data
        });
    });
    socket.on("group:order", (data) => {
        processEvent({
            event: "group:order",
            ...data
        });
    });
}
