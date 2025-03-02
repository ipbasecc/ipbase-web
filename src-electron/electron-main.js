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
  powerSaveBlocker
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

const id = powerSaveBlocker.start('prevent-display-sleep');
if (powerSaveBlocker.isStarted(id)) {
    console.log('Wake lock active');
} else {
    console.error('Wake lock could not be activated');
}

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
    if (!mainWindow || !mainWindow.webContents) {
      console.error('无法设置缩放因子：mainWindow或webContents不存在');
      return;
    }
    try {
      mainWindow.webContents.setZoomFactor(zoom);
      saveZoomFactor(zoom);
      console.log(`缩放因子已设置为: ${zoom}`);
    } catch (error) {
      console.error('设置缩放因子时出错:', error);
    }
  }
  
  try {
    // 先确保之前的快捷键已经取消注册
    unregisterGlobalShortcuts();
    
    // 使用更具体的快捷键组合，避免与系统或其他应用冲突
    const shortcuts = {
      zoomIn: 'CommandOrControl+Shift+=',     // 改为Ctrl+Shift+=
      zoomOut: 'CommandOrControl+Shift+-',    // 改为Ctrl+Shift+-
      zoomReset: 'CommandOrControl+Shift+0'   // 改为Ctrl+Shift+0
    };
    
    // 注册缩放增加快捷键
    const registerPlusResult = globalShortcut.register(shortcuts.zoomIn, () => {
      if (mainWindow && mainWindow.webContents) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        const zoom = Math.min(currentZoom + 0.1, 3.0); // 设置最大缩放限制
        setAndSaveZoomFactor(zoom);
      }
    });
    
    if (!registerPlusResult) {
      console.error(`注册 ${shortcuts.zoomIn} 快捷键失败`);
    }

    // 注册缩放减少快捷键
    const registerMinusResult = globalShortcut.register(shortcuts.zoomOut, () => {
      if (mainWindow && mainWindow.webContents) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        const zoom = Math.max(currentZoom - 0.1, 0.5); // 设置最小缩放限制
        setAndSaveZoomFactor(zoom);
      }
    });
    
    if (!registerMinusResult) {
      console.error(`注册 ${shortcuts.zoomOut} 快捷键失败`);
    }

    // 注册重置缩放快捷键
    const registerZeroResult = globalShortcut.register(shortcuts.zoomReset, () => {
      if (mainWindow && mainWindow.webContents) {
        setAndSaveZoomFactor(1);
      }
    });
    
    if (!registerZeroResult) {
      console.error(`注册 ${shortcuts.zoomReset} 快捷键失败`);
    }
    
    console.log('全局快捷键注册状态:', {
      [shortcuts.zoomIn]: registerPlusResult,
      [shortcuts.zoomOut]: registerMinusResult,
      [shortcuts.zoomReset]: registerZeroResult
    });
    
    // 如果所有快捷键都注册失败，尝试使用本地快捷键
    if (!registerPlusResult && !registerMinusResult && !registerZeroResult) {
      console.log('全局快捷键注册失败，将使用本地快捷键作为备选方案');
      setupLocalShortcuts();
    }
  } catch (error) {
    console.error('注册全局快捷键时出错:', error);
    // 出错时尝试使用本地快捷键
    setupLocalShortcuts();
  }
}

// 添加本地快捷键作为备选方案
function setupLocalShortcuts() {
  if (!mainWindow) return;
  
  // 使用本地快捷键（仅在应用程序窗口聚焦时有效）
  const localShortcuts = {
    'CommandOrControl+=': () => {
      if (mainWindow && mainWindow.webContents) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        const zoom = Math.min(currentZoom + 0.1, 3.0);
        mainWindow.webContents.setZoomFactor(zoom);
        saveZoomFactor(zoom);
      }
    },
    'CommandOrControl+-': () => {
      if (mainWindow && mainWindow.webContents) {
        const currentZoom = mainWindow.webContents.getZoomFactor();
        const zoom = Math.max(currentZoom - 0.1, 0.5);
        mainWindow.webContents.setZoomFactor(zoom);
        saveZoomFactor(zoom);
      }
    },
    'CommandOrControl+0': () => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.setZoomFactor(1);
        saveZoomFactor(1);
      }
    }
  };
  
  // 通过IPC向渲染进程发送消息，让渲染进程设置本地快捷键
  mainWindow.webContents.send('setup-local-shortcuts', Object.keys(localShortcuts));
  
  // 监听渲染进程触发的快捷键事件
  Object.entries(localShortcuts).forEach(([shortcut, handler]) => {
    ipcMain.on(`local-shortcut-${shortcut}`, handler);
  });
  
  console.log('已设置本地快捷键作为备选方案');
}

function unregisterGlobalShortcuts() {
  try {
    // 取消注册全局快捷键，包括新的带Shift的组合
    globalShortcut.unregister("CommandOrControl+=");
    globalShortcut.unregister("CommandOrControl+-");
    globalShortcut.unregister("CommandOrControl+0");
    globalShortcut.unregister("CommandOrControl+Shift+=");
    globalShortcut.unregister("CommandOrControl+Shift+-");
    globalShortcut.unregister("CommandOrControl+Shift+0");
    
    console.log('全局快捷键已取消注册');
  } catch (error) {
    console.error('取消注册全局快捷键时出错:', error);
  }
}

app.commandLine.appendSwitch(
  'enable-features',
  'WebRTCPipeWireCapturer',
  'SharedArrayBuffer',
  'WebRTCScreenSharing',
  'DesktopCapture'
);

app.commandLine.appendSwitch('enable-usermedia-screen-capturing');
app.commandLine.appendSwitch('allow-http-screen-capture');
app.commandLine.appendSwitch('auto-select-desktop-capture-source');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-gpu-vsync');

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.jitsi.net https://*.yihu.team;
    style-src 'self' 'unsafe-inline' https://*.jitsi.net;
    img-src 'self' data: blob: https://*.jitsi.net;
    media-src 'self' https://*.jitsi.net;
    connect-src 'self' wss://*.yihu.team https://*.yihu.team https://*.jitsi.net wss://*.jitsi.net;
    frame-src 'self' https://*.jitsi.net;
    worker-src 'self' blob:;
    child-src 'self' blob:;
    object-src 'none';
    font-src 'self' https://*.jitsi.net;
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
      webSecurity: false, // 允许跨域访问
      contextIsolation: true, // 必须与 preload 配合
      enablePreferredSizeMode: true,
      plugins: true, // 启用插件支持

      sandbox: false,
      webviewTag: true,
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
      csp: csp,
      // zoomFactor: zoom,
      enableBlinkFeatures: 'GetDisplayMedia', // 允许屏幕捕获
      permissions: [
        'media',
        'mediaDevices',
        'desktopCapturer',
        'display-capture',
        'screen',
        'wake-lock'
      ]
    },
  });
  enable(mainWindow.webContents);
  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL);
    // mainWindow.loadURL("http://localhost:9000");
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
  // mainWindow.webContents.openDevTools();

  // 监听窗口关闭事件，以便保存当前缩放因子
  mainWindow.webContents.on("did-finish-load", () => {
    const currentZoom = mainWindow.webContents.getZoomFactor();
    saveZoomFactor(currentZoom);
  });
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed');
  });

  mainWindow.on("closed", () => {
    console.log('窗口关闭，取消注册快捷键并清空mainWindow引用');
    unregisterGlobalShortcuts();
    mainWindow = null;
  });
  
  mainWindowState.manage(mainWindow);
  // Save window position and size when it is moved or resized.
  mainWindow.on("moved", () => mainWindowState.manage(mainWindow));
  mainWindow.on("resized", () => mainWindowState.manage(mainWindow));
  
  // 窗口失去焦点时取消注册快捷键
  mainWindow.on("blur", () => {
    console.log('窗口失去焦点，取消注册快捷键');
    unregisterGlobalShortcuts();
  });
  
  // 窗口获得焦点时重新注册快捷键
  mainWindow.on("focus", () => {
    console.log('窗口获得焦点，重新注册快捷键');
    registerGlobalShortcuts();
  });

  // 初始注册全局快捷键
  registerGlobalShortcuts();

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-changed', 'maximized');
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-changed', 'unmaximized');
  });
  
  // 添加窗口焦点状态同步
  mainWindow.on('focus', () => {
    const state = mainWindow.isMaximized() ? 'maximized' : 'unmaximized';
    mainWindow.webContents.send('window-state-changed', state);
  });
}

app.on("window-all-closed", () => {
  console.log('所有窗口已关闭');
  // 移除IPC处理器
  ipcMain.removeHandler(SCREEN_SHARE_GET_SOURCES);
  ipcMain.removeHandler("ScreenCapture");
  
  // 在非macOS平台上退出应用
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
  
  // 添加IPC处理器来处理渲染进程的快捷键请求
  ipcMain.handle('get-zoom-factor', () => {
    if (mainWindow && mainWindow.webContents) {
      return mainWindow.webContents.getZoomFactor();
    }
    return 1;
  });
  
  ipcMain.handle('set-zoom-factor', (event, zoom) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.setZoomFactor(zoom);
      saveZoomFactor(zoom);
      return true;
    }
    return false;
  });
  
  createWindow();
});

ipcMain.handle("ScreenCapture", async (_event, options) => {
  try {
    // 添加更多的捕获类型和详细选项
    const sources = await desktopCapturer.getSources({
      ...options,
      types: ['window', 'screen'],
      fetchWindowIcons: true
    });
    
    return sources.map((source) => ({
      ...source,
      thumbnail: {
        dataUrl: source.thumbnail.toDataURL(),
      },
      type: source.id.startsWith('window') ? 'window' : 'screen'
    }));
  } catch (error) {
    console.error("Failed to get desktop sources:", error);
    // 返回更详细的错误信息
    return {
      error: true,
      message: error.message,
      code: error.code
    };
  }
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

// 应用退出前取消注册快捷键
app.on("will-quit", () => {
  console.log('应用即将退出，取消注册所有快捷键');
  unregisterGlobalShortcuts();
});
