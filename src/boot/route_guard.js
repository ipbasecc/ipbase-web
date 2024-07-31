import { boot } from "quasar/wrappers";
import { mm_wsStore, uiStore, workStore } from "src/hooks/global/useStore.js";
import { clearLocalDB } from "src/pages/team/hooks/useUser.js";

export default boot(({ router, store }) => {
  router.beforeEach(async (to, from, next) => {

    // 记录路由切换的时间戳
    const currentTime = Date.now();

    // 如果之前没有记录时间戳，或者距离上次切换超过1秒
    if (!router.lastRouteChangeTime || currentTime - router.lastRouteChangeTime > 1000) {
      router.routeChangeCount = 1; // 初始化路由切换次数
    } else {
      router.routeChangeCount++; // 增加路由切换次数
    }

    // 更新上次切换的时间戳
    router.lastRouteChangeTime = currentTime;

    // 判断路由切换频率是否超过10次
    if (router.routeChangeCount > 10) {
      await clearLocalDB("route_guard");
      next({ path: "/login" });
    }

    // pageLoaded();
    const jwt = localStorage.getItem("jwt");
    const mm_token = localStorage.getItem("mmtoken");

    // 生成客户端ID，用来在ws事件时判断是否是当前用户操作的ws内容
    // 如果是，当前用户的对应操作已经执行了，就不必执行ws的数据更新事件了
    mm_wsStore.clientId =
      "id-" +
      Math.random().toString(36).substr(2, 16) +
      "-" +
      Date.now().toString(36);
    // 判断当前路由是否需要登录
    if (to.meta.requireAuth) {
      // 判断用户是否登录
      if (jwt && mm_token) {
        // 已登录，正常访问
        next();
      } else {
        await clearLocalDB("route_guard");
        next({ path: "/login" });
      }
    } else {
      // 不需要登录，直接访问
      next();
    }

    // 控制是否显示作品的创作者信息
    if (!to.meta.showMaker) {
      workStore.creator = null;
    }
  });
  router.afterEach(() => {
    uiStore.$pageloaded();
  });
});
