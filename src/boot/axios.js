import { boot } from "quasar/wrappers";
import axios from "axios";
import { uiStore } from "src/hooks/global/useStore";
import { $server } from 'src/boot/server.js'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

let api
const setAPI = async () => {
  let REST_API
  const { http_api_endpoint } = await $server();
  // console.log('http_api_endpoint', http_api_endpoint)
  if(http_api_endpoint && http_api_endpoint !== "") {
    REST_API = http_api_endpoint
  } else {
    REST_API =process.env.REST_API || 'https://api.yihu.team/api'
  }
  if(REST_API){
    api = axios.create({
      baseURL: REST_API,
    });
  }
}

export default boot(async ({ app }) => {
  await setAPI();
  // 发布订阅
  class EventEmitter {
    constructor() {
      this.event = {};
    }
    on(type, cbres, cbrej) {
      if (!this.event[type]) {
        this.event[type] = [[cbres, cbrej]];
      } else {
        this.event[type].push([cbres, cbrej]);
      }
    }

    emit(type, res, ansType) {
      if (this.event[type]) {
        this.event[type].forEach((cbArr) => {
          if (ansType === "resolve") {
            cbArr[0](res);
          } else {
            cbArr[1](res);
          }
        });
      }
    }
  }
  // 根据请求生成对应的key
  function generateReqKey(config, hash) {
    const { method, url, params, data } = config;
    return [
      method,
      url,
      JSON.stringify(params),
      JSON.stringify(data),
      hash,
    ].join("&");
  }

  // 存储已发送但未响应的请求
  const pendingRequest = new Set();
  // 发布订阅容器
  const ev = new EventEmitter();

  // 接口响应成功
  function handleSuccessResponse_limit(response) {
    const reqKey = response.config.pendKey;
    if (pendingRequest.has(reqKey)) {
      let x;
      try {
        x = JSON.parse(JSON.stringify(response));
      } catch (e) {
        x = response;
      }
      pendingRequest.delete(reqKey);
      ev.emit(reqKey, x, "resolve");
      delete ev.reqKey;
    }
  }
  // 接口走失败响应
  function handleErrorResponse_limit(error) {
    if (error.type && error.type === "limiteResSuccess") {
      return Promise.resolve(error.val);
    } else if (error.type && error.type === "limiteResError") {
      return Promise.reject(error.val);
    } else {
      const reqKey = error.config.pendKey;
      if (pendingRequest.has(reqKey)) {
        let x;
        try {
          x = JSON.parse(JSON.stringify(error));
        } catch (e) {
          x = error;
        }
        pendingRequest.delete(reqKey);
        ev.emit(reqKey, x, "reject");
        delete ev.reqKey;
      }
    }
    return Promise.reject(error);
  }
  function isFileUploadApi(config) {
    return Object.prototype.toString.call(config.data) === "[object FormData]";
  }
  // for use inside Vue files (Options API) through this.$axios and this.$api
  api.interceptors.request.use(
    async (config) => {
      uiStore.axiosStauts = 'pending';
      config.headers['X-Fingerprint'] = window.fingerprint;
      const token = JSON.parse(localStorage.getItem("jwt"));
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      let hash = location.hash;
      // 生成请求Key
      let reqKey = generateReqKey(config, hash);

      if (!isFileUploadApi(config) && pendingRequest.has(reqKey)) {
        // 如果是相同请求,在这里将请求挂起，通过发布订阅来为该请求返回结果
        // 这里需注意，拿到结果后，无论成功与否，都需要return Promise.reject()来中断这次请求，否则请求会正常发送至服务器
        let res = null;
        try {
          // 接口成功响应
          res = await new Promise((resolve, reject) => {
            ev.on(reqKey, resolve, reject);
          });
          return Promise.reject({
            type: "limiteResSuccess",
            val: res,
          });
        } catch (limitFunErr) {
          // 接口报错
          return Promise.reject({
            type: "limiteResError",
            val: limitFunErr,
          });
        }
      } else {
        // 将请求的key保存在config
        config.pendKey = reqKey;
        pendingRequest.add(reqKey);
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  api.interceptors.response.use(
    (response) => {
      // 如果响应返回的状态码为200，说明token鉴权成功，直接返回响应数据
      // 将拿到的结果发布给其他相同的接口
      uiStore.axiosStauts = 'complete';
      handleSuccessResponse_limit(response);
      // console.log('response', response)
      return response;
    },
    (error) => {
      if (error.response) {
        uiStore.axiosStauts = 'error';
        uiStore.axiosError = error;
      }
      if (error.code === 'ERR_NETWORK') {
        uiStore.serverResfused = true;
      }
      // 如果是其他错误，继续抛出
      return handleErrorResponse_limit(error);
    }
  );

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
