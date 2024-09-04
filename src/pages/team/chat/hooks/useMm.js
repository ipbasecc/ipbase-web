
import {teamStore} from 'src/hooks/global/useStore';
import { checkBlocked } from 'src/api/strapi.js'

export const useCheckBlocked = async (target_strapiUser) => {
    const { data } = await checkBlocked({
        target_id: target_strapiUser.id
    });
    console.log('_isBlock', data);
    return {
        wasBlock: data.isblocked,
        isBlock: data.wasblocked
    }
}

export const findStrapiUser_by_mmID_inTeam = (mmID) => {
    const _member = teamStore.team?.members?.find(i => i.by_user?.mm_profile?.id === mmID)
    return _member.by_user
}