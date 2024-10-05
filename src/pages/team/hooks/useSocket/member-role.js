export default function (socket, processEvent) {
    socket.on("member-role:created", (data) => {
        processEvent({
            event: "member-role:created",
            ...data
        });
    });
    socket.on("member-role:removed", (data) => {
        processEvent({
            event: "member-role:removed",
            ...data
        });
    });
    socket.on("member-role:updated", (data) => {
        processEvent({
            event: "member-role:updated",
            ...data
        });
    });
}
