import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  net,
  session,
  globalShortcut,
  desktopCapturer,
} from "electron";
import windowStateKeeper from "electron-window-state";
import path from "path";
import os from "os";

import { enable, initialize } from "@electron/remote/main/index.js";
import fs from "fs";
import { fileURLToPath } from "node:url";

initialize(); // <-- add this
// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL(".", import.meta.url));

const SCREEN_SHARE_GET_SOURCES = "ScreenCapture";

let mainWindow;

// 读取或初始化缩放设置
function getZoomFactor() {
  const userDataPath = app.getPath("userData");
  const configPath = path.resolve(userDataPath, "config.json");
  try {
    const data = fs.readFileSync(configPath, "utf8");
    return JSON.parse(data).zoom || 1;
  } catch (error) {
    return 1; // 默认缩放因子为1
  }
}

// 保存缩放设置
function saveZoomFactor(zoom) {
  const userDataPath = app.getPath("userData");
  const configPath = path.resolve(userDataPath, "config.json");
  fs.writeFileSync(configPath, JSON.stringify({ zoom }));
}
function registerGlobalShortcuts() {
  function setAndSaveZoomFactor(zoom) {
    mainWindow.webContents.setZoomFactor(zoom);
    saveZoomFactor(zoom);
  }
  // 注册 Ctrl + = 缩放增加
  globalShortcut.register("CommandOrControl+=", () => {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor();
      const zoom = currentZoom + 0.1;
      setAndSaveZoomFactor(zoom);
    }
  });

  // 注册 Ctrl + - 缩减少
  globalShortcut.register("CommandOrControl+-", () => {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor();
      const zoom = currentZoom - 0.1;
      setAndSaveZoomFactor(zoom);
    }
  });

  globalShortcut.register("CommandOrControl+0", () => {
    if (mainWindow) {
      setAndSaveZoomFactor(1);
    }
  });
}

function unregisterGlobalShortcuts() {
  // 取消注册全局快捷键
  globalShortcut.unregister("CommandOrControl+=");
  globalShortcut.unregister("CommandOrControl+-");
}

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  const csp = `
    default-src 'none';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    connect-src 'self';
    font-src 'self';
  `;
  /**
   * Initial window options
   */
  const zoom = getZoomFactor();
  mainWindow = new BrowserWindow({
    // icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    icon: path.resolve(currentDir, "icons/icon.png"), // tray icon
    // width: 1600,
    // height: 1000,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    useContentSize: false,
    frame: false,
    // transparent: true,
    webPreferences: {
      sandbox: false,
      enableHardwareAcceleration: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          "electron-preload" + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION
        )
      ),
      // Enable node integration for preload script only
      nodeIntegration: true, // 赋予此窗口页面中的 JavaScript 访问 Node.js 环境的能力
      enableRemoteModule: true, // 打开 remote 模块
      contextIsolation: true, // 是否在独立 JavaScript 环境运行
      webSecurity: true,
      csp: csp,
      // zoomFactor: zoom,
    },
  });
  enable(mainWindow.webContents);
  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL);
  } else {
    mainWindow.loadFile("index.html");
  }
  // // mainWindow.webContents.setZoomFactor(1.5);
  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.setZoomFactor(zoom);
  });
  // disable default menu of system
  const template = [];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // mainWindow.webContents.openDevTools()
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  // 监听窗口关闭事件，以便保存当前缩放因子
  mainWindow.webContents.on("did-finish-load", () => {
    const currentZoom = mainWindow.webContents.getZoomFactor();
    saveZoomFactor(currentZoom);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindowState.manage(mainWindow);
  // Save window position and size when it is moved or resized.
  mainWindow.on("moved", () => mainWindowState.manage(mainWindow));
  mainWindow.on("resized", () => mainWindowState.manage(mainWindow));

  // 当窗口被关闭时，取消注册全局快捷键
  mainWindow.on("closed", () => {
    unregisterGlobalShortcuts();
  });
  mainWindow.on("will-quit", () => {
    unregisterGlobalShortcuts();
  });
  mainWindow.on("blur", () => {
    unregisterGlobalShortcuts();
  });
  mainWindow.on("focus", () => {
    registerGlobalShortcuts();
  });

  // 注册全局快捷键
  registerGlobalShortcuts();
}

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

// 在app.on('ready', ...)事件处理程序中
app.on("ready", () => {
  if (!process.env.DEBUGGING) {
    const filter = {
      urls: [
        "*://api.yihu.team/*", // Strapi API
        "*://mattermost.yihu.team/*", // Mattermost API
      ],
    };
    // 修改请求头
    session.defaultSession.webRequest.onBeforeSendHeaders(
      filter,
      (details, callback) => {
        // 你可以在这里修改请求头，例如添加Origin头
        details.requestHeaders["Origin"] = "https://app.yihu.team"; // 注意：通常不推荐这样硬编码Origin
        callback({ requestHeaders: details.requestHeaders });
      }
    );
    // 修改响应头
    session.defaultSession.webRequest.onHeadersReceived(
      filter,
      (details, callback) => {
        // 允许跨域
        details.responseHeaders["Access-Control-Allow-Origin"] = "*"; // 注意：'*'可能不安全，最好指定具体的源
        // 你还可以添加其他CORS相关的响应头，如Access-Control-Allow-Methods等
        callback({ responseHeaders: details.responseHeaders });
      }
    );
  }
  createWindow();
});

ipcMain.handle("ScreenCapture", async (_event, options) => {
  try {
    const sources = await desktopCapturer.getSources(options);
    return sources.map((item) => ({
      ...item,
      thumbnail: {
        dataUrl: item.thumbnail.toDataURL(),
      },
    }));
  } catch (error) {
    console.error("Failed to get desktop sources:", error);
    throw error; // Ensure the error is thrown to be caught in the preload script
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  ipcMain.removeHandler(SCREEN_SHARE_GET_SOURCES);
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let stoped = [];
const inStoped = (item) => {
  return (stoped?.length > 0 && stoped.find((i) => __is(i, item))) || void 0;
};
const __is = (a, b) => {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  } else {
    return Object.keys(a).every((key) => a[key] === b[key]);
  }
};
// 监听来自Vue的下载请求
ipcMain.on("download", async (event, args) => {
  const { url, filename } = args;
  // console.log(url, filename);

  // 显示保存对话框
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "保存文件",
    defaultPath: path.resolve(os.homedir(), "Downloads", filename),
    filters: [
      { name: "All Files", extensions: ["*"] },
      // 可以添加特定文件类型的过滤器
    ],
  });

  if (!canceled) {
    // 设置保存路径
    const savePath = filePath;
    const _filename = path.basename(savePath);
    let fileInfo = {
      name: _filename,
      path: filePath,
      percent: 0,
    };
    // 触发下载
    const request = net.request(url);

    request.on("response", (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(savePath);

        response.on("data", (chunk) => {
          // 处理下载的数据流
          fileStream.write(chunk);
          // 计算并更新下载进度
          // 在 Vue 组件中更新进度条
          fileInfo.percent = Math.floor(
            (fileStream.bytesWritten / response.headers["content-length"]) * 100
          );
          mainWindow.webContents.send("download-progress", fileInfo);
        });

        response.on("end", () => {
          fileStream.end();
          fileInfo.percent = 100;
          mainWindow.webContents.send("download-progress", fileInfo);
        });
      } else {
        console.error(
          `Error downloading file. Status code: ${response.statusCode}`
        );
      }
    });
    request.end();
  }
});
ipcMain.on("stop-download", async (event, fileInfo) => {
  if (!inStoped(fileInfo)) {
    stoped.push(fileInfo);
  }
});
ipcMain.on("clearCache", async (event) => {
  const webContents = mainWindow.webContents;
  webContents.session.clearStorageData(
    {
      storages: [
        "cache",
        "indexedDB",
        "localstorage",
        "sessionStorage",
        "webSQL",
      ],
    },
    () => {
      mainWindow.webContents.send("cacheCleared");
    }
  );
});

function getWindowsVersion() {
  if (process.platform !== "win32") {
    throw new Error("Not running on Windows");
  }

  const version = os.release();
  const [major, minor, build] = version.split(".").map(Number);

  return { major, minor, build };
}

// 将方法暴露给渲染进程
ipcMain.on("get-windows-version", (event) => {
  event.returnValue = getWindowsVersion();
});
