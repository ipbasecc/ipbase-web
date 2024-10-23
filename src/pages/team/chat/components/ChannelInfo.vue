<template>
    <div class="fit column no-wrap">
        <TipTap
            :editable="useAuths('jsonContent', ['channel'])"
            :jsonContent="teamStore.channel?.jsonContent"
            :withSaveBtb="true"
            need="json"
            class="q-space"
            :contentChanged
            @contentChanged="contentChanged = true"
            @tiptapBlur="updateChannelInfo"
        />
        <template v-if="useAuths('modify', ['channel']) || useAuths('invite_uris', ['channel']) || useAuths('delete', ['channel'])">
            <q-separator spaced inset />
            <ChannelMenu :channel="teamStore.channel" layout="grid" />
        </template>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { updateChannel } from "src/api/strapi/team.js";
import {teamStore, uiStore} from "src/hooks/global/useStore";
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue';
import ChannelMenu from '../../components/ChannelMenu.vue'

const contentChanged = ref(false);
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
        contentChanged.value = false
    }
}

</script>

<style scoped>
</style>