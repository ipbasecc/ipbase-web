<template>
    <div v-if="threadRef && threadRef.length > 0" class="absolute-full column no-wrap" :class="$q.dark.mode ? '' : 'bg-grey-3'">
        <q-scroll-area v-model="scrollModel" class="q-space" ref="scrollAreaRef">
            <q-pull-to-refresh v-if="threadRef" :key="thread_post_idRef" @refresh="fetchMore" color="primary">
                <q-resize-observer @resize="onResize" />
                <div v-for="(i, index) in threadRef" :key="index"
                    :class="`${mmStore.actived_thread === i.id ? 'bg-message' : ''}${i.type === '' ? ' mm_message transition' : ''}`"
                    class="relative-position column"
                >
                    <MessageItem
                        :msg="i"
                        :prev="threadRef[index - 1]"
                        :index="index"
                        :inThread="false"
                        :container="'channel'"
                    />
                </div>
            </q-pull-to-refresh>
            <!-- todo 无限滚动组件 fetchMore 一直被触发导致不断加载下一页，暂时使用下拉加载功能 -->
            <!-- <q-infinite-scroll v-if="threadRef" :key="thread_post_idRef" @load="fetchMore" :offset="50" reverse class="q-pt-xl">
            </q-infinite-scroll> -->
        </q-scroll-area>
        <SendmsgBox
            :thread_channel_id="thread_channel_idRef"
            :thread_post_id="thread_post_idRef"
            :asThread="true"
            @MsgSend="MsgSend()"
        />
    </div>
</template>

<script setup>
import { toRef, watch, ref } from "vue";
import MessageItem from 'src/pages/Chat/components/MessageItem.vue';
import SendmsgBox from 'src/pages/Chat/components/wigets/SendmsgBox.vue'

import useMmws from 'src/stores/mmws.js';
import useMmStore from 'src/stores/mmstore.js';
import localforage from 'localforage';

import { getUserStatus, getUser, } from 'src/api/mattermost.js';
import { useQuasar } from "quasar";
const $q = useQuasar();
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
const thread_channel_idRef = toRef(props, 'thread_channel_id');
const thread_post_idRef = toRef(props, 'thread_post_id');
const threadRef = toRef(props, 'thread');

const emit = defineEmits(['fetchMore','closeThreads']);
const hasMore_thread_MsgsRef = toRef(props,'hasMore_thread_Msgs');

const fetchMore = (done) => {
    if(!hasMore_thread_MsgsRef.value) {
        $q.notify('没有更多消息了')
        done(true);
    } else {
        emit('fetchMore');
        done(true);
    }
}
const fetchMore2 = (index,done) => {
    if(!hasMore_thread_MsgsRef.value) {
        $q.notify('没有更多消息了')
        done(true);
    } else {
        emit('fetchMore');
        watch(threadRef, (newVal,oldVal) => {
            if(newVal.value){
                done(true);
                setTimeout(() => {
                    done(false);
                }, 300);
            }
        },{immediate:true,deep:true})
    }
}

// 为发送消息准备发送者数据
const me_profile = ref(null)
async function getData() {
  try {
    const value = await localforage.getItem('me_profile')
    me_profile.value = value
  } catch (err) {
    console.log(err)
  }
}
getData();

watch(mm_wsStore, async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted" && mm_wsStore.event.data?.post) {
        if(mm_wsStore.event.data?.post) return
        console.log('post',mm_wsStore.event);
        let message = JSON.parse(mm_wsStore.event.data.post);
        
        if(message.root_id === thread_post_idRef.value) {
            let _user = await getUser(message.user_id);
            if(_user) {
                message.profile = _user.data;
            }
            let _user_status = await getUserStatus(message.user_id);
            if(_user_status) {
                message.profile.status = _user_status;
            }
            if(_user && _user_status) {
                console.log(message);
                threadRef.value.push(message);
            }
        }
    }
}, { immediate: true, deep: true });

const scrollModel = ref(100);
const scrollAreaRef = ref();
const view_box = ref();
const onResize = (size) => {
    view_box.value = size;
}
const scroll_bottom = () => {
    scrollAreaRef.value.setScrollPosition('vertical',view_box.value.height, 300)
}
const MsgSend = () => {
    scroll_bottom();
}

</script>

<style lang="scss" scoped></style>
