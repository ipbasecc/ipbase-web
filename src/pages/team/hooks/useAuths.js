import { userStore, teamStore } from "src/hooks/global/useStore.js";
import { computed } from "vue";

const teamMembers = computed(() => teamStore.team?.members || []);
const projectMembers = computed(() => teamStore.project?.project_members || []);
const cardMembers = computed(() => teamStore.team?.card_members || []);
const teamMemberRoles = computed(() => teamStore.team?.member_roles || []);
const projectMemberRoles = computed(() => teamStore.project?.member_roles || []);
const cardMemberRoles = computed(() => teamStore.team?.member_roles || []);

const _members = computed(() => [...teamMembers.value, ...projectMembers.value, ...cardMembers.value]);
const _roles = computed(() => [...teamMemberRoles.value, ...projectMemberRoles.value, ...cardMemberRoles.value]);

// 缓存Map
const authsCache = new Map();
export const cleanCache = () => {
  console.log('cleanCache');
  
  authsCache.clear(); 
}

// 辅助函数，用于生成唯一的缓存键
function getCacheKey(field, collections, members, roles) {
  const memberIDs = members.map(i => i.id);
  const roleIDs = roles.map(i => i.id);
  return JSON.stringify({field, collections, memberIDs, roleIDs})
}

// 优化前的useAuths hook
export function useAuths(field, collections, from) {
  // if(from){
    
  // }
  // console.log('members', members);
  // 生成缓存键
  const cacheKey = getCacheKey(field, collections, _members.value, _roles.value);

  // 检查缓存中是否有结果
  if (authsCache.has(cacheKey)) {
    return authsCache.get(cacheKey);
  }

  if (!_roles.value?.length === 0 || !_roles.value?.length === 0) return false;
  // 优化：将成员角色的筛选提前到只有当用户ID匹配时才进行
  // 这样可以减少不必要的计算
  const userId = Number(userStore.userId);
  const filteredMembers = _members.value.filter(member => member.by_user?.id === userId);
  // console.log('projectMembers', projectMembers.value);
  
  const _userMember_roles = filteredMembers
    .map(member => member.member_roles?.map(role => role.id))
    .flat(3);

  // console.log('_userMember_roles', _userMember_roles);
  const _member_roles = _roles.value.filter(role => _userMember_roles.includes(role.id))?.filter(Boolean);
  // console.log('_member_roles', _member_roles);

    // 立即执行函数，返回一个函数
  const __calc_auth = ((_ACLs) => {
    // 这个内层的函数是实际用于计算权限的函数
    return (_ACLs) => {
      // 确保传入的_ACLs是一个数组
      if (!Array.isArray(_ACLs)) return false;
      // 使用reduce来生成权限数组
      const authArr = _ACLs.reduce((acc, i) => {
        // 确保i具有所需的属性
        if (i && typeof i === 'object') {
          const permission = i[field] || (i.fields_permission && i.fields_permission.find(f => f.field === field)?.modify);
          acc.push(permission === true); // 直接推入布尔值true或false
        }
        return acc;
      }, []);
      // 返回权限数组中是否包含true
      return authArr.some(auth => auth);
    };
  })();

  const _Auths = collections.map(collection => {
    const ACLs = _member_roles
      .map(role => role.ACL)
      .flat(2)
      .filter(ACL => ACL.collection === collection);
    // 确保ACLs是一个数组，然后调用__calc_auth
    return ACLs.length > 0 ? __calc_auth(ACLs) : false;
  });
  const result = _Auths.some(auth => auth); // 使用some替代includes，一旦找到true即可终止循环
  
  // 缓存结果
  authsCache.set(cacheKey, result);
  return result
}
