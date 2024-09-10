import {boot} from "quasar/wrappers";
import {Platform} from "quasar";

export function $pathService(_path) {
  const appURI = process.env.APP_URI;
  let res;
  if (Platform.is.electron) {
    res = window.pathAPI.pathService(_path);
  } else {
    res = appURI + _path;
  }
  console.log('$pathService', res)
  return res;
}

export default boot(({ app }) => {
  app.mixin({
    methods: {
      $pathService,
    },
  });
});
