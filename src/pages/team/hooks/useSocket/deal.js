export default function (socket, processEvent) {
    socket.on("deal:party_b:set", (data) => {
        processEvent({
            event: "deal:party_b:set",
            ...data
        });
    });
    socket.on("deal:updated", (data) => {
        processEvent({
            event: "deal:updated",
            ...data
        });
    });
  }
