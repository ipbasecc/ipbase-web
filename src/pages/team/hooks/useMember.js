import { userStore } from "src/hooks/global/useStore.js";
export function findRoles(members, member_roles) {
    if(!members || !member_roles) return [];
    const user_id = userStore.me?.id;
    // console.log('members',members, 'user_id', user_id);
    const _members = members.filter(member => member.by_user.id === Number(user_id));
    // console.log('_members',_members);
    const _member_roles = _members.map(i => i.member_roles.map(j => j.id))?.flat(3);
    // console.log('_member_roles',_member_roles);
    if(_member_roles?.length > 0) {
        const filteredRoles = member_roles.filter(role => _member_roles.includes(role.id));
        return filteredRoles.map(i => i.subject);
    } else {
        return [];
    }
}