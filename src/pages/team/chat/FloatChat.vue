<template>
    <q-card bordered ref="chatBox" class="chat-box column">
        <q-toolbar dark class="transparent border-bottom">
            <q-tabs v-model="tab" dense stretch>
                <q-tab v-for="tab in tabs" :key="tab" :name="tab" :label="$t(tab)" />
            </q-tabs>
            <q-space />
            <q-btn dense size="sm" flat round icon="mdi-close" v-close-popup />
        </q-toolbar>
        <q-tab-panels v-model="tab" class="q-pa-none q-space">
            <q-tab-panel name="chat">
                <ChatContainter
                    :mm_channel_id="channel_id"
                    :pannel_mode="true"
                    :MsgOnly="true"
                    @MsgSended="MsgSended"
                />
            </q-tab-panel>
            <q-tab-panel name="works">
                <UserWorks :user_id="target_user?.id" :is_page="false" />
            </q-tab-panel>
        </q-tab-panels>
    </q-card>
</template>
<script setup>
    import { ref, useTemplateRef } from 'vue';
    import { useRouter } from 'vue-router'
    import ChatContainter from './ChatContainter.vue'
import UserWorks from 'src/pages/studio/UserWorks.vue'
    const router = useRouter()
    const { channel_id, target_user } = defineProps(['channel_id', 'target_user']);
    const emit = defineEmits(['MsgSended'])

    const isOpen = ref(false);
    const chatBox = useTemplateRef('chatBox');

    const MsgSended = () => {
        emit('MsgSended')
    }
    const goToStudio = () => {
        router.push(`/studio/${target_user?.id}/works`)
    }
    const tab = ref('chat')
    const tabs = ['chat', 'works']
</script>
<style scoped>
    .chat-box {
        min-width: 59vw;
        height: 800px;
    }
</style>
