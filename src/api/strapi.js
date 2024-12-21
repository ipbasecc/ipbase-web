import {api} from "boot/axios";
import localforage from "localforage";
import {Notify} from "quasar";
import {i18n} from 'src/boot/i18n.js';

const $t = i18n.global.t;
export async function server(_url) {
  try {
    const res = await api.get(_url);
    if (res?.data?.data?.attributes) {
      await localforage.setItem('serverInfo', res.data?.data?.attributes);
      return res?.data?.data?.attributes;
    }
  } catch (error) {
    return error;
  }
}

export const storeUserData = async (res) => {
  localStorage.setItem("jwt", JSON.stringify(res.data?.jwt));
  localStorage.setItem("mmUserId", res.data?.user?.mm_profile?.id);

  if(res.data?.mm_token){
    console.log('has mm_token', res.data?.mm_token);
    localStorage.setItem("mmtoken", res.data?.mm_token);
    await localforage.setItem("__mm_token", res.data?.mm_token);
  }
  if(res.data?.user?.mm_profile){
    await localforage.setItem("mm_profile", res.data?.user?.mm_profile);
  }
}
// //登陆
// {
//   identifier: 'user@strapi.io',
//   password: 'strapiPassword',
// }
export async function login(params) {
  try {
    const res = await api.post(`auth/local`, params);
    if (res?.data) {
      await storeUserData(res);
      return res;
    }
  } catch (error) {
    if (error.response?.data?.error?.message === 'Invalid identifier or password') {
      Notify.create({
        message: $t('invalid_identifier_or_password'),
        color: 'negative',
        icon: 'mdi-alert-circle',
        position: 'top'
      });
    }
    throw error;
  }
}

export async function refreshToken() {
  try {
    const res = await api.get(`users-permissions/user/me/refreshToken`);
    if (res) {
      if (res?.data) {
        console.log('refreshToken', res)
      }
      return res;
    }
  } catch (error) {
    return error;
  }
}

 

// {
//   username: 'Strapi user',
//   email: 'user@strapi.io',
//   password: 'strapiPassword',
// }
export async function register(params) {
  try {
    const res = await api.post(`auth/local/register`, params);
    if (res) {
      localStorage.setItem("jwt", JSON.stringify(res.data?.jwt));
      localStorage.setItem("mmUserId", res.data?.user?.mm_profile?.id);

      if(res.data?.mm_token){
        console.log('has mm_token', res.data?.mm_token);
        localStorage.setItem("mmtoken", res.data?.mm_token);
        await localforage.setItem("__mm_token", res.data?.mm_token);
      }
      if(res.data?.user?.mm_profile?.token){
        console.log('has mm_profile.token', res.data?.user?.mm_profile?.token);
        localStorage.setItem("mmtoken", res.data?.user?.mm_profile?.token);
        await localforage.setItem("__mm_token", res.data?.user?.mm_profile?.token);
      }
      if(res.data?.user?.mm_profile){
        await localforage.setItem("mm_profile", res.data?.user?.mm_profile);
      }
      return res;
    }
  } catch (error) {
    throw error;
  }
}
//获取用户
export async function getUser(uid) {
  try {
    const res = await api.get(`users/${uid}`);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//更新当前用户个人待办
export async function updateUserTodogroups(params) {
  try {
    const res = await api.put(`users-permissions/user/me/todogroups`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    Notify.create({
      color: 'red',
      message: $t('updateUserTodogroups_error_feedback'),
      actions: [{ label: $t('refresh'), handler: () => { window.location.reload(); } }],
    });
    throw error;
  }
}
//更新用户头像
export async function updateUserAvatar(params) {
  try {
    const res = await api.post(`users-permissions/user/me/avatar`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//忘记密码
// params: {
//   email: 'user@strapi.io', // user's email
// }
export async function forgotPassword(params) {
  try {
    const res = await api.post(`auth/forgot-password`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//重设密码
// {
//   code: 'privateCode', // code contained in the reset link of step 3.
//   password: 'userNewPassword',
//   passwordConfirmation: 'userNewPassword',
// }
export async function resetPassword(params) {
  try {
    const res = await api.post(`auth/reset-password`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function changePassword(params) {
  try {
    const res = await api.post(`auth/change-password`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//发送验证邮件
export async function sendEmailConfirmation(email) {
  try {
    const res = await api.post(`auth/send-email-confirmation`, {
      email: email, // user's email
    });
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//修改用户配置
export async function modifyConfig(params) {
  try {
    const res = await api.post(`users-permissions/user/me/config`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}


//修改用户配置
export async function updateFollowed(params) {
  try {
    const res = await api.post(`users-permissions/user/me/updateFollowed`, params);
    if (res) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

//更新用户数据
export async function updateUser(user_id,params) {
  try {
    const res = await api.put(`users/${user_id}`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
//获取用户私有待办分组关联的看板的关联信息
export async function findKanbanByTodogroupID(kanban_id) {
  try {
    const res = await api.get(`users-permissions/user/me/kanban/${kanban_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 获取转码媒体
export async function queryMedias(params) {
  try {
    const res = await api.post(`/queryMedias`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 添加媒体以供转码
export async function addMedia(params) {
  try {
    const res = await api.post(`/addMedia`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 发送添加好友请求
export async function addFriend(params) {
  try {
    const res = await api.post(`/friend-requests`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    Notify.create({
      color: 'red',
      message: error.response.data.error.message
    });
    throw error;
  }
}
// 处理好友请求 不带 data
export async function processFriendReq(params) {
  try {
    const res = await api.post(`/contacts/process_request`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 编辑好友 不带 data
export async function processFriend(params) {
  try {
    const res = await api.post(`/contacts/process_friend`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
// 检查是否被屏蔽
export async function checkBlocked(params) {
  try {
    const res = await api.post(`contacts/check_blocked`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 支付相关
/**
 * https://docs.jeequan.com/docs/jeepay/payment_api
 * @param {*} params 文档 - 统一下单数据结构
 * @returns 
 */
export async function createOrder(params) {
  try {
    const res = await api.post(`/order/create_order`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
/**
 * https://docs.jeequan.com/docs/jeepay/payment_api
 * @param {*} params 文档 - 统一下单数据结构
 * @returns 
 */
export async function createTransferOrder(params) {
  try {
    const res = await api.post(`/order/withdraw`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    throw error;
  }
}


export async function findOrders() {
  try {
    const res = await api.get(`/orders`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function tax(params) {
  try {
    const res = await api.post(`/order/tax`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 招投标部分

export async function findDeals(params) {
  console.log('findDeals', params);
  try {
    const res = await api.get(`/deals`, { params: params });
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function findCompletedDeals(params) {
  console.log('findCompletedDeals', params);
  try {
    const res = await api.get(`/completed_deals`, { params: params });
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function findDeal(deal_id) {
  try {
    const res = await api.get(`/deals/${deal_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function createDeal(params) {
  let res = null
  try {
    res = await api.post(`/deals`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  } finally {
    return res
  }
}
export async function updateDeal(deal_id, params) {
  try {
    const res = await api.put(`/deals/${deal_id}`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function deleteDeal(deal_id) {
  try {
    const res = await api.delete(`/deals/${deal_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 账号认证
export async function findCertifications(params) {
  try {
    const res = await api.get(`/certifications`, { params: params });
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function findTalkers(params) {
  try {
    const res = await api.get(`/talkers`, { params: params });
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function createCertificate(params) {
  try {
    const res = await api.post(`/certifications`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function updateCertificate(certificate_id, params) {
  try {
    const res = await api.put(`/certifications/${certificate_id}`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function findSelfCertification(user_id) {
  try {
    const res = await api.get(`/certifications/${user_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function deleteSelfCertification(user_id) {
  try {
    const res = await api.delete(`/certifications/${user_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}

// 作品
export async function findWorks(params) {
  try {
    const res = await api.get(`/works`, { params: params });
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function findWork(work_id) {
  try {
    const res = await api.get(`/works/${work_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function addWork(params) {
  try {
    const res = await api.post(`/works`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function deleteWork(work_id) {
  try {
    const res = await api.delete(`/works/${work_id}`);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}
export async function updateWork(work_id, params) {
  try {
    const res = await api.put(`/works/${work_id}`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}