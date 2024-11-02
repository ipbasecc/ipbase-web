<template>
    <div class="full-width q-pa-sm">
        <q-btn v-if="!uiStore.meet && !teamStore.project?.meeting" color="primary" class="full-width" :label="$t('start_meet')" @click="startMeet" />
        <q-btn v-else color="primary" :label="$t('join_meet')" class="full-width" @click="joinMeet" />
    </div>
</template>

<script setup>
import { uiStore, teamStore } from "src/hooks/global/useStore.js";
import { startMeet as startProjectMeet } from 'src/api/strapi/project.js'
import useMeet from './useMeet.js';


const { project } = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const startMeet = async () => {
    const { jitsi_token } = await useMeet(teamStore.project?.id)
    if(project && jitsi_token){
        const { data } = await startProjectMeet(project.id);
        if(data){
            uiStore.meet = {
                room_name: project.mm_channel?.id || `${project.id}_meetRoom_by_${teamStore.init?.id}`
            }
            joinMeet();
        }
    }
}

const joinMeet = () => {
    uiStore.init_meet = true,
    uiStore.show_meet = true
}
</script>