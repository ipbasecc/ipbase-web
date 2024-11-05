export default function (socket, processEvent) {
    socket.on("pay:completed", (data) => {
        processEvent({
            event: "pay:completed",
            ...data
        });
    });
}
