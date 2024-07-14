import { boot } from 'quasar/wrappers'
import hevueImgPreview from 'hevue-img-preview'
import 'hevue-img-preview/css/theme-dark.css'

export default boot(({ app }) => {
  app.use(hevueImgPreview)
})
