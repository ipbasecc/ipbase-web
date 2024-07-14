import { userStore } from "src/hooks/global/useStore.js";
function useAuth(field, collection, members, roles) {
  const __calc_auth = (_ACLs) => {
    // console.log("team_role", team_role.value);
    let authArr = _ACLs.map(
      (i) =>
        (field === "read" && i.read) ||
        (field === "create" && i.create) ||
        (field === "modify" && i.modify) ||
        (field === "delete" && i.delete) ||
        i.fields_permission.find((f) => f.field === field)?.modify ||
        null
    );
    // console.log(authArr);
    return authArr.includes(true);
  };

  // 用户的所有角色id集合
  const _userMember_roles = members
    .filter((i) => i.by_user?.id === Number(userStore.userId))
    ?.map((j) => j.member_roles.map((k) => k.id))
    .flat(3);
  // console.log("_userMember_roles", _userMember_roles);
  // 筛选出用户在卡片中的角色
  const _member_roles = roles.filter((i) => _userMember_roles.includes(i.id));
  // console.log("_member_roles", _member_roles);
  const ACLs = _member_roles
    .map((i) => i.ACL)
    ?.flat(2)
    .filter((j) => j.collection === collection);
  // console.log("ACLs", ACLs);
  return __calc_auth(ACLs);
}
export default useAuth;
