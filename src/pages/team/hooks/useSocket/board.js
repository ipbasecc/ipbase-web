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
}
