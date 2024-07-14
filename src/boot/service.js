import { boot } from "quasar/wrappers";
import { ref } from "vue";
import { date } from "quasar";
import { Platform } from "quasar";

export function $pathService(_path) {
  const appURI = process.env.APP_URI;
  let res;
  if (Platform.is.electron) {
    res = window.pathAPI.pathService(_path);
  } else {
    res = appURI + _path;
  }
  // console.log('$pathService', res)
  return res;
}

let timer = null;
const curTime = ref();
export function $time(_formate) {
  timer = setInterval(() => {
    curTime.value = date.formatDate(Date.now(), _formate);
  }, 1000);
  return curTime.value;
}
export default boot(({ app }) => {
  app.mixin({
    methods: {
      $pathService,
      $time,
    },
  });
});
