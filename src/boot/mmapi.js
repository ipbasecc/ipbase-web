// 初始化mattermost

import { boot } from "quasar/wrappers";
import axios from "axios";
import { $server } from 'src/boot/server.js'
import {uiStore} from "src/hooks/global/useStore";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

let mmapi
const setAPI = async () => {
  let MM_API
  const { ws_api_endpoint } = await $server();
  // console.log('ws_api_endpoint', ws_api_endpoint)
  if(ws_api_endpoint && ws_api_endpoint !== "") {
    MM_API = ws_api_endpoint
  } else {
    MM_API = import.meta.env.VITE_MM_API || 'https://mattermost.yihu.team/api/v4/'
  }
  if(MM_API){
    mmapi = axios.create({
      baseURL: MM_API,
    });
  }
}

export default boot(async ({ app }) => {
  await setAPI();
  // for use inside Vue files (Options API) through this.$axios and this.$api
  mmapi.interceptors.request.use((config) => {
    const token = localStorage.getItem("mmtoken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  });

  // 添加响应拦截器
  mmapi.interceptors.response.use(
    (response) => {
      // 如果响应返回的状态码为200，说明token鉴权成功，直接返回响应数据
      // 将拿到的结果发布给其他相同的接口
      uiStore.axiosStauts = 'complete';
      return response;
    },
    (error) => {
      console.log('error', error)
      uiStore.axiosError = error;
    }
  );

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = mmapi;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { mmapi };
