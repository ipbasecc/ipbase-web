import { boot } from "quasar/wrappers";
// import calc_auth from 'src/hooks/project/useCalcPermission.js'; // 项目管理时调用此处
// 此处方法将逐步废弃，之后启用auth.js中的方法
import calc_auth from "src/pages/team/hooks/useCalcPermission.js";
export default boot(({ app }) => {
  app.mixin({
    methods: {
      calc_auth,
    },
  });
});
