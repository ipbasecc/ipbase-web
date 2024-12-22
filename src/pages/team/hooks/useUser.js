import localforage from "localforage";
import { DONT_CLEAN } from "src/config";
import { Platform } from 'quasar'

/**
 * 
 * @param {String} val 为了调试方便知道什么地方调用了登出操作，无业务用途；
 * @discription 清理electron的缓存、localForage、sessionStorage、localStorage
 */
export async function clearLocalDB(val)  {
  console.log('clearLocalDB', val)
  
  // 1.先判断是否是electron环境，如果是，先清理electron的缓存
  if(Platform.is.electron){
    window.windowAPI?.logout();
  }
  // 2. 再将要保留的localForage数据临时保存
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
  const valuesToRestore = await Promise.allSettled(promises);
  const fulfilleds = valuesToRestore.filter(i => i.status === "fulfilled" && i.value)?.map((j) => j.value);

  // 3. 清空 localForage 数据
  await localforage.clear();
  // 4. 还原 localForage 数据
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

  // 5. 清空 sessionStorage 和 localStorage
  sessionStorage.clear();
  localStorage.clear();

  return true;
}

export const clacAvatar = (user) => {
  console.log('clacAvatar', user)
  return user.wechat_profile?.avatar || user.profile?.avatar?.url
}