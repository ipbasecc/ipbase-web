
export default function useMember(){
    const _isCreator = (user_id,members,roles) => {

        const creatorRolesId = roles.find(i => i.subject === 'creator')?.id;
        const userMemberRoles = members?.filter((i) => i.by_user.id === user_id)?.map(j => j.id)

        return userMemberRoles?.includes(creatorRolesId)
    };
    return {
        _isCreator
    }
}