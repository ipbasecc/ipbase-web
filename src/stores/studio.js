import { defineStore } from "pinia";

export default defineStore('studio',{
    state: () => ({
        nav: 'works',
        works: [],
        cv: null,
    }),
    persist: false,
    actions: {
        async $waitRestore(){
          await this.$restore();
        },
        $reset() {
            this.nav = 'works';
            this.works = [];
            this.cv = null;
        }
    }
})