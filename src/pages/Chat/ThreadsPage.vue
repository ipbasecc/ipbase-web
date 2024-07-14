<template>
    <div class="absolute-full column">
        <div class="column justify-center q-py-sm border-bottom q-px-md" style="height: 64px;">
            <div class="row q-px-sm no-wrap gap-sm">
                <span class="font-medium font-bold-600">已关注的主题</span>
            </div>
            <div class="row no-wrap gap-sm q-px-sm">
                <span class="font-small op-5">您参与的主题在这里集中展示</span>
            </div>
        </div>
        <q-splitter
            class="q-space"
            v-model="splitterModel"
            unit="px"
            :limits="[280, 520]"
            separator-class="transparent border-left"
        >

        <template v-slot:before>
            <div class="absolute-full column no-wrap">
                <q-toolbar v-if="threads" class="transparent row no-wrap gap-xs">
                    <q-btn flat dense padding="xs sm" :label="`查看全部主题`" :color="filterThreads == 'all' ? 'primary' : ''"
                        @click="filterThreadsFn('all')"
                    />
                    <q-btn flat dense padding="xs sm" :label="`${threads.total_unread_threads} 未读`" :color="filterThreads == 'unread' ? 'primary' : ''"
                        @click="filterThreadsFn('unread')"
                    >
                        <q-badge v-if="threads.total_unread_threads > 0" color="red" rounded floating align="middle" />
                    </q-btn>
                    <q-space />
                    <q-btn flat dense size="sm" icon="playlist_add_check" @click="readAllThreads(user_idRef,team_idRef)" />
                    <q-icon v-if="threads.total_unread_threads > 0 || threads.total_unread_urgent_mentions > 0" name="radio_button_checked" color="green">
                        <q-tooltip class="transparent">
                            有 <span class="q-px-xs text-white bg-primary radius-xs">{{ threads.total_unread_threads }}</span> 条未读
                        </q-tooltip>
                    </q-icon>
                </q-toolbar>
                <q-scroll-area class="q-space">
                    <q-pull-to-refresh @refresh="fetchMore_threadsFn" color="primary">
                        <q-list v-if="threads">
                            <q-item clickable v-ripple
                                v-for="i in threads.threads" :key="i.id"
                                :class="`${actived_thread === i.post.id ? 'bg-message' : ''}${i.post.type === '' ? ' mm_message transition cursor-pointer' : ''}`"
                                class="relative-position tiptap hovered-item"
                            >
                                <q-item-section avatar top>
                                    <UserAvatar
                                        :user_id="i.post.user_id"
                                        :size="36"
                                        :status="i.post.user_status"
                                    />
                                </q-item-section>
                                <q-item-section class="gap-sm">
                                    <q-item-label caption class="row items-center gap-sm">
                                        <q-icon v-if="i.post.is_pinned" name="push_pin" />
                                        <span class="op-5">{{ useTimeDisplay(i.post.create_at) }}</span>
                                        <div v-if="i.unread_replies > 0" style="width: 4px; height: 4px;" class="radius-full bg-primary" />
                                    </q-item-label>
                                    <q-item-label>
                                        <span
                                            class="font-medium cursor-pointer font-larger"
                                            v-html="md.render(i.post.message)"
                                            @click="getThreadFn(i)"
                                        />
                                    </q-item-label>
                                    <q-item-label caption class="op-5">
                                        <q-icon name="reply" />{{ i.reply_count }}
                                        {{ i.unread_replies > 0 ? i.unread_replies + ' | 未读' : '' }}
                                        <span v-if="i.unread_mentions > 0" class="bg-deep-yellow text-white radius-xs q-px-xs">
                                             | @{{ i.unread_mentions }}
                                        </span> |
                                        {{ useTimeDisplay(i.last_reply_at) }}
                                    </q-item-label>
                                </q-item-section>
                                <q-item-section side top class="hover-show transition">
                                    <q-btn round dense flat size="sm" icon="more_vert">
                                        <q-menu>
                                            <q-list style="min-width: 100px">
                                                <q-item clickable v-close-popup @click="removeThread(user_idRef,team_idRef,i.id)">
                                                    <q-item-section>取消关注</q-item-section>
                                                </q-item>
                                                <q-item v-if="i.unread_replies === 0" clickable v-close-popup @click="unreadThreadFn(i)">
                                                    <q-item-section>标记为“未读”</q-item-section>
                                                </q-item>
                                                <q-item v-else clickable v-close-popup @click="readThreadFn(i)">
                                                    <q-item-section>标记为“已读”</q-item-section>
                                                </q-item>
                                            </q-list>
                                        </q-menu>
                                    </q-btn>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-pull-to-refresh>
                    <div class="full-width flex flex-center q-pa-md">
                        <q-btn v-if="hasMore_threads" color="primary" flat dense padding="xs md" label="加载更多..." @click="fetchMore_threads" />
                        <span v-else class="op-3">已加载了所有关注的主题</span>
                    </div>
                </q-scroll-area>
            </div>
        </template>

        <template v-slot:after>
            <ThreadContainer
                v-if="thread"
                :key="thread_post_id"
                :thread_channel_id="thread_channel_id"
                :thread_post_id="thread_post_id"
                :thread="thread"
                :asPannel="false"
                :hasMore_thread_Msgs="hasMore_thread_Msgs"
                @fetchMore="fetchMore__thread_Msgs"
            />
        </template>

        </q-splitter>
    </div>
</template>

<script setup>
import { toRef, watch, ref, watchEffect } from "vue";
import ThreadContainer from 'src/pages/Chat/components/ThreadContainer.vue';
import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import {
    getThreadsByUserTeamID,
    getThread,
    getUsersByIDs,
    getUserStatusBy_ids,
    removeThread,
    readThread,
    readAllThreads,
    unreadThread
} from 'src/api/mattermost.js';

import useMmStore from 'src/stores/mmuser.js';
import useMmws from 'src/stores/mmws.js';
import MarkdownIt from "markdown-it";
import { useTimeDisplay } from "src/hooks/global/useTimeDisplay.js";
import { useQuasar } from 'quasar';
let md = new MarkdownIt();


const mmStore = useMmStore();

const props = defineProps({
    user_id: {
        type: String,
        default: "",
    },
    team_id: {
        type: String,
        default: "",
    }
});

const user_idRef = toRef(props,'user_id');
const team_idRef = toRef(props,'team_id');

//获取主题列表
const filterThreads_options = ref(`&unread=false`);
const threads = ref();
const threads_before = ref('');
const threads_per_page = ref(20);
const threads_options = ref();
const posts = ref([])
const hasMore_threads = ref();
const getThreads = async () => {
  let res = await getThreadsByUserTeamID(user_idRef.value, team_idRef.value, threads_options.value);
  if(res) {
    return res.data
  }
};

const setThreads = async () => {
    let res = await getThreads();
    if(res?.threads.length > 0) {
        threads.value = res;
        let arr = threads.value.threads
        let _status = await getUserStatusBy_ids([...new Set(arr.map(i => i.post.user_id))]);
        console.log(_status);

        if(_status) {
            for (let thread of arr) {
                thread.post.user_status = _status.find(i => i.user_id === thread.post.user_id);
            }
            threads.value.threads = arr
        }
    }
}

watchEffect(() => {
    hasMore_threads.value = threads.value && threads.value.total > threads.value.threads.length;
    threads_options.value = `before=${threads_before.value}${filterThreads_options.value}&per_page=${threads_per_page.value}&extended=false&deleted=false`;
})

const $q = useQuasar();

const fetchMore_threadsFn = async (done) => {
    await fetchMore_threads();
    done();
}
const fetchMore_threads = async () => {
    let old_threads = threads.value;
    if(!hasMore_threads.value) {
        $q.notify({
          message: '没有更多消息了',
          position: 'top'
        })
        return
    } else {
        threads_before.value = threads.value.threads[threads.value.threads.length - 1].id;
        threads_options.value = `before=${threads_before.value}${filterThreads_options.value}&per_page=${threads_per_page.value}&extended=false&deleted=false`;
        let new_threads = await getThreads();
        if(new_threads) {


            let arr = new_threads.threads
            let _status = await getUserStatusBy_ids([...new Set(arr.map(i => i.post.user_id))]);

            if(_status) {
                for (let thread of arr) {
                    thread.post.user_status = _status.find(i => i.user_id === thread.post.user_id);
                }
                threads.value.threads.push(...new_threads.threads);
            }
        }
    }
}

//获取回复主题的消息列表
const thread = ref();
const thread_post_id = ref();
const thread_channel_id = ref();
const actived_thread = ref();
const fromPost = ref('');
const fromCreateAt = ref('');
const fetch_thread_Msgs_options = ref(`fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}`);
const hasMore_thread_Msgs = ref();

const fetch_thread_Msgs = async () => {
    let res = await getThread(actived_thread.value,fetch_thread_Msgs_options.value);

    // 附加用户资料 - 头像、名字等
    const attach_profile = async(val) => {
        let arr = val;
        let resps = await getUsersByIDs([...new Set(arr.map(i => i.user_id))]);
        let _status = await getUserStatusBy_ids([...new Set(arr.map(i => i.user_id))]);

        if(resps && _status) {
            for (let user of arr) {
                user.profile = resps.data.find(i => i.id === user.user_id);
                user.profile.status = _status.find(i => i.user_id === user.user_id);
            }
        }
        console.log(arr);
        return arr
    }

    if(res) {
        let obj = res.data;
        let new_array = [];

        // 遍历obj.order数组，结构化返回的 thread
        for (let element of obj.order) {
            let key = element;
            // 如果obj.posts中存在该key值，获取其对应的value内容
            if (obj.posts.hasOwnProperty(key)) {
                let value = obj.posts[key];
                // 将value内容添加到new_array数组中
                new_array.push(value);
            }
            if (obj.order.length === new_array.length) {
                hasMore_thread_Msgs.value = new_array.length == 20;

                let _withProfile = await attach_profile(new_array);
                if(_withProfile) {
                    return thread.value = _withProfile
                }
            }
        }
    }
};

// const status = ref();
// watch(thread, async () => {
//     if(thread.value) {
//         // status.value = awaitgetUserStatusBy_ids(thread.value.map(i => i.user_id))
//     }
// })

const fetchMore__thread_Msgs = async () => {
    let old_thread_Msgs = thread.value;
    console.log('old set');
    fromPost.value = old_thread_Msgs[old_thread_Msgs.length - 1].id;
    fromCreateAt.value = old_thread_Msgs[old_thread_Msgs.length - 1].create_at;

    console.log('fromPost', fromPost.value,fromCreateAt.value);

    fetch_thread_Msgs_options.value = `fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}`;
    let new_thread_Msgs = await fetch_thread_Msgs();
    console.log(new_thread_Msgs);
    if(new_thread_Msgs && new_thread_Msgs.length == 1) {
        thread.value = old_thread_Msgs;
        $q.notify({
          message: '没有更多消息了',
          position: 'top'
        })
    } else {
        console.log('connected');
        let arr = new_thread_Msgs.splice(0, 1);
        thread.value = [...old_thread_Msgs, ...arr];
    }
}

const getThreadFn = async (i) => {
    actived_thread.value = i.id;
    thread_channel_id.value = i.post.channel_id;
    thread_post_id.value = i.post.id;
    let res = await fetch_thread_Msgs();
    if(res) {
        try {
            await readThread(user_idRef.value,team_idRef.value,i.id).then(res => {
                if(res) {
                    // getThreads();
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
};

const unreadThreadFn = async (i) => {
    await unreadThread(user_idRef.value,team_idRef.value,i.id,i.post.id);
}
const readThreadFn = async (i) => {
    await readThread(user_idRef.value,team_idRef.value,i.id);
}

const filterThreads = ref('all');
const filterThreadsFn = async (val) => {
    posts.value = []
    filterThreads.value = val;
    if(val === 'all'){
        filterThreads_options.value = '&unread=false&since=0';
        threads_options.value = `before=${threads_before.value}${filterThreads_options.value}&per_page=${threads_per_page.value}&extended=false&deleted=false`
    }
    if(val === 'unread'){
        filterThreads_options.value = '&unread=true&since=0';
        threads_options.value = `before=${threads_before.value}${filterThreads_options.value}&per_page=${threads_per_page.value}&extended=false&deleted=false`
    }
    await getThreads();
}

watch([user_idRef,team_idRef], () => {
    if(user_idRef.value && team_idRef.value) {
        mmStore.current_channel_id = 'threads';
        setThreads();
    }
},{immediate:true,deep:true});


const mm_wsStore = useMmws();
watch(mm_wsStore, () => {
    if(mm_wsStore.event && mm_wsStore.event.event == 'thread_follow_changed') {
        setThreads();
    }
    if(mm_wsStore.event && mm_wsStore.event.event == 'thread_updated') {
        setThreads();
    }
    if(mm_wsStore.event && mm_wsStore.event.event == 'thread_read_changed') {
        setThreads();
    }
},{immediate:true,deep:true});

const splitterModel = ref(480)
</script>

<style lang="scss" scoped></style>
