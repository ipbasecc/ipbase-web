import { contextBridge, ipcRenderer } from "electron";
import { BrowserWindow } from "@electron/remote";
import path from "path";

contextBridge.exposeInMainWorld("windowAPI", {
  minimize() {
    BrowserWindow.getFocusedWindow().minimize();
  },

  isMaximized: () => {
    const win = BrowserWindow.getFocusedWindow();
    return win ? win.isMaximized() : false;
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  },
  close() {
    BrowserWindow.getFocusedWindow().close();
  },

  downloadFile(url, filename) {
    ipcRenderer.send("download", { url: url, filename: filename });
  },
  stopDownload(fileInfo) {
    ipcRenderer.send("stop-download", fileInfo);
  },

  downloadMessage: (channel, func) => {
    if (channel === "download-progress") {
      ipcRenderer.on(channel, (event, fileInfo) => {
        // 处理接收到的进度数据
        func(fileInfo);
      });
    }
    if (channel === "download-completed") {
      ipcRenderer.on(channel, (event, fileInfo) => {
        // 处理下载完成后的文件路径
        func(fileInfo);
      });
    }
  },

  
  logout() {
    ipcRenderer.send("clearCache");
  },

  // 添加窗口状态变化监听器
  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-state-changed', (event, state) => {
      callback(state);
    });
  },
});

// 添加缩放控制API
contextBridge.exposeInMainWorld("zoomAPI", {
  // 获取当前缩放因子
  getZoomFactor: () => ipcRenderer.invoke('get-zoom-factor'),
  
  // 设置缩放因子
  setZoomFactor: (zoom) => ipcRenderer.invoke('set-zoom-factor', zoom),
  
  // 监听本地快捷键设置请求
  onSetupLocalShortcuts: (callback) => {
    ipcRenderer.on('setup-local-shortcuts', (event, shortcuts) => {
      callback(shortcuts);
    });
  },
  
  // 触发本地快捷键事件
  triggerLocalShortcut: (shortcut) => {
    ipcRenderer.send(`local-shortcut-${shortcut}`);
  }
});

contextBridge.exposeInMainWorld("pathAPI", {
  pathService(_path) {
    let __path;
    if (process.env.DEV) {
      __path = path.resolve(`public/${_path}`);
    } else {
      __path = path.join(process.resourcesPath, "app.asar", _path);
    }
    return __path;
  },
});
contextBridge.exposeInMainWorld('osAPI', {
  async isWin11() {
    const isWindows = process.platform === 'win32';
    if (!isWindows) {
      return false;
    }
  
    try {
      // 检查 Windows 版本，Windows 11 的版本号是 10.0.22000 或更高
      const osReleaseInfo = await ipcRenderer.invoke('get-windows-version');
      const isWindows11 = osReleaseInfo.major >= 10 && osReleaseInfo.minor >= 0 && osReleaseInfo.build >= 22000;
      return isWindows11;
    } catch (error) {
      console.error('Failed to determine Windows version:', error);
      return false;
    }
  }
});

contextBridge.exposeInMainWorld('jitsiAPI', {
  // getDesktopSources: (options) => ipcRenderer.invoke(SCREEN_SHARE_GET_SOURCES, options)

  getDesktopSources: async (options) => {
    try {
      return await ipcRenderer.invoke('ScreenCapture', options);
    } catch (error) {
      console.error('Error obtaining desktop sources:', error);
      throw error; // Re-throw the error if you want to handle it further up
    }
  },
  // 添加 Wake Lock API 支持
  requestWakeLock: async () => {
    try {
      if ('wakeLock' in navigator) {
        return await navigator.wakeLock.request('screen');
      }
      return null;
    } catch (error) {
      console.warn('Wake Lock API not supported or permission denied:', error);
      return null;
    }
  }
})

// 添加额外的权限 API
contextBridge.exposeInMainWorld('permissionsAPI', {
  queryPermission: async (name) => {
    try {
      if (name in navigator.permissions) {
        return await navigator.permissions.query({ name });
      }
      return { state: 'not-supported' };
    } catch (error) {
      console.warn(`Permission query failed for ${name}:`, error);
      return { state: 'denied' };
    }
  }
});