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
  }
