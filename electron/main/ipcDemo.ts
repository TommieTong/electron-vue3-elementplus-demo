import { ipcMain } from "electron";

export const initIpcDemo = () => {
  
  // 同步处理通信，并等待主进程返回值
  ipcMain.on("event-on-test", (e, data: string) => {
    setTimeout(() => {
      e.returnValue = "主进程同步响应：" + data;
    }, 2000);
  });

  // 异步处理通信，异步返回结果
  ipcMain.handle("event-handle-test", (e, data: string) => {
    return "主进程异步响应:" + data;
  });

  // 异步处理一次
  ipcMain.handleOnce("event-handleOnce-test", (e) => {
    console.log("异步通信处理一次！");
  });

  // 双向通信处理
  ipcMain.handle("event-handle-togeter-test", (e, data: string) => {
    e.sender.send("event-handle-togeter-test", "主进程通知" + data);
  });
};
