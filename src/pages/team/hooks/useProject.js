import {teamStore} from 'src/hooks/global/useStore.js';

export default function useProject () {
    const isTargetRole = (role) => {
        const targetRole = teamStore.project?.member_roles?.find(i => i.subject === role);
        // console.log('targetRole', targetRole);
        
        const userMember = teamStore.project?.project_members?.find(i => i.by_user?.id === teamStore.init?.id);
        // console.log('userMember', userMember);
        return userMember.member_roles.map(i => i.id).includes(targetRole.id);
    }
    const isMember = () => {
        const execludeRoles = ['blocked', 'unconfirmed', 'staff'];
        const memberRoles = teamStore.project?.member_roles?.filter(i => !execludeRoles.includes(i.subject))?.map(i => i.id);
        const userMember = teamStore.project?.project_members?.find(i => i.by_user?.id === teamStore.init?.id);
        const userMemberRoles = userMember.member_roles.map(i => i.id);
        return memberRoles.filter(role => userMemberRoles.includes(role))?.length > 0;
    }
    const isManager = () => {
        const managerRoles = ['creator', 'owner'];
        const memberRoles = teamStore.project?.member_roles?.filter(i => managerRoles.includes(i.subject))?.map(i => i.id);
        const userMember = teamStore.project?.project_members?.find(i => i.by_user?.id === teamStore.init?.id);
        const userMemberRoles = userMember.member_roles.map(i => i.id);
        return memberRoles.filter(role => userMemberRoles.includes(role))?.length > 0;
    }
    const isChatMode = () => {
        if(teamStore.team?.config?.mode === 'toMany') {
            return true
        };
        return teamStore.project?.preferences?.find(i => i.name === 'project_settings')?.settings?.find(i => i.val === 'chat_mode')?.selected === 'chat'
    }
    return {
        isTargetRole,
        isMember,
        isManager,
        isChatMode
    }
}
