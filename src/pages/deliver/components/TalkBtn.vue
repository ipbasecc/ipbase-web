<template>
    <q-btn color="positive" unelevated icon="mdi-forum" :label="dealStore.verified ? '联系 TA' : '去认证后再沟通'" class="full-width"
    @click="handler()" :disable="worker?.user?.id === teamStore.init?.id">
        <q-badge v-if="unread_count > 0" color="red" floating :label="unread_count" />
        <q-dialog v-model="showFloatChat" persistent>
            <FloatChat
                :channel_id="floatChatChannelId"
                :target_user="worker.user"
                @MsgSended="MsgSended"
            />
        </q-dialog>
        <q-tooltip v-if="!dealStore.verified">
            未认证用户不能使用此功能，点击去认证
        </q-tooltip>
        <q-tooltip v-if="worker?.user?.id === teamStore.init?.id">
            不能与自己聊天
        </q-tooltip>
    </q-btn>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { teamStore, dealStore, uiStore, mm_wsStore } from 'src/hooks/global/useStore'
import { updateCertificate } from 'src/api/strapi'
import { createDirect, getChannelUnreads } from 'src/api/mattermost';
import FloatChat from 'src/pages/team/chat/FloatChat.vue'
import localforage from 'localforage'
import { useRouter } from 'vue-router'
const router = useRouter()
const {worker} = defineProps(['worker'])

const self_certification_id = computed(() => teamStore.init?.certification?.id)

const showFloatChat = ref(false)
const floatChatChannelId = ref(null)
const handler = async () => {
    if(dealStore.verified) {
        await openFloatChat();
    } else {
        uiStore.app = 'business'
        router.push('/business/certificate')
    }
}
const unread_count = ref(0)
const openFloatChat = async () => {
    uiStore.projectRightDrawer = !uiStore.projectRightDrawer
    uiStore.projectRightDrawerContent = 'talkers'
    uiStore.talker = worker;
    // await createDirectFn()
    unread_count.value = 0
    // showFloatChat.value = true;
}
const createDirectFn = async () => {
    const a = teamStore.init?.mm_profile?.id;
    const b = worker.user?.mm_profile?.id;
    const { data } = await createDirect(a, b);
    floatChatChannelId.value = data.id;
}
const MsgSended = async () => {
    if(!worker?.talked_users) return
    if(!dealStore.talkers.includes(worker.id)){
        dealStore.talkers.push(worker.id)
        await localforage.setItem('talkers', dealStore.talkers)
        const add_talker_params = {
            data: {
                new_talker: worker.id,
            }
        }
        await updateCertificate(self_certification_id.value, add_talker_params);
    }
}
watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);
        if(message.props?.strapi_user_id === worker.user?.id && message.message !== '' && !showFloatChat.value){
            unread_count.value++
        }
      }
    },
    { immediate: true, deep: true }
);
</script>