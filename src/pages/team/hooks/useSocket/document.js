export default function (socket, processEvent) {
    socket.on("document:created", (data) => {
        processEvent({
            event: "document:created",
            ...data
        });
    });
    socket.on("document:updated", (data) => {
        // console.log('document:updated',data);
        processEvent({
            event: "document:updated",
            ...data
        });
    });
    socket.on("document:removed", (data) => {
        console.log('document:removed', data);
        processEvent({
            event: "document:removed",
            ...data
        });
    });
}
