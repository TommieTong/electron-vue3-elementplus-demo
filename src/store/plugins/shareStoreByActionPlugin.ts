import { ipcRenderer } from "electron";
import cacheUtils from "@/utils/cacheUtils";
import { PiniaPluginContext } from "pinia";

// 设置本地store缓存的key
const STORE_CACHE_KEY_PREFIX = "store_";

declare module "pinia" {
  export interface PiniaCustomProperties {
    // 通知主进程让所有窗口同步pinia的状态
    stateSync(): void;
  }
}

// 处理electron多窗口，pinia共享问题
export function shareStorePlugin({ store }: PiniaPluginContext) {
  // 初始化本地缓存版本
  const storeName: string = store.$id;
  // 初始化store
  initStore(store);
  // 重写状态同步方法
  store.stateSync = () => {
    updateStoreSync(stringify(store.$state), storeName);
  };

  // 监听数据同步修改
  ipcRenderer.on(
    "pinia-store-set",
    (event, targetStoreName: string, jsonStr: string) => {
      console.log("被动更新哦");
      // 监听到状态改变后，同步更新状态
      if (storeName === targetStoreName) {
        // 补充版本号是否重置标识
        console.log("被动更新状态:" + storeName);

        const obj = JSON.parse(jsonStr);
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        /// 更新各个key对应的值的状态
        for (let i = 0; i < keys.length; i++) {
          changeState(store.$state, keys[i], values[i]);
        }
      }
    }
  );
}

/**
 * 状态更新同步
 * @param stateJsonStr 序列化的状态修改字符串
 * @param storeName  修改的状态的名称
 */
function updateStoreSync(stateJsonStr: string, storeName: string) {
  // 通知主线程更新
  ipcRenderer.invoke("pinia-store-change", storeName, stateJsonStr);

  // 更新本地缓存的store
  cacheUtils.set(STORE_CACHE_KEY_PREFIX + storeName, stateJsonStr);
}

/**
 * 修改state的值
 * 补充 如果反序列化的字段是map类型，需要额外处理
 */
function changeState(state: any, key: any, value: any) {
  if (state[key] instanceof Map) {
    if (value instanceof Array) {
      state[key] = new Map(value);
    } else {
      state[key] = new Map(Object.entries(value as object));
    }
  } else {
    state[key] = value;
  }
}

/**
 * 初始化状态对象
 * @param store
 */
function initStore(store: any) {
  const cacheKey = STORE_CACHE_KEY_PREFIX + store.$id;
  // 从本地缓存中读取store的值
  const stateJsonStr = cacheUtils.get(cacheKey);
  if (stateJsonStr) {
    const stateCache = JSON.parse(stateJsonStr);
    const keys = Object.keys(stateCache);
    const values = Object.values(stateCache);

    /// 更新各个key对应的值的状态
    for (let i = 0; i < keys.length; i++) {
      changeState(store.$state, keys[i], values[i]);
    }
  }
}

/**
 * 2023/07/03 自定义序列化方式， 处理ts中map类型/对象序列化后为 {} 的情况
 */
function stringify(obj: any): string {
  return JSON.stringify(cloneToObject(obj));
}

// 将字段包含map的对象转为json对象的格式
function cloneToObject(obj: any): any {
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
