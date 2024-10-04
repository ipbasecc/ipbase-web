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
    socket.on("todo:created", (data) => {
        processEvent({
            event: "todo:created",
            ...data
        });
    });
    socket.on("todo:updated", (data) => {
        processEvent({
            event: "todo:updated",
            ...data
        });
    });
    socket.on("todo:removed", (data) => {
        processEvent({
            event: "todo:removed",
            ...data
        });
    });
}