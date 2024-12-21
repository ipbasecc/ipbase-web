<template>
    <q-card bordered ref="chatBox" class="chat-box column">
        <q-bar dark class="transparent text-white border-bottom">
            <div class="col text-weight-bold">
                {{ target_user?.username }}
            </div>
            <q-btn dense flat round icon="lens" size="8.5px" color="red" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-none q-space">
            <ChatContainter
                :mm_channel_id="channel_id"
                :pannel_mode="true"
                :MsgOnly="true"
                @MsgSended="MsgSended"
            />
        </q-card-section>
    </q-card>
</template>
<script setup>
    import { ref, useTemplateRef } from 'vue';
    import ChatContainter from './ChatContainter.vue'

    const { channel_id, target_user } = defineProps(['channel_id', 'target_user']);
    const emit = defineEmits(['MsgSended'])

    const isOpen = ref(false);
    const chatBox = useTemplateRef('chatBox');

    const MsgSended = () => {
        emit('MsgSended')
    }
</script>
<style scoped>
    .chat-box {
        min-width: 59vw;
        height: 800px;
    }
</style>
