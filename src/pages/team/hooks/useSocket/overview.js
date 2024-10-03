export default function (socket, processEvent) {
    socket.on("overview:created", (data) => {
        processEvent({
            event: "overview:created",
            ...data
        });
    });
    socket.on("overview:deleted", (data) => {
        processEvent({
            event: "overview:deleted",
            ...data
        });
    });
    socket.on("overview:updated", (data) => {
        processEvent({
            event: "overview:updated",
            ...data
        });
    });
}
