import { Notify } from 'quasar';

// 创建一个提示函数
function showUpdateNotification() {
  Notify.create({
      message: '检测到新版本，正在更新...',
      icon: 'update',
      color: 'primary',
      position: 'top',
      timeout: 2000
  });
}

// 导出处理函数供其他地方使用
export const errorProcess = async (timeout = 1000) => {
  try {
    // 注销 Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }

    // 清除缓存存储
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }

    // 清除 sessionStorage
    window.sessionStorage.clear();

    // 显示更新提示
    showUpdateNotification();
    // 强制刷新
    setTimeout(() => {
      window.location.reload(true);
    }, timeout);
  } catch (error) {
    console.error('Failed to clear PWA cache:', error);
  }
};

export default async ({ router }) => {
  // PWA 更新处理
  window.addEventListener('unhandledrejection', async (event) => {
    const import_error = event.reason?.message?.includes('Failed to fetch dynamically imported module')
    const resource_error = event.reason?.message?.includes('Failed to load resource')
    const PWA_ERROR = import_error || resource_error
    const CORS_ERROR = event.reason?.message?.includes('blocked by CORS policy')
    const BAD_GATEWAY_ERROR = event.reason?.message?.includes('502') || event.reason?.message?.includes('Bad Gateway')

    if ( PWA_ERROR && (!CORS_ERROR || !BAD_GATEWAY_ERROR) ) {
      showUpdateNotification();
      try {
        await errorProcess();
      } catch (error) {
        console.error('清除缓存失败:', error);
      }
    }

    // 处理 CORS 错误
    if (CORS_ERROR) {
      Notify.create({
        message: '网络请求被阻止，10秒后将尝试刷新...',
        icon: 'error',
        color: 'negative',
        position: 'top',
        timeout: 3000
      });

      await errorProcess();
    }

    // 处理 502 Bad Gateway 错误
    if (BAD_GATEWAY_ERROR) {
      Notify.create({
        message: '服务器暂时不可用，10秒后将尝试刷新...',
        icon: 'error',
        color: 'negative',
        position: 'top',
        timeout: 3000
      });

      await errorProcess();
    }
  });
}; 