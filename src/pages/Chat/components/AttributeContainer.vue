<template>
  <div class="">{{ channel_idRef }}</div>
  <q-btn color="primary" icon="check" label="删除频道" @click="delete_channel" />
  <q-btn color="primary" icon="check" label="emoji" @click="getCustomEmojiFn" />
  <ul>
    <li>{{ emoji }}</li>
  </ul>
</template>

<script setup>
import { ref, toRef } from "vue";
import localforage from "localforage";
import { useRouter } from "vue-router";

import { deleteChannel, getCustomEmoji } from "src/api/mattermost.js";

const props = defineProps({
    channel_id: {
        type: String,
        default: ''
    }
});

const router = useRouter();

const channel_idRef = toRef(props,'channel_id');

const attribute = ref();
localforage.getItem(`__channel_${channel_idRef.value}`).then(res => {
    attribute.value = res
}).catch(err => {});

const delete_channel = async () => {
    try {
        let res = await deleteChannel(channel_idRef.value);
        if(res) {
            router.push('/chat')
        }
    } catch (error) {
        console.error(error);
    }
}

const emoji = ref()
const getCustomEmojiFn = async () => {
    try {
        let res = await getCustomEmoji();
        if(res) {
            emoji.value = res?.data
        }
    } catch (error) {
        console.error(error);
    }
}


</script>

<style lang="scss" scoped></style>
