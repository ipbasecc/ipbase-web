import { contextBridge, ipcRenderer } from "electron";
import { BrowserWindow } from "@electron/remote";
import path from "path";

contextBridge.exposeInMainWorld("windowAPI", {
  minimize() {
    BrowserWindow.getFocusedWindow().minimize();
  },

  isMaximized() {
    const win = BrowserWindow.getFocusedWindow();
    return win.isMaximized();
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
  }
})