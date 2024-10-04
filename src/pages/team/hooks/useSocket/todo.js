export default function (socket, processEvent) {
    socket.on("todogroup:created", (data) => {
        processEvent({
            event: "todogroup:created",
            ...data
        });
    });
    socket.on("todogroup:updated", (data) => {
        processEvent({
            event: "todogroup:updated",
            ...data
        });
    });
    socket.on("todogroup:removed", (data) => {
        processEvent({
            event: "todogroup:removed",
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