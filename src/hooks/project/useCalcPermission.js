import useUserStore from "src/stores/user.js";
import useProjectStore from "src/stores/project.js";
import { computed } from "vue";

const userStore = useUserStore();
const projectStore = useProjectStore();

const user_id = computed(() => userStore.userId);

// user - 用户
// member - 成员
// role - 角色
// 一个用户 对应一个成员，一个成员可以对应多个角色

// 后端返回成员时：返回该成员对应的角色ID数组，根据此数组，在角色列表中筛选对应的角色权限
// 为何不返回成员时直接返回对应的角色及其权限：因为这样每个成员对应的所有角色的所有权限列表均要返回
// 而对应的内容过大，造成很多不必要的冗余数据

// 获取当前用户在当前项目中对应的所有角色的权限
// 项目成员
const project_members = computed(() => projectStore.project?.project_members);
// 项目角色
const project_roles = computed(() => projectStore.project?.member_roles);
// 当前用户在项目中的成员ID集合
// 项目成员 - 筛选当前用户对应的成员 - 提取出全部角色对应的ID
const cur_user_project_member_ids = computed(
  () =>
    project_members.value
      ?.filter((i) => i.by_user?.id === user_id.value)
      ?.map((j) => j.member_roles.map((k) => k.id))
      .flat(2) || null
);
// 当前用户所有角色对应的权限
const project_role = computed(() =>
  project_roles.value?.filter((i) =>
    cur_user_project_member_ids.value.includes(i.id)
  )
);

// 获取当前用户在当前卡片中对应的所有角色的权限
// 卡片成员
const card_members = computed(() => projectStore.card?.card_members);
// 卡片角色
const card_roles = computed(() => projectStore.card?.member_roles);
// 当前用户在卡片中的成员ID集合
// 卡片成员 - 筛选当前用户对应的成员 - 提取出全部角色对应的ID
const cur_user_card_member_ids = computed(
  () =>
    card_members.value
      ?.filter((i) => i.by_user?.id === user_id.value)
      ?.map((j) => j.member_roles.map((k) => k.id))
      .flat(2) || null
);
// 当前用户所有角色对应的权限
const card_role = computed(() =>
  card_roles.value?.filter((i) => cur_user_card_member_ids.value.includes(i.id))
);

// 字段鉴权
// collection - 数据集
// field - 需要鉴权的字段
// of 设置 project 或 card，标记验证权限的对象
const calc_auth = (collection, field, of) => {
  console.log("calc_auth", collection, field, of);
  const __calc_auth = (roles) => {
    let authArr = roles.map(
      (i) =>
        (field === "read" && i.read) ||
        (field === "create" && i.create) ||
        (field === "modify" && i.modify) ||
        (field === "delete" && i.delete) ||
        i.fields_permission.find((f) => f.field === field)?.modify ||
        null
    );
    return authArr.includes(true);
  };

  if (of === "project") {
    if (!projectStore.project || !project_role.value) {
      return false;
    }
    let roles = project_role.value?.map((i) =>
      i.ACL.find((p) => p.collection === collection)
    );
    console.log("roles", roles);
    return __calc_auth(roles);
  }
  if (of === "card") {
    if (!projectStore.card) {
      return false;
    }
    // console.log("roles", card_role.value);
    let roles = card_role.value?.map((i) =>
      i.ACL.find((p) => p.collection === collection)
    );

    return __calc_auth(roles);
  }
};
export default calc_auth;
