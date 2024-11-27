<template>
    <q-card bordered :style="$q.screen.gt.sm ? 'width: 61dvw;' : 'width: 90dvw;'">
        <q-card-section class="row no-wrap items-center q-py-sm">
            <div class="text-h6 q-space">{{ $t('join_request') }}</div>
            <q-btn round dense flat size="sm" icon="close" v-close-popup />
        </q-card-section>
        <q-card-section v-if="jsonContent">
          <TipTap
            :jsonContent="jsonContent"
            :editable="false"
            :need="'json'"
            :square="true"
            styleClass="fit"
          />
        </q-card-section>
        <q-card-section>
            <q-input v-model="params.data.message" :label="$t('join_request_message')" />
        </q-card-section>
        <q-card-section class="q-px-sm q-pt-xl q-pb-sm">
            <q-btn color="primary" unelevated class="full-width" :label="$t('create_join_request')" @click="createJoinRequest()" />
        </q-card-section>
    </q-card>
</template>
<script setup>
import {onBeforeMount, ref} from 'vue'
import {createJoinProjectRequest} from 'src/api/strapi/project.js'
import {useQuasar} from 'quasar'
import {i18n} from 'src/boot/i18n.js'

const $q = useQuasar()
const $t = i18n.global.t
const emit = defineEmits(['close'])

const {team,project,channel} = defineProps(['team','project','channel'])

const params = ref({
    data: {
        message: ''
    }
})
const jsonContent = ref(null)
onBeforeMount(() => {
    if(project) {
        params.value.data.project_id = project?.id;
        jsonContent.value = project?.jsonContent;
    }
    if(channel) {
        params.value.data.channel_id = channel?.id;
        jsonContent.value = channel?.jsonContent;
    }
    if(team) {
        params.value.data.team_id = team?.id;
        jsonContent.value = team?.introduce;
    }
})

const createJoinProject = async () => {
    const {data} = await createJoinProjectRequest(project?.id,params.value);
    if(data?.success) {
        $q.notify({
            message: data?.message,
            color: 'positive',
            position: 'top'
        })
        emit('close')
    }
}

const createJoinChannel = async () => {

}

const createJoinTeam = async () => {

}

const createJoinRequest = async () => {
    if(project) {
        await createJoinProject();
    }
    if(channel) {
        await createJoinChannel();
    }
    if(team) {
        await createJoinTeam();
    }
}
</script>
