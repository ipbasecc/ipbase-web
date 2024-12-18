import { defineStore } from "pinia";

export default defineStore('deal',{
    state: () => ({
        deal: null,
        deals: [],
        count: null,
        workers: [],
        worker_count: null,
        talkers: [],
        verified: false
    }),
    actions: {
        $reset() {
            this.deal = null;
            this.deals = [];
            this.count = null;
            this.workers = [];
            this.worker_count = null;
            this.talkers = [];
        }
    }
})