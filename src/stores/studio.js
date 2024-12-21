import { defineStore } from "pinia";

export default defineStore('studio',{
    state: () => ({
        nav: 'works',
        works: [],
        cv: null,
    }),
    actions: {
        $reset() {
            this.nav = 'works';
            this.works = [];
            this.cv = null;
        }
    }
})