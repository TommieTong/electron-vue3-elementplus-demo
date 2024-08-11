import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  nativeTheme,
  screen,
  IpcMainEvent,
  session,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";
// import { checkUpdate } from "./appVersion";
import { initIpcDemo } from "./ipcDemo";
import {WindowUtils} from './windowUtils'


// 创建窗口工具类
const windowUtils = new WindowUtils();
windowUtils.listen();

// 初始化ipc通信Demo
initIpcDemo();

process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// 单例锁，保证只有一个app运行
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

//*************** 应用唤醒相关 ********************/
// 注册协议
const PROTOCOL = "bcxlelectrondemo";
/**添加注册表信息 用于浏览器启动客户端 */
function registerScheme() {
  const args = [];
  if (!app.isPackaged) {
    // 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
    args.push(join(process.argv[1]));
  }
  // 加一个 `--` 以确保后面的参数不被 Electron 处理
  args.push("--");
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);
  handleArgv(process.argv);
}

// 处理浏览器打开应用的启动参数信息
function handleArgv(argv: string[]) {
  const prefix = `${PROTOCOL}:`;
  // 开发阶段，跳过前两个参数（`electron.exe .`）
  // 打包后，跳过第一个参数（`myapp.exe`）
  const offset = app.isPackaged ? 1 : 2;
  const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix));
  if (url) handleUrl(url);
}
// 房间号
let roomCode = "";

// 处理url打开应用的请求
function handleUrl(url: string) {
  // bcxlelectrondemo://joinRoom?roomCode=123
  const urlObj = new URL(url);
  const { searchParams } = urlObj;
  roomCode = searchParams.get("roomCode") || "";
  if (win && win.webContents) {
    win?.webContents.send("launch-app", roomCode);
  }
}

// 主动获取房间号，因为应用通过url唤醒时，可能页面窗口还未初始化完成，这时win是null，收不到“launch-app”的监听
ipcMain.on("get-roomCode", (e) => {
  e.returnValue = roomCode;
});

//*************** 应用唤醒相关 ********************/

// Remove electron secu rity warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  // 加载vue插件 plugins/vuetools6.5.1
  if (!app.isPackaged) {
    await session.defaultSession.loadExtension(
      join(__dirname, "../../plugins/vuetools6.5.1")
    );
  }

  win = windowUtils.createWindows({
    route:"/login",
    key:'main'
  });
  // win = new BrowserWindow({
  //   title: "Main window",
  //   icon: join(process.env.PUBLIC, "icons/icon.ico"),
  //   webPreferences: {
  //     webviewTag: true,
  //     preload,
  //     // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
  //     // Consider using contextBridge.exposeInMainWorld
  //     // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
  //     nodeIntegration: true,
  //     contextIsolation: false,
  //   },
  // });

  let number = 1;
  setInterval(() => {
    if (win && win.webContents) {
      win.webContents.send("event-from-main", "计数" + number++);
    }
  }, 2000);

  // if (process.env.VITE_DEV_SERVER_URL) {
  //   // electron-vite-vue#298
  //   win.loadURL(url);
  //   // Open devTool if the app is not packaged
  //   win.webContents.openDevTools();
  // } else {
  //   win.loadFile(indexHtml);
  // }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}
// 注册协议，用于浏览器打开应用
registerScheme();
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

// 监听windows的第二个实例唤醒，来实现应用打开的情况下，截取url地址
app.on("second-instance", (event, argv, workingDirectory) => {
  if (win) {
    // 恢复窗口，并重新聚焦
    if (win.isMinimized()) win.restore();
    handleArgv(argv);
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on("open-url", (event, urlStr) => {
  handleUrl(urlStr);
});

/**
 * 新建一个窗口
 * route=>路由地址  paramJsonStr => 序列化后的参数对象
 */
ipcMain.handle("open-win", (_, route: string, paramJsonStr: string) => {
  let childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  const paramData = paramJsonStr ? "?urlParamData=" + paramJsonStr : "";
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${route}${paramData}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: route + paramData });
  }
  childWindow.on("closed", () => {
    // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
    childWindow.removeAllListeners();
    childWindow = null;
  });
});

/**
 * show : ture 显示app进度条，false，关闭显示
 */
let progressInterval;
ipcMain.handle("show-process", (event, show: boolean) => {
  const INCREMENT = 0.03;
  const INTERVAL_DELAY = 100; // ms

  let c = 0;
  if (show) {
    progressInterval = setInterval(() => {
      win.setProgressBar(c);
      if (c < 2) {
        c += INCREMENT;
      } else {
        c = -INCREMENT * 5;
      }
    }, INTERVAL_DELAY);
  } else {
    c = 0;
    win.setProgressBar(c);
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }
});

/**语言修改同步 */
ipcMain.handle("lang:change", (event, lang) => {
  // 通知所有窗口同步更改语言
  for (const currentWin of BrowserWindow.getAllWindows()) {
    const webContentsId = currentWin.webContents.id;
    // 这里排除掉发送通知的窗口
    if (webContentsId !== event.sender.id && !currentWin.isDestroyed()) {
      currentWin.webContents.send("lang:change", lang);
    }
  }
});

// 主题样式修改同步
ipcMain.handle(
  "theme-style:change",
  (event, mode?: "system" | "light" | "dark") => {
    if (mode && "system,light,dark".indexOf(mode) >= 0) {
      nativeTheme.themeSource = mode;
    }
    // 通知所有窗口同步更改样式
    // 遍历window执行
    for (const currentWin of BrowserWindow.getAllWindows()) {
      const webContentsId = currentWin.webContents.id;
      if (webContentsId !== event.sender.id && !currentWin.isDestroyed()) {
        currentWin.webContents.send("theme-style:changed", mode);
      }
    }
  }
);

/**pinia多窗口共享 */
ipcMain.handle(
  "pinia-store-change",
  (
    event,
    storeName: string,
    jsonStr: string,
    isResetVersion: boolean,
    storeUpdateVersion: number
  ) => {
    // 遍历window执行
    for (const currentWin of BrowserWindow.getAllWindows()) {
      const webContentsId = currentWin.webContents.id;
      if (webContentsId !== event.sender.id && !currentWin.isDestroyed()) {
        currentWin.webContents.send(
          "pinia-store-set",
          storeName,
          jsonStr,
          isResetVersion,
          storeUpdateVersion
        );
      }
    }
  }
);

/**事件广播通知 */
ipcMain.handle("event-broadcast", (event, eventInfo: EventInfo) => {
  // 遍历window执行
  for (const currentWin of BrowserWindow.getAllWindows()) {
    // 注意，这里控制了发送广播的窗口，不触发对应事件，如果需要自身也触发的话，删除if内的逻辑即可
    if (event) {
      const webContentsId = currentWin.webContents.id;
      if (webContentsId === event.sender.id) {
        continue;
      }
    }
    currentWin.webContents.send(eventInfo.channel, eventInfo.body);
  }
});

/**
 * 通过窗口事件获取发送者的窗口
 * @param event ipc发送窗口事件
 */
function getWindowByEvent(event: IpcMainEvent): BrowserWindow {
  const webContentsId = event.sender.id;
  for (const currentWin of BrowserWindow.getAllWindows()) {
    if (currentWin.webContents.id === webContentsId) {
      return currentWin;
    }
  }
  return null;
}

/** 窗口移动功能封装 */
// 窗口移动 位置刷新定时器
let movingInterval = null;

/**
 * 窗口移动事件
 */
ipcMain.handle("window-move-open", (event, canMoving) => {
  let winStartPosition = { x: 0, y: 0 };
  let mouseStartPosition = { x: 0, y: 0 };
  // 获取当前聚焦的窗口
  const currentWindow = BrowserWindow.getFocusedWindow();
  const currentWindowSize = currentWindow.getSize();

  if (currentWindow) {
    if (canMoving) {
      // 读取原位置
      const winPosition = currentWindow.getPosition();
      winStartPosition = { x: winPosition[0], y: winPosition[1] };
      mouseStartPosition = screen.getCursorScreenPoint();
      // 清除旧的定时器
      if (movingInterval) {
        clearInterval(movingInterval);
      }
      // 创建定时器，每10毫秒更新一次窗口位置，保证一致
      movingInterval = setInterval(() => {
        // 窗口销毁判断，高频率的更新有可能窗口已销毁，定时器还没结束，此时就会出现执行销毁窗口方法的错误
        if (!currentWindow.isDestroyed()) {
          // 如果窗口失去焦点，则停止移动
          if (!currentWindow.isFocused()) {
            clearInterval(movingInterval);
            movingInterval = null;
          }
          // 实时更新位置
          const cursorPosition = screen.getCursorScreenPoint();
          const x =
            winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
          const y =
            winStartPosition.y + cursorPosition.y - mouseStartPosition.y;
          // 更新位置的同时设置窗口原大小， windows上设置=>显示设置=>文本缩放 不是100%时，窗口会拖拽放大
          currentWindow.setBounds({
            x: x,
            y: y,
            width: currentWindowSize[0],
            height: currentWindowSize[1],
          });
        }
      }, 10);
    } else {
      clearInterval(movingInterval);
      movingInterval = null;
    }
  }
});

/**
 * 版本更新检测
 */
ipcMain.handle("check-update", (e: any) => {
  // 获取发送通知的渲染进程窗口
  const currentWin = getWindowByEvent(e);
  // 升级校验
  // checkUpdate(currentWin);
});