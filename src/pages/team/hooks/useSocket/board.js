export default function (socket, processEvent) {
    socket.on("board:deleted", (data) => {
        processEvent({
            event: "board:deleted",
            ...data
        });
    });
    socket.on("board:created", (data) => {
        processEvent({
            event: "board:created",
            ...data
        });
    });
    socket.on("board:updated", (data) => {
        processEvent({
            event: "board:updated",
            ...data
        });
    });
}
