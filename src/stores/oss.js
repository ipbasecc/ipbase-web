import { defineStore } from "pinia";

export default defineStore("oss", {
  state: () => ({
    oss: process.env.OSS_URL,
    ststoken: "",
    process: [],
    uploadQueue: [],
    showList: false,
    ossConfig: null,
    client: void 0,
  }),
  actions: {
    $reset() {
      this.process = [];
      this.uploadQueue = [];
      this.showList = false;
      this.ossConfig = null;
      this.client = void 0;
    },
  },
});
