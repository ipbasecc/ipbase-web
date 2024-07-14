import { defineStore } from "pinia";
export default defineStore("mmws", {
  state: () => ({
    event: {
      data: {
        post: "",
      },
    },
    clientId: null,
    ws: null,
    log: [],
    online: false,
  }),
  actions: {
    $reset() {
      this.event = {
        data: {
          post: "",
        },
      };
      this.ws = null;
      this.clientId = null;
      this.log = [];
      this.online = false;
    },
  },
});
