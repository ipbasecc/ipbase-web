import { api } from "boot/axios";
import localforage from "localforage";
import {Notify} from "quasar";

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
      message: '更新分组数据时发生错误，请刷新页面',
      actions: [{ label: '刷新', handler: () => { window.location.reload(); } }],
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
export async function forgotPassword(email) {
  try {
    const res = await api.post(`auth/forgot-password`, {
      email: email, // user's email
    });
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
