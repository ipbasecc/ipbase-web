import { defineStore } from "pinia";

export default defineStore("discover", {
  state: () => ({
    list: 'home',
    list_type: 'classroom',
    list_element: 'card',
    actived: null,
  }),
  persist: false,
  actions: {
    async $waitRestore(){
      await this.$restore();
    },
  },
});
