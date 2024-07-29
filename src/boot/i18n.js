import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { Lang } from 'quasar'

const locale = Lang.getLocale();
// console.log('locale', locale);
const i18n = createI18n({
  locale: locale,
  globalInjection: true,
  messages
})
export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

export { i18n };