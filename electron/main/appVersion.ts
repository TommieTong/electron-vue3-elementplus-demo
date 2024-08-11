// // import { autoUpdater } from 'electron-updater';
// import { dialog, BrowserWindow } from 'electron';

// const updateUrl = 'http://common.longzipeng.online/package/auto';

// /**检测更新 */
// export const checkUpdate = (win: BrowserWindow) => {

//   // 设置更新检测的资源路径，会检测对应路径下的 last.yaml文件中的版本信息 上线后确保该文件能正常访问
//   if (process.platform == 'darwin') {
//     // autoUpdater.setFeedURL(`${updateUrl}/mac`);
//     return;
//   } else {
//     // autoUpdater.setFeedURL(`${updateUrl}/win`);
//   }

//   //检测更新
//   autoUpdater.checkForUpdates();

//   //监听'error'事件
//   autoUpdater.on('error', err => {
//     dialog.showErrorBox('更新出错拉！', err.message);
//   });

//   //监听'update-available'事件，发现有新版本时触发
//   autoUpdater.on('update-available', () => {
//     dialog.showMessageBox({
//       message: '发现新版本，正在下载安装包'
//     });
//   });

//   // 更新包下载百分比回调
//   autoUpdater.on('download-progress', function (progressObj) {
//     if (win) {
//       win.webContents.send('download-progress', progressObj);
//     }
//   });

//   //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
//   // autoUpdater.autoDownload = false;

//   //监听'update-downloaded'事件，新版本下载完成时触发
//   autoUpdater.on('update-downloaded', () => {
//     dialog
//       .showMessageBox({
//         type: 'info',
//         title: '应用更新',
//         message: '需要退出程序才能安装新版本，是否安装？',
//         buttons: ['是', '否']
//       })
//       .then(buttonIndex => {
//         if (buttonIndex.response == 0) {
//           //选择是，则退出程序，安装新版本
//           autoUpdater.quitAndInstall();

//         }
//       });
//   });
// };
