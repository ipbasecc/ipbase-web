<template>
    <div v-if="threadRef && threadRef.length > 0" class="absolute-full overflow-hidden" :class="$q.dark.mode ? '' : 'bg-grey-3'">
        <q-toolbar class="row full-width border-bottom no-wrap items-center q-px-md q-py-sm gap-sm" :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'">
            <template v-if="asPannel && mmStore.extend_pannel_target_history.length > 1">
                <div class="">
                    <q-btn flat round dense icon="arrow_back_ios_new" @click="go_back()" />
                </div>
            </template>
            <span class="font-large text-line-1 q-space">
                主题：
                <span>{{ threadRef.find(i => i.root_id === '').message }}
                </span>
            </span>
            <template v-if="asPannel">
                <q-space />
                <div class="">
                    <q-btn flat round dense icon="close" @click="close()" />
                </div>
            </template>
        </q-toolbar>
        <!-- {{ threadRef }} -->
        <div style="max-height: calc(100% - 240px);" class="scroll-y q-pb-md">
            <q-pull-to-refresh @refresh="fetchMore" color="primary" class="q-py-md">
                <div v-for="(i, index) in threadRef" :key="i.id"
                    :class="`${mmStore.actived_thread === i.id ? 'bg-message' : ''}${i.type === '' ? ' mm_message transition' : ''}`"
                    class="relative-position"
                >
                    <MessageItem
                        :msg="i"
                        :prev="threadRef[index - 1]"
                        :index="index"
                        :inThread="true"
                        :asCtx="false"
                        :container="'thread'"
                    />
                </div>
            </q-pull-to-refresh>
            <div class="full-width flex flex-center" ref="bottom_dom" style="overflow-anchor: auto;">
                <q-btn v-if="hasMore_thread_MsgsRef" color="primary" flat dense padding="xs md" label="加载更多..." @click="$emit('fetchMore')" />
                <span v-else class="q-py-md font-smaller op-5">已加载所有消息</span>
            </div>
        </div>
        <SendmsgBox
            :thread_channel_id="thread_channel_idRef"
            :thread_post_id="thread_post_idRef"
            :asThread="true"
        />
    </div>
</template>

<script setup>
import { toRef, watch, ref, onBeforeMount } from "vue";
import MessageItem from 'src/pages/Chat/components/MessageItem.vue';
import SendmsgBox from 'src/pages/Chat/components/wigets/SendmsgBox.vue'

import useMmws from 'src/stores/mmws.js';
import useMmStore from 'src/stores/mmstore.js';
import localforage from 'localforage';


import { getUsersByIDs, getUserStatusBy_ids, getUserStatus, getUser, } from 'src/api/mattermost.js';

const mm_wsStore = useMmws();
const mmStore = useMmStore();
const props = defineProps({
    thread_channel_id: {
        type: String,
        default: "",
    },
    thread_post_id: {
        type: String,
        default: "",
    },
    thread: {
        type: Array,
        default() {
            return []
        }
    },
    asPannel: {
        type: Boolean,
        default: true
    },
    hasMore_thread_Msgs: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['fetchMore','closeThreads']);
const hasMore_thread_MsgsRef = toRef(props,'hasMore_thread_Msgs');

const fetchMore = (done) => {
    emit('fetchMore');
    done();
}
const close = () => {
    mmStore.extend_pannel_target_history = [];
    emit('closeThreads')
}

const thread_channel_idRef = toRef(props, 'thread_channel_id');
const thread_post_idRef = toRef(props, 'thread_post_id');
const threadRef = toRef(props, 'thread');

const go_back = () => {
    let his = mmStore.extend_pannel_target_history;
    if(his.length > 1) {
        mmStore.extend_pannel_target = his[his.length - 2];
        mmStore.extend_pannel_target_history.splice(his.length - 1, 1);
        mmStore.actived_thread = null;
    }
}

const _attach_profile = async () => {
    let arr = threadRef.value;
    let _users = await getUsersByIDs([...new Set(arr.map(i => i.user_id))]);
    let _status = await getUserStatusBy_ids([...new Set(arr.map(i => i.user_id))]);
    // console.log('_users',_users,'_status',_status);
    if(_users && _status) {
        for (let post of arr) {
            post.profile = _users.data.find(i => i.id === post.user_id);
            post.profile.status = _status.find(i => i.user_id === post.user_id);
        }
        threadRef.value = arr;
    }
}

onBeforeMount(() => {
    _attach_profile();
})

// 为发送消息准备发送者数据
const me_profile = ref(null)
async function getData() {
  try {
    const value = await localforage.getItem('mm_me')
    me_profile.value = value
  } catch (err) {
    console.log(err)
  }
}
getData()
watch(mm_wsStore, async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
        const message = JSON.parse(mm_wsStore.event.data.post);

        if(message.root_id === thread_post_idRef.value) {
            let _user = await getUser(message.user_id);
            if(_user) {
                message.profile = _user.data;
            }
            let _status = await getUserStatus(message.user_id);
            if(_status) {
                message.profile.status = _status;
            }
            if(_user && _status) {
                threadRef.value.push(message);
            }
        }
    }
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped></style>
