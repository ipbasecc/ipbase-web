export default function (socket, processEvent) {
    socket.on("project:project_modify", (data) => {
        processEvent({
            event: "project:project_modify",
            ...data
        });
    });
    socket.on("project:project_created", (data) => {
        processEvent({
            event: "project:project_created",
            ...data
        });
    });
    socket.on("project:project_achived", (data) => {
        processEvent({
            event: "project:project_achived",
            ...data
        });
    });
    socket.on("project:project_deleted", (data) => {
        processEvent({
            event: "project:project_deleted",
            ...data
        });
    });
    socket.on("project:join", (data) => {
        processEvent({
            event: "project:join",
            ...data
        });
    });
    socket.on("project:leave", (data) => {
        processEvent({
            event: "project:leave",
            ...data
        });
    });
    socket.on("project:member_updated", (data) => {
        processEvent({
            event: "project:member_updated",
            ...data
        });
    });
  }
