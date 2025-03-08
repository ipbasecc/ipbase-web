import { teamStore } from "../global/useStore";

export default function useMember(){
    const _isCreator = (user_id,members,roles) => {
        
        const creatorRolesId = roles.find(i => i.subject === 'creator')?.id;
        const userMemberRoles = members?.filter((i) => i.by_user.id === user_id)?.map(j => j.member_roles).flat(2).map(k => k.id)

        return userMemberRoles?.includes(creatorRolesId)
    };
    const _isOwner = (user_id,members,roles) => {

        const creatorRolesId = roles.find(i => i.subject === 'owner')?.id;
        const userMemberRoles = members?.filter((i) => i.by_user.id === user_id)?.map(j => j.member_roles).flat(2).map(k => k.id)

        return userMemberRoles?.includes(creatorRolesId)
    };
    const _isExecutor = (user_id,members,roles) => {

        const creatorRolesId = roles.find(i => i.subject === 'executor')?.id;
        const userMemberRoles = members?.filter((i) => i.by_user.id === user_id)?.map(j => j.member_roles).flat(2).map(k => k.id)

        return userMemberRoles?.includes(creatorRolesId)
    };
    const _isCurTeamCreator = () => {
        // console.log(teamStore.team);
        const adminRole = teamStore.team.member_roles.find(i => i.subject === 'admin');
        const userMemberRoles = teamStore.team.members.filter(i => i.by_user?.id === teamStore.init?.id).map(j => j.member_roles).flat(2);
        // console.log(adminRole, userMemberRoles);
        
        return userMemberRoles?.map(i => i.id).includes(adminRole?.id)
    }
    return {
        _isCreator,
        _isOwner,
        _isCurTeamCreator,
        _isExecutor
    }
}