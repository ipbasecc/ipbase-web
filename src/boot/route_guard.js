import { boot } from "quasar/wrappers";
import { mm_wsStore, uiStore, workStore } from "src/hooks/global/useStore.js";
import { clearLocalDB } from "src/pages/team/hooks/useUser.js";
import { computed } from "vue";

// pageLoaded();
const authed = computed(() => localStorage.getItem("jwt") && localStorage.getItem("mmtoken"));
export default boot(({ router, store }) => {
  router.beforeEach(async (to, from, next) => {

    // 防止因为bug导致页面循环切换，如果1秒内路由切换超过30次，则删除登陆信息并跳转到登录页
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
    // 判断路由切换频率是否超过30次
    if (router.routeChangeCount > 30) {
      await clearLocalDB("route_guard routeChangeCount" > 30);
      next({ path: "/login" });
    }

    // 判断当前路由是否需要登录
    if (to.meta.requireAuth) {
      // 判断用户是否登录
      if (authed.value) {
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
