import { defineStore } from "pinia";

export default defineStore('channel',{
    state: () => ({
        channel_id: null,
        matedata: null,
        channel_ownerId: null,
        navigation: null,
        needRefetch: false,
        newReply: null
    }),
    persist: true,
    actions: {
        async $waitRestore(){
          await this.$restore();
        },
        $reset() {
            this.channel_id = null;
            this.matedata = null;
            this.channel_ownerId = null;
            this.navigation = null;
            this.needRefetch = false;
            this.newReply = null;
        }
    }
})