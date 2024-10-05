export default function (socket, processEvent) {
    socket.on("column:created", (data) => {
        processEvent({
            event: "column:created",
            ...data
        });
    });
    socket.on("column:updated", (data) => {
        processEvent({
            event: "column:updated",
            ...data
        });
    });
    socket.on("column:deleted", (data) => {
        processEvent({
            event: "column:deleted",
            ...data
        });
    });
    socket.on("column:order", (data) => {
        processEvent({
            event: "column:order",
            ...data
        });
    });
}
