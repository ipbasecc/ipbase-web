<template>
    <q-card bordered style="min-width: 28rem;">
        <q-card-section class="row no-wrap q-pa-sm border-bottom">
            {{ $t('set_team_notification_label') }}
            <q-space />
            <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
            <q-input
                v-model="content" type="textarea"
                square filled
            />
        </q-card-section>
        <q-card-section class="row no-wrap q-pa-sm border-top">
            <q-space />
            <q-btn :disable="!content || content === teamStore.team?.notification"
                color="primary" dense padding="xs md" v-close-popup :label="$t('confirm')" @click="save"
            />
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {teamStore} from "src/hooks/global/useStore";
import { updateTeam } from "src/api/strapi/team.js";
import { patchTeam } from "src/api/mattermost.js";

const content = ref();
onMounted(() => {
    content.value = teamStore.team?.notification;
})
const params = ref({
  data: {
    notification: '',
  },
});

const save = async () => {
    params.value.data.notification = content.value;
    const res = await updateTeam(teamStore.team?.id, params.value);
    if (res?.data) {
        teamStore.team = res.data;

        const mm_params = ref({
            description: content.value,
        })
        await patchTeam(teamStore.team?.mm_team?.id, mm_params.value);
    }
};
</script>

<style scoped>
</style>