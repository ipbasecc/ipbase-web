import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import localforage from 'localforage'

// 当前持久化插件支持异步，因此使用 pinia-plugin-persistedstate-2
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

// Configure localforage
localforage.config({
  name: 'IPBase', // Your app name
  storeName: 'cache_store', // Store name
  description: 'IPBase cache store'
})
// Create a new instance of Pinia
const pinia = createPinia()


// 配置持久化插件
pinia.use(createPersistedStatePlugin({
  // 全局存储配置
  storage: {
    getItem: async (key) => {
      return await localforage.getItem(key) // Use localforage to get the item
    },
    setItem: async (key, value) => {
      return await localforage.setItem(key, value) // Use localforage to set the item
    },
    removeItem: async (key) => {
      return await localforage.removeItem(key) // Use localforage to remove the item
    }
  }
}))

export default store(() => {
  return pinia
})
