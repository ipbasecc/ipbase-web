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

// //登陆
// {
//   identifier: 'user@strapi.io',
//   password: 'strapiPassword',
// }
export async function login(params) {
  try {
    const res = await api.post(`auth/local`, params);
    if (res) {
      if (res?.data) {
        localStorage.setItem("jwt", JSON.stringify(res.data.jwt));
      }
      return res;
    }
  } catch (error) {
    return error;
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
      return res;
    }
  } catch (error) {
    return error;
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
    })    
    return error;
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
export async function notiy() {
    // 假设这是您的原始链接
  const urlString = "https://backend.yihu.team/api/order/order_notify?ifCode=wxpay&amount=50&payOrderId=P1854496067150348289&extParam=%7B%22order_id%22:51%7D&mchOrderNo=4d3331333031373330393831323931383831&subject=id%E4%B8%BA7%E7%9A%84card&wayCode=WX_NATIVE&sign=626F1C8789B1BB5CCDA4120BBE31DFD9&channelOrderNo=4200002526202411073394094568&reqTime=1730981306973&body=%E5%95%86%E5%93%81id%E4%B8%BA7%E7%9A%84card%E7%9A%84%E8%AE%A2%E5%8D%95&createdAt=1730981291936&appId=6729b2e6f6d8ea09bd5e5fcf&clientIp=127.0.0.1&successTime=1730981307000&currency=cny&state=2&mchNo=M1730785808";

  // 创建一个新的URL对象
  const url = new URL(urlString);

  // 使用URLSearchParams来解析查询字符串
  const searchParams = new URLSearchParams(url.search);

  // 将查询字符串参数转换为对象
  const params = Object.fromEntries(searchParams);

  // 打印结果，以便查看
  console.log(params);

  try {
    const res = await api.post(`order/order_notify`, params);
    if (res?.data) {
      return res;
    }
  } catch (error) {
    return error;
  }
}