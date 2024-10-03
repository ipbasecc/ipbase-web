export default function (socket, processEvent) {
    socket.on("kanban:created", (data) => {
        processEvent({
            event: "kanban:created",
            ...data
        });
    });
    socket.on("kanban:updated", (data) => {
        console.log('teamStore.data', data);
        processEvent({
            event: "kanban:updated",
            ...data
        });
    });
    socket.on("kanban:deleted", (data) => {
        console.log('teamStore.data', data);
        processEvent({
            event: "kanban:deleted",
            ...data
        });
    });
}
