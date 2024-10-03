export default function (socket, processEvent) {
    socket.on("card:created", (data) => {
        processEvent({
            event: "card:created",
            ...data
        });
    });
    socket.on("card:deleted", (data) => {
        processEvent({
            event: "card:deleted",
            ...data
        });
    });
    socket.on("card:updated", (data) => {
        processEvent({
            event: "card:updated",
            ...data
        });
    });
}
