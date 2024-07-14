import { findOneStorage } from "src/api/strapi/project.js";

export async function useFetchStorage(storage_id) {
  const fetch = async () => {
    // console.log('then fetch');
    let res = await findOneStorage(storage_id);
    if (res) {
      return res.data;
    }
  };
  return await fetch();

  // let cache = await db.storages.get(Number(storage_id));
  // if (cache) {
  //     console.log('get cache first');
  //     const cachedData = await cache; // 等待缓存数据
  //     fetch(); // 开始远程获取最新数据
  //     return cachedData; // 先返回缓存数据
  // } else {
  //     const remoteData = await fetch(); // 如果没有缓存，则执行远程获取
  //     return remoteData; // 返回最新数据
  // }
}
