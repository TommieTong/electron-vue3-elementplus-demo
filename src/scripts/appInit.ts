import { ipcRenderer } from "electron";

// 监听初始化
ipcRenderer.on("launch-app", (_, roomCode) => {
  console.log("收到来自url的房间号：", roomCode);
});
