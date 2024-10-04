export default function (socket, processEvent) {
    socket.on("storage:created", (data) => {
        processEvent({
            event: "storage:created",
            ...data
        });
    });
    socket.on("storage:updated", (data) => {
        processEvent({
            event: "storage:updated",
            ...data
        });
    });
    socket.on("storage:removed", (data) => {
        processEvent({
            event: "storage:removed",
            ...data
        });
    });
    socket.on("file:removed", (data) => {
        processEvent({
            event: "file:removed",
            ...data
        });
    });
    socket.on("file:batchCreated", (data) => {
        processEvent({
            event: "file:batchCreated",
            ...data
        });
    });
}