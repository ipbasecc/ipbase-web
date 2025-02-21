import { boot } from "quasar/wrappers";
import { Platform } from "quasar";

export function $pathService(_path) {
  const appURI = import.meta.env.VITE_APP_URI;
  let res;
  if (Platform.is.electron) {
    res = window.pathAPI.pathService(_path);
  } else {
    res = appURI + _path;
  }
  console.log('$pathService', res)
  return res;
}

export function $public() {
  return process.env.APP_URL;
}

export default boot(({ app }) => {
  app.mixin({
    methods: {
      $pathService,
      $public,
      /**
       * 
       * @param {String} url 
       * @param {Object} size //[width, height]
       * @returns url + resize_param
       */
      $resize(url, size) {
        return `${url}?x-oss-process=image/auto-orient,1/resize,m_fill,w_${size[0]},h_${size[1]}/quality,q_90`;
      },
    },
  });
});