import { getUser } from "src/api/mattermost.js";
import localforage from "localforage";
import { mmstore } from "src/hooks/global/useStore.js";

// 页面中有大量相同请求，这里对相同请求进行处理
// 创建一个请求锁对象
const requestLocks = {};

export async function useFetch_mmMember(user_id, option = "default") {
  // 检查是否已经有请求在执行
  if (requestLocks[user_id]) {
    // 如果有请求在执行，则等待该请求完成
    return requestLocks[user_id];
  }

  // 设置请求锁
  requestLocks[user_id] = new Promise(async (resolve, reject) => {
    try {
      const _memCache = mmstore.members?.find((i) => i.id === user_id);
      if (_memCache && option !== "force") {
        // 如果缓存存在，直接返回缓存数据
        resolve(_memCache);
        return;
      }

      let __mm_user_key = `__mm_user__${user_id}`;

      const fetch = async () => {
        let res = await getUser(user_id);
        if (res) {
          mmstore.$updateMember(res.data);
          await localforage.setItem(__mm_user_key, res.data);
          resolve(res.data);
        } else {
          reject(new Error("Failed to fetch data"));
        }
      };

      if (option === "force") {
        await fetch();
      } else {
        let user = await localforage.getItem(__mm_user_key);
        if (user) {
          mmstore.$updateMember(user);
          resolve(user);
        } else {
          await fetch();
        }
      }
    } catch (error) {
      reject(error);
    } finally {
      // 请求完成后，移除请求锁
      delete requestLocks[user_id];
    }
  });

  // 返回请求锁的 Promise
  return requestLocks[user_id];
}
