import { boot } from "quasar/wrappers";
import useAuths from "src/pages/team/hooks/useAuths.js";
export default boot(({ app }) => {
  app.mixin({
    methods: {
      useAuths
    },
  });
});
