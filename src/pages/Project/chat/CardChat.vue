<template>
    <div class="fit column no-wrap">
        <ChatBody
            v-if="thread"
            :thread="thread"
            :key="thread_post_idRef"
            :thread_channel_id="thread_channel_idRef"
            :thread_post_id="thread_post_idRef"
            :asPannel="false"
            :hasMore_thread_Msgs="hasMore_thread_Msgs"
            @fetchMore="fetchMore__thread_Msgs"
        />
    </div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { getThread, getUsersByIDs, getUserStatusBy_ids } from 'src/api/mattermost.js';
import ChatBody from 'src/pages/Project/chat/ChatBody.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const props = defineProps({
    thread_post_id: {
        type: String,
        default: ''
    },
    thread_channel_id: {
        type: String,
        default: ''
    }
})

//获取回复主题的消息列表
const thread = ref();
const thread_post_idRef = toRef(props,'thread_post_id');
const thread_channel_idRef = toRef(props,'thread_channel_id');
const fromPost = ref('');
const fromCreateAt = ref(Date.now());
const fetch_thread_Msgs_options = ref(`fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}`);
const hasMore_thread_Msgs = ref();

const fetch_thread_Msgs = async () => {
    let res = await getThread(thread_post_idRef.value,fetch_thread_Msgs_options.value);

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
        // console.log(arr);
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
                // console.log(new_array.length);
                if(new_array.length === 11) {
                    hasMore_thread_Msgs.value = true;
                } else {
                    hasMore_thread_Msgs.value = false;
                }

                let _withProfile = await attach_profile(new_array);
                if(_withProfile) {
                    return thread.value = _withProfile.slice(1).reverse();
                }
            }
        }
    }
};
fetch_thread_Msgs();

const fetchMore__thread_Msgs = async () => {
    let old_thread_Msgs = thread.value;
    // console.log('old set');
    fromPost.value = old_thread_Msgs[0].id;
    fromCreateAt.value = old_thread_Msgs[0].create_at;

    // console.log('fromPost', fromPost.value,fromCreateAt.value);

    fetch_thread_Msgs_options.value = `fromPost=${fromPost.value}&fromCreateAt=${fromCreateAt.value}`;
    let new_thread_Msgs = await fetch_thread_Msgs();
    // console.log(new_thread_Msgs);
    if(new_thread_Msgs && new_thread_Msgs.length == 1) {
        thread.value = old_thread_Msgs;
        $q.notify({
          message: '没有更多消息了',
          position: 'top'
        })
    } else {
        // console.log('connected');
        let arr = new_thread_Msgs;
        thread.value = [...arr, ...old_thread_Msgs];
    }
}

</script>

<style lang="scss" scoped>


</style>
