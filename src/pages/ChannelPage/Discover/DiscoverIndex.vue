<template>
    <MessageRoot
        :readonly="readonly" 
        :postId="channelPostId"
        :isDiscover="true"
    />
</template>
<script setup>
import { ref } from 'vue';
import MessageRoot  from "src/pages/ChannelPage/Components/Message/MessageRoot.vue";
import { userStore, channelStore } from "src/hooks/global/useStore";

const channelPostId = ref(channelStore.matedata.post?.data?.id);
const readonly = ref(channelStore.matedata.channel_owner?.data?.id != userStore.userId)
</script>