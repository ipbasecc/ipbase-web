<template>
    <div>
        <q-btn v-if="!uiStore.meet && !teamStore.project?.meeting"
            dense round unelevated class="full-width"
            @click="startMeet"
        >
            <MeetIcon color="#efefef" />
        </q-btn>
        <q-btn v-else color="negative" :label="$t('join_meet')" class="full-width" @click="joinMeet" />
    </div>
</template>

<script setup>
import { uiStore, teamStore } from "src/hooks/global/useStore.js";
import { startMeet as startProjectMeet } from 'src/api/strapi/project.js'
import useMeet from './useMeet.js';
import MeetIcon from 'src/pages/team/components/widgets/icons/MeetIcon.vue'


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