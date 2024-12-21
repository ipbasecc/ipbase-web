<template>
    <q-btn dense round flat icon="notifications">
        <q-menu anchor="top end" self="top left" :offset="[10, 0]"
            max-height="41vh"
            class="radius-sm">
            <q-list bordered dense class="q-pa-xs radius-sm" style="width: 16rem;">
                <q-bar v-if="messages.length > 0" dark class="transparent border-bottom">
                    <q-space />
                    <span class="cursor-pointer text-caption" @click="readAll()">{{ $t('read_all') }}</span>
                    <span class="cursor-pointer text-caption q-ml-sm" @click="clearAll()">{{ $t('clear_all') }}</span>
                </q-bar>
                <template v-if="messages.length > 0">
                    <q-item v-for="item in messages" :key="item.id" class="radius-xs"
                        clickable v-ripple v-close-popup @click="toTarget(item)"
                    >
                        <q-item-section top side>
                            <q-avatar>
                                <q-img :src="item.sender?.profile?.avatar?.url" />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ item.sender?.username }}</q-item-label>
                            <q-item-label caption lines="2">{{ item.message }}</q-item-label>
                        </q-item-section>
                        <q-badge v-if="!item.read" color="red" rounded floating />
                    </q-item>
                </template>
                <template v-else>
                    <q-item>
                        <q-item-section>
                            <q-item-label>No messages</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
        </q-menu>
        <q-badge v-if="unreadCount > 0" color="red" rounded floating />
    </q-btn>
</template>
<script setup>
import { computed, onBeforeMount } from "vue";
import { notifyStore, uiStore } from "src/hooks/global/useStore.js";
import { useRouter } from "vue-router";

const router = useRouter();
const messages = computed(() => notifyStore.messages);
const unreadCount = computed(() => notifyStore.messages.filter(item => !item.read).length);

const syncStore = async () => {
    await notifyStore.restore();
}
const toTarget = async (item) => {
    await notifyStore.readMessage(item.id);
    uiStore.app = 'chats'
    router.push(item.target);
}
const clearAll = async () => {
    await notifyStore.clearAll();
}
const readAll = async () => {
    await notifyStore.readAll();
}

onBeforeMount(async () => {
    await syncStore();
})
</script>
