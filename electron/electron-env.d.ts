/// <reference types="vite-plugin-electron/electron-env" />

import "../types/global.d.ts";

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: "true";
    DIST_ELECTRON: string;
    DIST: string;
    /** /dist/ or /public/ */
    PUBLIC: string;
  }
}

/** 一些仅在electron中使用的声明 */
declare global {
  // 窗口组
  interface WindowGroup {
    webContentsId: number; // 窗口的渲染层id
    windowId: number; // 窗口id
  }
}
