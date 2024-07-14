import { defineStore } from "pinia";

export default defineStore('mmuser',{
    state: () => ({
        user: {},
        user_id: null,
        status: {},
        members: null,
        current_teamName: null,
        avatars: [],
        flaggeds: [],
        pinneds: [],
        current_user_avatar: ''
      }),
    actions: {
        $reset() {
            this.user = {};
            this.user_id = null;
            this.status = {};
            this.members = null;
            this.current_teamName = null;
            this.avatars = [];
            this.flaggeds = [];
            this.pinneds = [];
            this.current_user_avatar = '';
        }
    }
})
