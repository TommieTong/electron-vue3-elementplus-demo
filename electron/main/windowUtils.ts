import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  screen,
} from "electron";
import {
  url,
  appTitle,
  preloadPath,
  iconPath,
  indexHtmlPath,
} from "./common/variables";
import { CustomChannel } from "../../globel/channelEvent";

/* ======================= 定义一些窗口工具类中会使用到的常量，以及窗口顶级父类 ========================= */

// 默认窗口参数
export const defaultWindowConfig: BrowserWindowConstructorOptions &
  IWindowConfig = {
  title: appTitle,
  icon: iconPath,
  width: 800,
  height: 600,
  webPreferences: {
    webviewTag: true,
    preload: preloadPath,
    nodeIntegration: true,
    contextIsolation: false,
  },
};

/**
 * 窗口管理顶级父类 定义一些属性，和公共方法
 */
export class WindowUtils {
  group: Map<string, WindowGroup>; // 窗口组 key就是传入的key值，如果没传，则取窗口的id作为key值

  /**
   * 构造方法，初始化属性
   */
  constructor() {
    this.group = new Map();
  }

  // 事件监听处理
  listen() {
    // 窗口创建监听
    ipcMain.handle(CustomChannel.window_create, (_, opt: IWindowConfig) => {
      this.createWindows(opt);
    });

    // 窗口位置修改监听
    ipcMain.handle(
      CustomChannel.window_position_change,
      (_, windowPosition: IWindowPosition) => {
        // 假如传了窗口的key，则获取对应窗口，假如没传，则用发送事件的窗口
        const windowKey = windowPosition.windowKey;
        const cureentWin =
          windowKey && windowKey.length > 0
            ? this.getWindowByKey(windowKey)
            : this.getWindowByEvent(_);
        this.changeWindowPostion(cureentWin, windowPosition);
      }
    );
  }

  /**
   * 创建窗口
   * @param windowConfig 窗口创建参数
   */
  createWindows(windowConfig: IWindowConfig): BrowserWindow {
    // 先通过key判断是否已窗口，有则聚焦
    let windowKey = windowConfig.key;
    if (windowKey && windowKey.length > 0) {
      /// 先从窗口组中取出记录
      const wg: WindowGroup = this.group.get(windowKey);
      if (wg) {
        /// 根据记录中的窗口id获取窗口，假如存在该窗口，则聚焦该窗口
        const oldWin = BrowserWindow.fromId(wg.windowId);
        if (oldWin) {
          oldWin.focus();
          return oldWin;
        }
      }
    }

    // 创建窗口对象
    const win: BrowserWindow = new BrowserWindow(
      Object.assign({}, defaultWindowConfig, windowConfig)
    );

    // 将窗口的关键信息与key关联，存入窗口组中
    windowKey = windowKey || win.id.toString();
    this.group.set(windowKey, {
      windowId: win.id,
      webContentsId: win.webContents.id,
    });

    // 根据当前环境加载页面，并传递参数
    const param = windowConfig.param
      ? "?urlParamData=" + windowConfig.param
      : "";
    if (process.env.VITE_DEV_SERVER_URL) {
      // 如果是开发环境，则直接访问本地跑起的服务，拼接对应的路由
      win.loadURL(`${url}#${windowConfig.route}${param}`);
    } else {
      // 如果是线上环境，则加载html文件的路径，然后拼接路由
      win.loadFile(indexHtmlPath, { hash: windowConfig.route + param });
    }

    // 绑定通用窗口事件
    this.bindWindowEvent(win, windowConfig);
    console.log(this.group);
    return win;
  }

  /**
   * 绑定窗口事件
   * @param win 窗口对象
   * @param windowConfig 窗口创建参数
   */
  bindWindowEvent(win: BrowserWindow, windowConfig: IWindowConfig) {
    // 窗口关闭监听，此事件触发时，窗口即将关闭，可以拒绝关闭，此时窗口对象还未销毁
    win.on("close", () => {
      /// 设置窗口透明
      win.setOpacity(0);
      /// 在窗口组中删除
      const key = windowConfig.key || win.id.toString();
      this.group.delete(key);
    });

    // 此事件触发时，窗口已关闭，窗口对象已销毁
    win.on("closed", () => {
      // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
      win.removeAllListeners();
      // 引用置空
      win = null;
    });
  }

  /**
   * 修改窗口的位置
   * @param window 窗口对象
   * @param windowPosition 位置参数对象
   */
  changeWindowPostion(window: BrowserWindow, windowPosition: IWindowPosition) {
    // xy轴值
    let x = windowPosition.x;
    let y = windowPosition.y;
    if (x != null && y != null) {
      // 偏移量
      const offsetX = windowPosition.offsetX || 0;
      const offsetY = windowPosition.offsetY || 0;
      x = windowPosition.x + offsetX;
      y = windowPosition.y + offsetY;
      // 如果是相对于某个窗口的话，加上相对窗口的x、y坐标
      if (windowPosition.relativeWindowId) {
        const relativeWin = BrowserWindow.fromId(
          windowPosition.relativeWindowId
        );
        if (relativeWin) {
          x += relativeWin.getPosition()[0];
          y += relativeWin.getPosition()[1];
        }
      }
      window.setPosition(x, y);
    }

    // 如果有定位
    if (windowPosition.position) {
      // 偏移量
      const offsetX = windowPosition.offsetX || 0;
      const offsetY = windowPosition.offsetY || 0;

      const winBounds = window.getBounds();
      let relativeBounds = screen.getDisplayMatching(winBounds).bounds;
      if (windowPosition.relativeWindowId) {
        const relativeWin = BrowserWindow.fromId(
          windowPosition.relativeWindowId
        );
        if (relativeWin) {
          relativeBounds = relativeWin.getBounds();
        }
      }

      // 计算坐标
      switch (windowPosition.position) {
        case "center":
          window.setPosition(
            relativeBounds.x +
              (relativeBounds.width - winBounds.width) / 2 +
              offsetX,
            relativeBounds.y +
              (relativeBounds.height - winBounds.height) / 2 +
              offsetY
          );
          break;
        case "bottom-left":
          window.setPosition(
            relativeBounds.x + offsetX,
            relativeBounds.y +
              relativeBounds.height -
              winBounds.height +
              offsetY
          );
          break;
        case "bottom-right":
          window.setPosition(
            relativeBounds.x + relativeBounds.width - winBounds.width + offsetX,
            relativeBounds.y +
              relativeBounds.height -
              winBounds.height +
              offsetY
          );
          break;
        case "top-left":
          window.setPosition(
            relativeBounds.x + offsetX,
            relativeBounds.y + offsetY
          );
          break;
        case "top-right":
          window.setPosition(
            relativeBounds.x + relativeBounds.width - winBounds.width + offsetX,
            relativeBounds.y + offsetY
          );
          break;
      }
    }
  }

  /**
   * 通过窗口事件获取发送者的窗口
   * @param event ipc发送窗口事件
   */
  getWindowByEvent(event: Electron.IpcMainInvokeEvent): BrowserWindow {
    const webContentsId = event.sender.id;
    for (const currentWin of BrowserWindow.getAllWindows()) {
      if (currentWin.webContents.id === webContentsId) {
        return currentWin;
      }
    }
    return null;
  }

  /**
   * 通过传入的key获取指定的窗口
   * @param key 窗口唯一key
   */
  getWindowByKey(key: string): BrowserWindow {
    return BrowserWindow.fromId(this.group.get(key).windowId);
  }
}
