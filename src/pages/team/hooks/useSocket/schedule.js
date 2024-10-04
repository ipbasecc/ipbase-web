export default function (socket, processEvent) {
    socket.on("schedule:created", (data) => {
        processEvent({
            event: "schedule:created",
            ...data
        });
    });
    socket.on("schedule:updated", (data) => {
        processEvent({
            event: "schedule:updated",
            ...data
        });
    });
    socket.on("schedule:deleted", (data) => {
        processEvent({
            event: "schedule:deleted",
            ...data
        });
    });
}