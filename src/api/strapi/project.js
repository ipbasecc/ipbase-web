import { api } from "boot/axios";
import { Notify } from "quasar";
import { db } from "src/boot/dexie.js";
import { uiStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';
import {clearLocalDB} from "pages/team/hooks/useUser";
import { useRouter } from "vue-router";

const $t = i18n.global.t;
let router

/**
 * router 需要在setup中
 */
export default {
  setup() {
    router = useRouter();
  }
}

let initCache; //缓存用户初始化数据
// 获取用户初始化数据
export async function init_user() {
  if (initCache) {
    return initCache;
  } else {
    // let options = `?page=1&per_page=10`
    try {
      const res = await api.get(`users-permissions/user/me/init`);
      if (res?.data) {
        initCache = res.data;
        setTimeout(() => {
          initCache = void 0;
        }, 1000); // 缓存1秒
        return res;
      }
    } catch (error) {
      console.log(error);
      if(error?.response?.data?.error?.status === 401 || error.status === 401) {
        await clearLocalDB('Strapi init_user');
        window.location.reload();
      } else {
        console.log(error?.response?.data?.error?.message);
      }
      throw error;
    }
  }
}

//获取更多用户项目
//用户项目初始获取在init方法中，因此此处必须要分页参数，且起始页必须大于1
export async function getProjects(page, per_page) {
  if (!page || !per_page) {
    Notify.create($t('need_pagination_info'));
    return;
  }
  let options = `?page=${page}&per_page=${per_page}`;
  try {
    const res = await api.get(`projects${options}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function getCards(team_id, start, limit) {
  if (start < 0 || limit < 0) {
    Notify.create($t('need_pagination_info'));
    return;
  }
  let options = `?team_id=${team_id}&start=${start}&limit=${limit}`;
  try {
    const res = await api.get(`cards${options}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function getFollowedCards(team_id, start, limit) {
  if (start < 0 || limit < 0) {
    Notify.create($t('need_pagination_info'));
    return;
  }
  let options = `?team_id=${team_id}&start=${start}&limit=${limit}`;
  try {
    const res = await api.get(`follows${options}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//创建项目
export async function createProject(params) {
  try {
    const res = await api.post(`projects`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 创建项目邀请链接
// params: {
//     "max_total": 10,
//     "up_time": 1661012592826
// }
export async function genInvite(project_id, params) {
  try {
    const res = await api.post(`projects/${project_id}/invite`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 访问邀请
export async function visitInvite(project_id, invite_code) {
  try {
    const res = await api.get(
      `projects/visit_invite/${project_id}/${invite_code}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    console.log("...", error.response);
    return error.response;
  }
}
// 访问项目邀请链接 成为待确认成员
export async function acceptInvite(project_id, invite_code) {
  try {
    const res = await api.get(`projects/invite/${project_id}/${invite_code}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 拒绝用户
export async function removeUser(project_id, params) {
  try {
    const res = await api.post(`projects/${project_id}/remove_user`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 设置角色
export async function setRole(project_id, params) {
  try {
    const res = await api.post(`projects/${project_id}/set_role`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//创建项目Board
// {
//     "project_id": 10,
//     "name": "新任务合集"
// }
export async function createBoard(params) {
  try {
    const res = await api.post(`boards`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//更新项目Board
export async function updateBoard(board_id, params) {
  try {
    const res = await api.put(
      `boards/${board_id}`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除项目Board
export async function deleteBoard(project_id, board_id) {
  try {
    const res = await api.delete(`boards/${board_id}?project_id=${project_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改项目Board下的Group
export async function groupCreate(params) {
  try {
    const res = await api.post(`groups`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改项目Board下的Group
export async function groupUpdate(group_id, params) {
  try {
    const res = await api.put(`groups/${group_id}`,params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除项目Board下的Group
export async function groupDelete(group_id) {
  try {
    const res = await api.delete(`groups/${group_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//排序项目Board下的Group
// strapi - api / board / groupOrder
export async function groupOrder(project_id, board_id, params) {
  try {
    const res = await api.put(
      `projects/${project_id}/boards/${board_id}/order`,
      params
    );
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

//获取某个项目
export async function getOneProject(project_id) {
  try {
    const res = await api.get(`projects/${project_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//更新某个项目
export async function updateProject(project_id, params) {
  // let options = `?page=1&per_page=10`
  try {
    const res = await api.put(`projects/${project_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    if (error.response) {
      // 如果有错误的响应，表示服务器返回了错误的状态码
      Notify.create(error.response.data.error.message);
      console.log(error.response.data); // 打印出错误的数据
      console.log(error.response.status); // 打印出错误的状态码
      console.log(error.response.headers); // 打印出错误的头部
    } else if (error.request) {
      // 如果没有错误的响应，但有错误的请求，表示服务器没有返回任何响应
      console.log(error.request); // 打印出错误的请求
    } else {
      // 如果既没有错误的响应，也没有错误的请求，表示其他原因导致的错误
      console.log("Error", error.message); // 打印出错误的信息
    }
    Notify.create(error?.response?.data?.error?.message);
    return error; // 返回错误
  }
}
//删除某个项目
export async function deleteProject(project_id, option) {
  try {
    let res;
    if (option) {
      res = await api.delete(
        `projects/${project_id}${option && "?option=" + option}`
      );
    } else {
      res = await api.delete(`projects/${project_id}`);
    }
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// Overview - 对应为版本
// 新增时需要制定Overview要附加的对象是 project 还是 card
export async function addVersion(params) {
  try {
    const res = await api.post(`overviews`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改版本
export async function updateVersion(overview_id, params) {
  try {
    const res = await api.put(`overviews/${overview_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除版本
export async function deleteVersion(attach_to_id, overview_id, attach_to) {
  try {
    const res = await api.delete(
      `overviews/${overview_id}?attach_to_id=${attach_to_id}&attach_to=${attach_to}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

//获取项目中的kanban
export async function getOneKanban(kanban_id) {
  try {
    const res = await api.get(`/kanbans/${kanban_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改项目中的kanban
export async function kanbanCreate(params) {
  try {
    const res = await api.post(`kanbans`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改项目中的kanban
export async function kanbanUpdate(kanban_id, params) {
  try {
    const res = await api.put(`/kanbans/${kanban_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除项目中的kanban
export async function kanbanDelete(project_id, kanban_id) {
  try {
    const res = await api.delete(
      `/kanbans/${kanban_id}?project_id=${project_id}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

//分栏创建
export async function createColumn(parmars) {
  try {
    const res = await api.post(`/columns`, parmars);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//分栏修改 - 卡片排序:修改关联的crads字段
export async function updateColumn(column_id, params) {
  try {
    const res = await api.put(`/columns/${column_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//分栏删除
export async function deleteColumn(project_id, column_id, card_id) {
  try {
    let res;
    if (card_id) {
      res = await api.delete(
        `/columns/${column_id}?project_id=${project_id}${
          card_id && `?card_id=${card_id}`
        }`
      );
    } else {
      res = await api.delete(`/columns/${column_id}?project_id=${project_id}`);
    }
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

//在项目 - 看板 - 分栏中创建卡片
export async function createCard(parmars) {
  try {
    const res = await api.post(`/cards`, parmars);
    if (res) {
      return res;
    }
    if (res.error) {
      Notify.create(res.error.message);
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//在项目 - 看板 - 分栏中更新卡片
/**
 * 
 * @param {Number} card_id 
 * @param {Object} parmars 带data
 * @returns 
 */
export async function updateCard(card_id, parmars) {
  try {
    const res = await api.put(`/cards/${card_id}`, parmars);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create({
      color: 'red',
      message: $t('update_error_need_refresh'),
      actions: [{ label: $t('refresh'), handler: () => { window.location.reload(); } }],
    });
  }
}
//在项目 - 看板 - 分栏中删除卡片
export async function deleteCard(card_id, project_id, belong_card_id) {
  try {
    let res;
    if (belong_card_id) {
      res = await api.delete(
        `/cards/${card_id}?project_id=${project_id}${
          belong_card_id && `?belong_card_id=${belong_card_id}`
        }`
      );
    } else {
      res = await api.delete(`/cards/${card_id}?project_id=${project_id}`);
    }
    // console.log("removeCard", res);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//获取卡片详情
export async function findCard(card_id) {
  try {
    const res = await api.get(`/cards/${card_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function findShareCardStorage(card_id,storage_id, code, by) {
  try {
    const res = await api.get(`/cards/${card_id}/share/${storage_id}?share_code=${code}&share_by=${by}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function findCardFeedback(card_id) {
  try {
    const res = await api.get(`/cards/${card_id}?feedback=true`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function findCardByShare(card_id, code, by) {
  try {
    const res = await api.get(
      `cards/${card_id}?share_code=${code}&share_by=${by}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    // Notify.create(error?.response?.data?.error?.message);
    // uiStore.message = error?.response?.data?.error?.message;
    return error;
  }
}
export async function findCardFeedbackByShare(card_id, code, by) {
  try {
    const res = await api.get(
      `cards/${card_id}?share_code=${code}&share_by=${by}&feedback=true`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    uiStore.message = error?.response?.data?.error?.message;
    return error;
  }
}
export async function updateCardRole(card_id, parmars) {
  try {
    const res = await api.put(`/cards/${card_id}`, parmars);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error);
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 获取文档
export async function getDocument(document_id) {
  try {
    const res = await api.get(`/documents/${document_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 更新文档
export async function updateDocument(document_id, params) {
  try {
    const res = await api.put(`/documents/${document_id}`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//创建文档
export async function createDocument(params) {
  try {
    const res = await api.post(`/documents`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除文档
export async function deleteDocument(document_id) {
  try {
    const res = await api.delete(`/documents/${document_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 待办代码：
// attach_to ： -1 --- 用户自己
// attach_to ： -2 --- 项目
// attach_to ： -3 --- Card
//创建待办分组
export async function createTodogroup(params) {
  try {
    const res = await api.post(`/todogroups`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改待办分组
export async function updateTodogroup(todogroup_id, params) {
  try {
    const res = await api.put(`/todogroups/${todogroup_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create({
      color: 'red',
      message: $t('update_error_need_refresh'),
      actions: [{ label: $t('refresh'), handler: () => { window.location.reload(); } }],
    });
  }
}
//删除待办分组
export async function deleteTodogroup(todogroup_id) {
  try {
    const res = await api.delete(`/todogroups/${todogroup_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

//创建待办
export async function createTodo(params) {
  try {
    const res = await api.post(`/todos`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//修改待办
export async function updateTodo(todo_id, params) {
  // console.log(todo_id, params);
  
  try {
    const res = await api.put(`/todos/${todo_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
//删除待办
export async function deleteTodo(todo_id,props) {
  try {
    let res;
    if(props?.card_id){
      res = await api.delete(`/todos/${todo_id}?card_id=${props?.card_id}`);
    } else if(props?.project_id){
      res = await api.delete(`/todos/${todo_id}?project_id=${props?.project_id}`);
    } else if(props?.fingerprint){
      res = await api.delete(`/todos/${todo_id}?fingerprint=${props?.fingerprint}`);
    } else {
      res = await api.delete(`/todos/${todo_id}`);
    }

    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 获取storage
export async function findOneStorage(storage_id) {
  try {
    const res = await api.get(`/storages/${storage_id}`);
    if (res) {
      let storage = res.data;
      await db.storages.put(storage);
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 新建storage - folder
export async function createStorage(params) {
  try {
    const res = await api.post(`/storages`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 更新storage
export async function updateStorage(storage_id, params) {
  try {
    const res = await api.put(`/storages/${storage_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 删除storage
export async function deleteStorage(storage_id) {
  try {
    const res = await api.delete(`/storages/${storage_id}`);
    if (res.status === 200) {
      // 如果状态码是200，表示删除成功
      return res.data; // 返回响应的数据
    } else {
      // 如果状态码不是200，表示删除失败
      console.error(`Delete failed with status code ${res.status}`); // 抛出一个错误
    }
  } catch (error) {
    if (error.response) {
      // 如果有错误的响应，表示服务器返回了错误的状态码
      console.log(error.response); // 打印出错误的数据
    } else if (error.request) {
      // 如果没有错误的响应，但有错误的请求，表示服务器没有返回任何响应
      console.log(error.request); // 打印出错误的请求
    } else {
      // 如果既没有错误的响应，也没有错误的请求，表示其他原因导致的错误
      console.log("Error", error.message); // 打印出错误的信息
    }
    Notify.create(error?.response?.data?.error?.message);
    return error; // 返回错误
  }
}

// 新建storage-file - file
export async function createStorageFile(params) {
  try {
    const res = await api.post(`/storage-files`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function deleteStorageFile(id) {
  try {
    const res = await api.delete(`/storage-files/${id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 批量新建 - 拖拽多个文件、文件夹时使用此接口
export async function createStorageFile_batch(params) {
  try {
    const res = await api.post(`/storage-files/batchCreate`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
// 规划

export async function getScheduleByID(id) {
  try {
    const res = await api.get(`schedules/${id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function getScheduleByShare(id, code, by) {
  try {
    const res = await api.get(
      `schedules/${id}?share_code=${code}&share_by=${by}`
    );
    if (res) {
      return res;
    }
  } catch (error) {
    // Notify.create(error?.response?.data?.error?.message);
    // uiStore.message = error?.response?.data?.error?.message;
    return error;
  }
}
export async function createSchedule(params) {
  try {
    const res = await api.post(`schedules`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function updateSchedule(schedule_id, params) {
  try {
    const res = await api.put(`schedules/${schedule_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function deleteSchedule(schedule_id) {
  try {
    const res = await api.delete(`schedules/${schedule_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 新建规划事件
export async function createScheduleEvent(params) {
  try {
    const res = await api.post(`schedule-events`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function updateScheduleEvent(event_id, params) {
  try {
    const res = await api.put(`schedule-events/${event_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function deleteScheduleEvent(event_id) {
  try {
    const res = await api.delete(`schedule-events/${event_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

// 角色权限

export async function createMemberRole(params) {
  try {
    const res = await api.post(`member-roles`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function updateMemberRole(role_id, params) {
  try {
    const res = await api.put(`member-roles/${role_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}
export async function deleteMemberRole(role_id) {
  try {
    const res = await api.delete(`member-roles/${role_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function findProjectBudgets(_project_id) {
  try {
    const res = await api.get(`projects/${_project_id}/budget`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function deleteProjectBudget(_project_id, budget_id ) {
  try {
    const res = await api.delete(`projects/${_project_id}/budget/${budget_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function addProjectLedger(_project_id, params) {
  try {
    const res = await api.post(`projects/${_project_id}/ledger`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function removeProjectLedger(_project_id, _ledger_id) {
  try {
    const res = await api.delete(`projects/${_project_id}/ledger/${_ledger_id}`);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function updateProjectLedger(_project_id, _ledger_id, params) {
  try {
    const res = await api.put(`projects/${_project_id}/ledger/${_ledger_id}`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}

export async function attachProjectBudget(_project_id, params) {
  try {
    const res = await api.post(`projects/${_project_id}/attach_budget`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create(error?.response?.data?.error?.message);
    return error;
  }
}


// 会议


export async function startMeet(project_id) {
  try {
    const res = await api.post(`projects/${project_id}/start_meet`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function endMeet(project_id) {
  try {
    const res = await api.post(`projects/${project_id}/end_meet`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
/**
 * 
 * @param {Object} params { project_id: Number}
 * @returns 
 */
export async function projectMeetAuth(params) {
  try {
    const res = await api.post(`jitsi/project_meet_auth`, params);
    return res;
  } catch (error) {
    return error;
  }
}

// 付费内容


/** 
    要求前端提供数据格式：
    {
        subject: 'card', //购买的商品类型，
        data: {
            check_ids: [***] // 需要检查的商品id的数组
        }
    }
*/
export async function checkCardsPayStates(params) {
  try {
    const res = await api.post(`/cards/check_paied`, params);
    return res;
  } catch (error) {
    return error;
  }
}

export async function findOrders(offset,limit) {
  try {
    const res = await api.get(`/orders?offset=${offset}&limit=${limit}`);
    return res;
  } catch (error) {
    return error;
  }
}
export async function findSales(offset,limit) {
  try {
    const res = await api.get(`/sales?offset=${offset}&limit=${limit}`);
    return res;
  } catch (error) {
    return error;
  }
}