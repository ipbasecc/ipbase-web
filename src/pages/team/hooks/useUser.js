import localforage from "localforage";
import { DONT_CLEAN } from "src/config";

/**
 * 
 * @param {String} val 为了调试方便知道什么地方调用了登出操作，无业务用途
 */
export async function clearLocalDB(val)  {
  console.log('clearLocalDB', val)
  // return
  const promises = DONT_CLEAN.map(async (key) => {
    try {
      const value = await localforage.getItem(key);
      if (value !== null) {
        return { key, value };
      }
    } catch (err) {
      console.error(`Error getting value for key ${key}:`, err);
    }
  });

  // 等待所有 Promise 完成后再执行清空操作
  const valuesToRestore = await Promise.allSettled(promises);
  // console.log(`valuesToRestore`, valuesToRestore);
  const fulfilleds = valuesToRestore.filter(i => i.status === "fulfilled" && i.value)?.map((j) => j.value);

  // 清空 localForage 数据
  await localforage.clear();
  if(fulfilleds?.length > 0){
    // 将之前取出的值重新存回 localForage
    for (const { key, value } of fulfilleds) {
      try {
        await localforage.setItem(key, value);
        // console.log(`Restored value for key ${key}:`, value);
      } catch (err) {
        console.error(`Error restoring value for key ${key}:`, err);
      }
    }
  }

  sessionStorage.clear();
  localStorage.clear();
}
