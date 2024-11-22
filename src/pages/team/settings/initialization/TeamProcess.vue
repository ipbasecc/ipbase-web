<template>
    <div class="q-space gap-md" :class="$q.screen.lt.sm ? 'column gap-md' : 'row'">
        <div class="flex flex-center" :class="$q.screen.lt.sm ? '' : 'col-4'">
            <div class="column no-wrap gap-sm">
                <span class="font-large text-h1">团队</span>
                <span class="font-large">您可以在团队中创建讨论频道、协作项目！</span>

                <q-card v-if="!teamStore?.team" bordered class="q-mt-md bg-purple text-white">
                    <q-card-section class="q-px-lg">
                        <div class="text-h6">您已完成了团队初始化</div>
                        <div class="text-x-large">现在可以进行下一步了</div>
                    </q-card-section>
                </q-card>
                <template v-else>
                    <template v-if="initMode === 'create_team'">
                        <CreateTeam
                            ref="createTeamRef"
                            :hideHeader="true"
                            :hideFooter="true"
                            @completedCreate="completedCreate"
                        />
                        <div>
                            <q-btn label="创建团队" size="lg" padding="sm xl" type="submit" color="primary" @click="createTeamRef.create()"/>
                            <q-btn label="加入团队" size="lg" padding="sm xl" color="primary" flat class="q-ml-sm" @click="initMode = 'join_team'" />
                        </div>
                    </template>
                    <q-form
                        v-if="initMode === 'join_team'"
                        @submit="joinTeam()"
                        class="q-gutter-md"
                    >
                        <q-input
                            filled
                            square
                            v-model="invite_link"
                            label="邀请连接"
                            lazy-rules
                            :rules="[ val => val && isValidUrl(val) || '请输入正确的邀请连接']"
                        />
                        <div>
                            <q-btn label="加入团队" size="lg" padding="sm xl" type="submit" color="primary" />
                            <q-btn label="创建团队" size="lg" padding="sm xl" color="primary" flat class="q-ml-sm" @click="initMode = 'create_team'" />
                        </div>
                    </q-form>
                </template>
            </div>
        </div>
        <div :class="$q.screen.lt.sm ? '' : 'column flex-center col relative-position'">
            <img
                src="https://airspace.oss-cn-shanghai.aliyuncs.com/ipbase/public/images/Team.png"
                class="full-width"
                alt="Team"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { teamStore } from "src/hooks/global/useStore";
import CreateTeam from '../../components/CreateTeam.vue'
import { isValidUrl, parseQueryParams } from 'src/hooks/utilits.js'
import { join } from 'src/pages/team/hooks/useInvite.js'
import { setDefaultTeam, getTeamByID } from 'src/api/strapi/team.js'
const emit = defineEmits(['teamInitialized'])

const createTeamRef = ref(null);
const invite_link = ref('');
const initMode = ref('create_team');
const completedCreate = async (val) => {
   emit('teamInitialized', {
    create: val
   })
   await setDefaultTeamFn(val.id)
}
const setDefaultTeamFn = async (_team_id) => {
    if(!_team_id) return;
    const params = {
        data: {
        default_team: _team_id,
        },
    };
    const res = await setDefaultTeam(params);
    if (res?.data) {
        teamStore.$reset_team();
        teamStore.team = res.data;
        teamStore.mm_team = res.data.mm_team;
    }
};



const joinTeam = async () => {
    if(isValidUrl(invite_link.value)){

        const url = new URL(invite_link.value);
        const urlParams = new URLSearchParams(url.search);
        const code = urlParams.get('code');
        const decodedCode = atob(code);
        const queryParams = new URLSearchParams(decodedCode);

        console.log('queryParams', decodedCode, queryParams);
        
        const { team_id, channel_id, project_id, invite_code } = parseQueryParams(queryParams)
        const Msg = await join(team_id, channel_id, project_id, invite_code)
        // 加入成功后，如果加入的是团队，设置默认团队，
        //如果不是，且用户没有默认团队，应该设置，不过不需要在此处设置，后端在用户访问时，如果发现用户没有设置默认团队，会自动设置，此处可以不处理
        if(Msg){
            if(team_id){
                await setDefaultTeamFn(team_id)
            }
            emit('teamInitialized', {
                join: Msg
            })
        }
    }   
}
</script>

<style scoped>
</style>