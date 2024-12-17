<template>
    <q-card bordered class="q-mb-md" style="width: 760px; height: 500px;">
      <q-card-section horizontal class="fit q-pa-none">
        <q-card-section class="col-4 border-right q-pa-xs">
            <q-list v-if="talkers.length > 0" dense>
                <q-item v-for="talker in talkers" :key="talker.id" clickable v-ripple class="radius-xs"
                :class="talker.d_channel_id === d_channel_id ? 'bg-primary' : ''"
                @click="openChat(talker)">
                    <q-item-section avatar>
                        <q-avatar>
                            <img v-if="talker.profile?.avatar?.url" :src="talker.profile.avatar.url" />
                            <q-icon v-else name="account_circle" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        {{ talker.username }}
                    </q-item-section>
                    <q-badge v-if="unread_map[talker.d_channel_id] > 0" color="red" floating :label="unread_map[talker.d_channel_id]" />
                </q-item>
            </q-list>
            <div v-else class="fit flex flex-center text-grey-8">
                暂无沟通者
            </div>
        </q-card-section>

        <q-card-section class="q-space column no-wrap q-pa-none">
            <q-bar dark class="transparent">
                <q-btn v-if="!deal.party_b" dense flat color="primary" label="暂定合作，并要求其补充合约中乙方部分" padding="xs sm" @click="set_party_b" />
                <q-space />
                <q-btn dense flat round icon="mdi-close" size="8.5px" color="red" v-close-popup />
            </q-bar>
            <div class="q-space relative-position" @mouseenter="syncUnreadCount">
                <ChatContainter
                    v-if="d_channel_id"
                    :mm_channel_id="d_channel_id"
                    :pannel_mode="true"
                    :hide_float_bar="true"
                    @MsgSended="MsgSended"
                />
            </div>
        </q-card-section>
      </q-card-section>
    </q-card>
</template>
<script setup>
import { computed, ref, nextTick, onMounted } from 'vue';
// import { useQuasar } from 'quasar';
// import { createDirect } from 'src/api/mattermost';
// import { teamStore } from 'src/hooks/global/useStore';
import ChatContainter from 'src/pages/team/chat/ChatContainter.vue'

const { deal, unread_count_map } = defineProps(['deal', 'unread_count_map']);
const emit = defineEmits(['openChat', 'set_party_b']);
const talkers = computed(() => deal?.talked_users || []);
const unread_map = computed(() => unread_count_map);
// const $q = useQuasar();
const MsgSended = () => {
    console.log('MsgSended')
}

const d_channel_id = ref(null);
const talker = ref(null);
const openChat = async (_talker) => {
    d_channel_id.value = _talker.d_channel_id;
    talker.value = _talker;
    emit('openChat', d_channel_id.value);
}
const set_party_b = () => {
    emit('set_party_b', talker.value);
}
const syncUnreadCount = () => {
    if(unread_map.value[d_channel_id.value] > 0) {
        emit('openChat', d_channel_id.value);
    }
}
onMounted(async () => {
    await nextTick();
    if(talkers.value.length > 0) {
        openChat(talkers.value[0]);
    }
})
</script>
