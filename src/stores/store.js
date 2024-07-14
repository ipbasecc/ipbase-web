import { defineStore } from "pinia";

export default defineStore("store", {
  state: () => ({
    lang: "zh-CN",
    location: '',
    brand_title: '易乎APP'
  }),
  getters: {},
  actions: {},
});
