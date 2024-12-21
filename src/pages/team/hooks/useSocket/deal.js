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
    socket.on("deal:update:party_b_requirements", (data) => {
        processEvent({
            event: "deal:update:party_b_requirements",
            ...data
        });
    });
    socket.on("deal:update:party_a_requirements", (data) => {
        processEvent({
            event: "deal:update:party_a_requirements",
            ...data
        });
    });
  }
