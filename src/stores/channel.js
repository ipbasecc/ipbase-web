import { defineStore } from "pinia";

export default defineStore('channel',{
    state: () => ({
        matedata: null,
        channel_ownerId: null,
        navigation: null,
        needRefetch: false,
        newReply: null
    }),
    actions: {
        $reset() {
            this.matedata = null;
            this.channel_ownerId = null;
            this.navigation = null;
            this.needRefetch = false;
            this.newReply = null;
        }
    }
})