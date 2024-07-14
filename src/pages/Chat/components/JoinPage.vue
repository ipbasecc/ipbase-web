<template>
  <div class="absolute-full flex flex-center">
    <q-spinner-orbit
        v-if="loading"
        color="primary"
        size="3rem"
        :thickness="5"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { addToTeamByInvite, getInviteInfo, getTeam } from "src/api/mattermost.js";

const route = useRoute();
const router = useRouter();

const ivnite_id = route.query?.id || null;
const loading = ref(true);

const joinTeam = async () => {
    let join = await addToTeamByInvite(ivnite_id);

    if(join) {

        let inviteInfo = await getInviteInfo(ivnite_id);
        if(inviteInfo) {
            let teamId_of_joined = inviteInfo.data.team_id;
            let team_of_joined = await getTeam(teamId_of_joined);
            if(team_of_joined) {
                loading.value = false;
                localStorage.setItem('mmActiveTeamID',team_of_joined.data.id);
                router.push(`/chat/${team_of_joined.data.name}`);
            }
        }
    }
};
watch(ivnite_id, () => {
    if(ivnite_id) {
        joinTeam();
    }
},{immediate:true,deep:true})
</script>

<style lang="scss" scoped></style>
