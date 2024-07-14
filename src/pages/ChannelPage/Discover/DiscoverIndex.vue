<template>
    <MessageRoot
        :readonly="readonly" 
        :postId="channelPostId"
        :isDiscover="true"
    />
</template>
<script setup>
import { ref } from 'vue';
import useChannelStore from 'src/stores/channel.js';
import useUserStore from 'src/stores/user.js';
import MessageRoot  from "src/pages/ChannelPage/Components/Message/MessageRoot.vue";

const channelStore = useChannelStore();
const userStore = useUserStore();
const channelPostId = ref(channelStore.matedata.post?.data?.id);
const readonly = ref(channelStore.matedata.channel_owner?.data?.id != userStore.userId)
</script>