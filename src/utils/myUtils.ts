import { ElLoading, ElMessage } from "element-plus";
import { networkInterfaces } from "os";
const urlParamKey = "urlParamData=";

/* 检查用户是否已登录 */
export function isLoggedIn() {
  // localStorage 获取 token
  const token = localStorage.getItem('token')
  return !!token // 如果存在 token，则认为已登录
}

/**
 * 返回url传输的对象
 */
export const getParamFromUrl = function (): any {
  const url = decodeURIComponent(document.location.href);
  const index = url.indexOf(urlParamKey);
  if (index >= 0) {
    return JSON.parse(url.substring(index + urlParamKey.length));
  }
  return null;
};

/**
 * 从传入的url 中获取指定key的value
 * @param {*} key 要获取的 key
 * @returns window.location.href 中指定key对应的value
 */
export function getUrlParam(url: string, key: string) {
  url = url.replace(/^[^?]*\?/, "");
  const regexp = new RegExp(`(^|&)${key}=([^&#]*)(&|$|)`, "i");
  const paramMatch = url.match(regexp);

  return paramMatch ? paramMatch[2] : null;
}

/**
 * 提示消息简单封装
 * @param text 消息文本
 * @param type 消息类型
 * @param time 持续时间
 * @param showClose 是否显示删除按钮
 */
export const message = (
  text: string,
  type: "success" | "warning" | "error" | "info" = "info",
  time = 2000,
  showClose = false
) => {
  //// 警告消息
  ElMessage({
    message: text,
    type: type,
    duration: time,
    showClose: showClose,
  });
};

/*
 * 处理map类型序列化后为 {} 的情况
 */
export function stringify(obj: any): string {
  return JSON.stringify(cloneToObject(obj));
}
/**
 * 将字段包含map的对象转为json对象的格式
 * 解决map对象被JSON序列化后，为{}的情况
 * @param obj
 * @returns
 */
export function cloneToObject(obj: any): any {
  let newObj: any = obj;
  if (obj instanceof Map) {
    return Object.fromEntries(obj);
  }
  if (obj instanceof Object) {
    newObj = {};
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = values[i];
      newObj[key] = cloneToObject(value);
    }
  }
  if (obj instanceof Array) {
    newObj = [];
    for (let i = 0; i < obj.length; i++) {
      newObj[i] = cloneToObject(obj[i]);
    }
  }
  return newObj;
}

/**获取mac地址信息 */
export const getMacAddress = function (): string {
  const interfaces = networkInterfaces();
  let macAddress = "";
  for (const interfaceName of Object.keys(interfaces)) {
    const interfaceInfos = interfaces[interfaceName];

    if (interfaceInfos) {
      for (const interfaceInfo of interfaceInfos) {
        if (interfaceInfo.mac && interfaceInfo.mac !== "00:00:00:00:00:00") {
          macAddress = interfaceInfo.mac;
          break;
        }
      }
    }

    if (macAddress.length > 0) break;
  }

  return macAddress;
};

export default {
  getParamFromUrl,
  stringify,
  cloneToObject,
  message,
  getMacAddress,
  getUrlParam,
};
