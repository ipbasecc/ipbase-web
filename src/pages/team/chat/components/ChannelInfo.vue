<template>
    <TipTap
        :editable="!useAuths('jsonContent', ['channel'])"
        :jsonContent="teamStore.channel?.jsonContent"
        :withSaveBtb="true"
        need="json"
        @tiptapBlur="updateChannelInfo"
    />
</template>

<script setup>
import { ref } from 'vue'
import { updateChannel } from "src/api/strapi/team.js";
import {teamStore, uiStore} from "src/hooks/global/useStore";
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue';

const updateChannelInfo = async (jsonContent) => {
    const channel_id = teamStore.channel.id
    const params = {
        channel_id: channel_id,
        data: {
            jsonContent: jsonContent
        }
    }
    const { data } = await updateChannel(channel_id, params);
    if(data){
        teamStore.channel.jsonContent = data.jsonContent
    }
}

</script>

<style scoped>
</style>