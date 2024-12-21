import { defineStore } from "pinia";
import localforage from 'localforage';

// 配置 localforage
const storage = localforage.createInstance({
    name: 'notify-storage',
    storeName: 'notifications',
    driver: [localforage.INDEXEDDB],
    description: '用于存储通知消息的数据库'
});

export default defineStore('notify', {
    state: () => ({
        messages: []
    }),
    actions: {
        async addMessage(message) {
            this.messages.unshift(message);
            try {
                // 直接存储整个 state
                await storage.setItem('notify-store', {
                    messages: JSON.parse(JSON.stringify(this.messages))
                });
                console.log('Message saved successfully', await storage.getItem('notify-store'));
            } catch (error) {
                console.error('Failed to save message:', error);
            }
        },
        async restore() {
            const data = await storage.getItem('notify-store');
            if(data){
                this.messages = data.messages;
            }
        },
        async readMessage(id) {
            const index = this.messages.findIndex(item => item.id === id);
            if(index > -1){
                this.messages[index].read = true;
            }
            await storage.setItem('notify-store', {
                messages: JSON.parse(JSON.stringify(this.messages))
            });
        },
        async readAll() {
            this.messages.forEach(item => item.read = true);
            await storage.setItem('notify-store', {
                messages: JSON.parse(JSON.stringify(this.messages))
            });
        },
        async clearAll() {
            this.messages = [];
        }
    }
})