import { computed } from 'vue';
import {teamStore, uiStore} from 'src/hooks/global/useStore';
import {checkBlocked} from 'src/api/strapi.js'
import { getChannelUnreads, getUnreadsForTeam, getMmSidebar } from "src/api/mattermost.js";

const mm_team = computed(() => teamStore?.team?.mm_team);
const team = computed(() => teamStore?.team);

export const useCheckBlocked = async (target_strapiUser) => {
    const { data } = await checkBlocked({
        target_id: target_strapiUser.id
    });
    // console.log('_isBlock', data);
    return {
        wasBlock: data.isblocked,
        isBlock: data.wasblocked
    }
}

export const findStrapiUser_by_mmID_inTeam = (mmID) => {
    const _member = teamStore.team?.members?.find(i => i.by_user?.mm_profile?.id === mmID)
    return _member.by_user
}

let debouns = null
export const updateUnreads = async () => {
    // 手动防抖
    if(debouns === 'cached') return
    debouns = 'cached'
    setTimeout(() => {
        debouns = null
    }, 500);

    const mm_uid = localStorage.getItem("mmUserId")
    const sidebar = await getMmSidebar(mm_uid, team.value.mm_team?.id);
    // console.log('sidebar', sidebar);
    const mm_channels_ids = sidebar.data?.categories?.find(i => i.id.includes('channels'))?.channel_ids
    // console.log('mm_channels_ids', mm_channels_ids);
    const _getChannelUnreads = async () => {
        let mm_channels = [];
        if(team.value?.team_channels?.length > 0){
            const filterMMChannel = team.value?.team_channels.filter(i => i.mm_channel && mm_channels_ids.includes(i.mm_channel.id))
            mm_channels.push(...filterMMChannel.map(i => i.mm_channel?.id));
        }
        if(team.value.projects?.length > 0){
            // can read
            const filterHaveMM = team.value.projects.filter(i => i.mm_channel && i.auth?.read && mm_channels_ids.includes(i.mm_channel.id));
            
            if(filterHaveMM?.length > 0){
                mm_channels.push(...filterHaveMM.map(i => i.mm_channel.id));
            }
        }
        if(mm_channels.length > 0){
            console.log('mm_channels', mm_channels);
            
            const promises = mm_channels.map(async (m) => {
                const res = await getChannelUnreads(mm_uid, m);
                if(res?.data) {
                    return res?.data;
                }
            })
            const allSettleds = await Promise.allSettled(promises)
            const fulfilleds = allSettleds.filter(i => i.status === "fulfilled")?.map((j) => j.value);
            if(fulfilleds.length > 0){
                uiStore.unreads.channels = fulfilleds
            }
        }
    }
    if(mm_uid){
      const res = await getUnreadsForTeam(mm_uid, mm_team.value.id)
      if(res?.data){
        uiStore.unreads.team = res?.data;
        await _getChannelUnreads();
      }
    }
}