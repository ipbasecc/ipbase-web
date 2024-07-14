import { boot } from "quasar/wrappers";
// import calc_auth from 'src/hooks/project/useCalcPermission.js'; // 项目管理时调用此处
import useAuth from "src/pages/team/hooks/useAuth.js";
import useAuths from "src/pages/team/hooks/useAuths.js";
export default boot(({ app }) => {
  app.mixin({
    methods: {
      useAuth,
      useAuths
    },
  });
});
