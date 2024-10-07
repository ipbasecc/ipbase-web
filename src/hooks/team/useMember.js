
export default function useMember(){
    const _isCreator = (user_id,members,roles) => {
        const _userMember_roles = members
        ?.filter((i) => i.by_user.id === user_id)
        ?.map((j) => j.member_roles.map((k) => k.id))
        .flat(3);
    
        const _member_role = roles?.filter((i) =>
            _userMember_roles.includes(i.id)
        );
    
        let _isCreator;
        if (_member_role?.length > 0) {
            _isCreator = _member_role.map((i) => i.subject)?.includes("creator");
        }
        return _isCreator;
    };
    return {
        _isCreator
    }
}