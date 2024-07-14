import { defineStore } from "pinia";

export default defineStore('work',{
    state: () => ({
        creator: null
    }),
    actions: {
        $reset() {
            this.creator = null;
        }
    }
})