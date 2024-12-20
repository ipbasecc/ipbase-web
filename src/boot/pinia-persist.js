import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default ({ store }) => {
  store.use(piniaPluginPersistedstate)
}