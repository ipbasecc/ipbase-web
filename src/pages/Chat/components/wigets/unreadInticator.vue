<template>
    <q-avatar v-if="unread_count > 0" size="1.5rem" class="border bg-primary">{{ unread_count }}</q-avatar>
</template>

<script setup>
import { ref, watch } from "vue"
import { getChannelUnreads } from 'src/api/mattermost.js';
import useMmws from 'src/stores/mmws.js';
const mm_wsStore = useMmws();

const props = defineProps({
    user_id: {
        type: String,
        default: ''
    },
    channel_id: {
        type: String,
        default: ''
    }
})

const unread_count = ref();
async function get_unreads () {
    await getChannelUnreads(props.user_id,props.channel_id).then(res => {
        unread_count.value = res.data.msg_count
    });
}
// get_unreads();

watch(mm_wsStore, () => {
    // if(
    //     mm_wsStore.event.event === 'posted'
    // ) {
    //     const Msg = JSON.parse(mm_wsStore.event.data.post);
    //     const channelId = Msg.channel_id;
    //     if(channelId === props.channel_id) {
    //         get_unreads();
    //     }
    // }
    // if(
    //     mm_wsStore.event.event === 'sidebar_category_updated' || 
    //     mm_wsStore.event.event === 'multiple_channels_viewed'
    // ) {
    //     get_unreads();
    // }
},{deep:true})
</script>

<style lang="scss" scoped></style>
