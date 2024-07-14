import { boot } from "quasar/wrappers";
import Dexie from "dexie";
// IndexedDB 配置
const db = new Dexie("ipbase");

export default boot(({ app }) => {
  db.version(1).stores({
    matedata: "&id",
    projects: "&id",
    channels: "&id",
    kanbans: "&id",
    storages: "&id",
    documents: "&id",
  });
  app.config.globalProperties.$db = db;
});

export { db };
