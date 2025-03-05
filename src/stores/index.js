import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import localforage from 'localforage'
import { createStatePersistence } from 'pinia-plugin-state-persistence'

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

const persist = createStatePersistence({
  key: '', // Acts as a prefix for all store keys when persisting data
  debug: false, // Debugging disabled
  overwrite: true, // Do not overwrite existing state
  storage: {
    getItem: async (key) => {
      return await localforage.getItem(key) // Use localforage to get the item
    },
    setItem: async (key, value) => {
      return await localforage.setItem(key, value) // Use localforage to set the item
    },
    removeItem: async (key) => {
      return await localforage.removeItem(key) // Use localforage to remove the item
    },
  },
  serialize: JSON.stringify, // Default serialization
  deserialize: JSON.parse, // Default deserialization
  deepCopy: false, // Default deepCopy
})
pinia.use(
  persist
)


export default store(() => {
  return pinia
})
