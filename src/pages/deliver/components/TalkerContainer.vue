<template>
    <div class="absolute-full">
        <div v-if="channel_id" class="fit column no-wrap">
            <q-toolbar class="transparent border-bottom">
                <q-btn flat round dense icon="mdi-chevron-left" @click="backList" />
            </q-toolbar>
            <div class="relative-position q-space">
                <ChatContainter
                    :mm_channel_id="channel_id"
                    :pannel_mode="true"
                    :MsgOnly="true"
                    :noReply="true"
                    @MsgSended="MsgSended"
                />
            </div>
        </div>
        <TalkersList v-else :talker="uiStore.talker" @startTalk="startTalk" />
    </div>
</template>
<script setup>
import { ref } from 'vue'
import TalkersList from './TalkersList.vue'
import ChatContainter from 'src/pages/team/chat/ChatContainter.vue'
import { uiStore } from 'src/hooks/global/useStore'

const channel_id = ref(null);
const MsgSended = () => {
    
}
const startTalk = (channel) => {
    channel_id.value = channel.id
}
const backList = () => {
    uiStore.talker = null
    channel_id.value = null
}
</script>
