import oss from "src/common/oss.js";
import { boot } from 'quasar/wrappers'

const OSS = new oss()

export default boot(({ app }) => {
  // 将smartEngin挂载到全局变量中，后续代码即可通过this.$smartEngin的形式直接调用
  app.config.globalProperties.$OSS = OSS
})

export { OSS }
