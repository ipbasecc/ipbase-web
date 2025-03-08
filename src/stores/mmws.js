import { defineStore } from "pinia";
import { uid } from 'quasar'

export default defineStore("mmws", {
  state: () => ({
    event: {
      data: {
        post: "",
      },
    },
    // 使用浏览器指纹作为客户端ID，用来在ws事件时判断是否是当前用户操作的ws内容
    // 如果是，当前用户的对应操作已经执行了，就不必执行ws的数据更新事件了
    clientId: window.fingerprint + '_' + uid(), 
    ws: null,
    log: [],
    online: false,
  }),
  persist: true,
  actions: {
    async $waitRestore(){
      await this.$restore();
    },
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
