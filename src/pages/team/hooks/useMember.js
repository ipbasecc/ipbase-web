export function findRoles(members, member_roles, userId) {
    if(!members || !member_roles || !userId) return [];
    const _members = members.filter(member => member.by_user?.id === Number(userId));
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
