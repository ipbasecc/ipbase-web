import { contextBridge, ipcRenderer } from "electron";
import { BrowserWindow } from "@electron/remote";
import path from "path";

contextBridge.exposeInMainWorld("windowAPI", {
  minimize() {
    BrowserWindow.getFocusedWindow().minimize();
  },

  isMaximized () {
    const win = BrowserWindow.getFocusedWindow()
    return win.isMaximized()
  },
  toggleMaximize () {
    const win = BrowserWindow.getFocusedWindow()
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
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
});
contextBridge.exposeInMainWorld("pathAPI", {
  pathService(_path) {
    // return path.join(__dirname, _path);
    return path.resolve(__dirname, _path);
  },
});
