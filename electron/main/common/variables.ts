import { join } from 'node:path';

/**
 *公共变量配置
 */
process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// 公共变量中存一份SRC的路径，方便取值
process.env.SRC_PATH = join(__dirname, '../../src').split('\\').join('/');

// 预加载文件路径
export const preloadPath = join(__dirname, '../preload/index.js');
// dev环境请求地址
export const url = process.env.VITE_DEV_SERVER_URL;
// 部署环境的html文件路径
export const indexHtmlPath = join(process.env.DIST, 'index.html');
// icon图标地址
export const iconPath = join(process.env.PUBLIC, 'icons/icon.ico');
// app的title，会被index.html中配置的<title>%VITE_APP_TITLE%</title> 覆盖
export const appTitle = "新窗口";
// app在windows上注册表的协议
export const PROTOCOL = 'bcxlelectrondemo';
