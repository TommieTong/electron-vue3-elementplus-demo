import { ipcRenderer } from "electron";
import cacheUtils from "@/utils/cacheUtils";
import { PiniaPluginContext } from "pinia";

// 预设本地store版本缓存时间为50s  实际开发中可以设置很大，缓存时间的限制，目的是为了让版本归零，避免自增超过上限
const STORE_CACHE_TIME = 50;
// 设置本地store缓存的key
const STORE_CACHE_KEY_PREFIX = "store_";
const STORE_CACHE_VERSION_KEY_PREFIX = STORE_CACHE_KEY_PREFIX + "version_";
// 2023/5/19 补充版本号重置的判断，解决版本号重置后，多个窗口 都与缓存版本一致，同时触发ipc调用，导致死循环的BUG
let isResetVersion = false;
// 2023/07/03 补充是否能主动更新判断，解决多窗口高频率同时触发ipc调用，导致死循环的BUG
let canUpdate = true;

declare module "pinia" {
  export interface PiniaCustomProperties {
    storeUpdateVersion: number; // 标记store变更的版本
  }
}

/**获取本地缓存的store的修改版本 */
function getLocalStoreUpdateVersion(storeCacheKey: string) {
  let currentStoreUpdateVersion: number = cacheUtils.get(storeCacheKey);
  // 如果本地没有，就初始化一个
  if (
    currentStoreUpdateVersion === null ||
    currentStoreUpdateVersion === undefined
  ) {
    currentStoreUpdateVersion = 0;
    cacheUtils.set(storeCacheKey, currentStoreUpdateVersion, STORE_CACHE_TIME);
  }
  return currentStoreUpdateVersion;
}

// 处理electron多窗口，pinia共享问题
export function shareStorePlugin({ store }: PiniaPluginContext) {
  // 初始化本地缓存版本
  const storeName: string = store.$id;
  /// 缓存key
  const storeCacheVersionKey = STORE_CACHE_VERSION_KEY_PREFIX + storeName;
  let currentStoreUpdateVersion: number =
    getLocalStoreUpdateVersion(storeCacheVersionKey);
  // 初始化同步store版本
  store.storeUpdateVersion = currentStoreUpdateVersion;

  // 初始化store
  initStore(store);

  // 监听数据变化
  store.$subscribe(() => {
    // 获取本地存储的最新状态
    currentStoreUpdateVersion = cacheUtils.get(storeCacheVersionKey);
    /// 如果本地缓存过期，则重置一个缓存，并且通知主进程让其他窗口更新状态
    if (
      currentStoreUpdateVersion === null ||
      currentStoreUpdateVersion === undefined
    ) {
      currentStoreUpdateVersion = 0;
      store.storeUpdateVersion = currentStoreUpdateVersion;
      console.log(`主动更新 ${storeName} 的状态`);

      // 主动更新
      updateStoreSync(
        stringify(store.$state),
        storeName,
        store.storeUpdateVersion,
        true
      );
    } else {
      // 如果版本一致，则增加版本号，且更新本地存储版本 ，并且通知主线程告知其他窗口同步更新store状态
      if (store.storeUpdateVersion === currentStoreUpdateVersion) {
        if (!canUpdate) {
          canUpdate = true;
          return;
        }
        /// 补充版本号重置的判断，解决版本号重置后，多个窗口 都与缓存版本一致，同时触发ipc调用，导致死循环的BUG
        if (isResetVersion) {
          store.storeUpdateVersion = currentStoreUpdateVersion;
          isResetVersion = false;
        } else {
          store.storeUpdateVersion++;
          console.log(`主动更新 ${storeName} 的状态`);

          // 主动更新
          updateStoreSync(
            stringify(store.$state),
            storeName,
            store.storeUpdateVersion,
            false
          );
        }
      } else {
        // 如果当前store的版本大于本地存储的版本，说明本地版本重置了【过期重新创建】，此时重置store的版本
        // 如果当前store的版本小于本地存储的版本，说明是被动更新引起的state变动回调，此时仅更新版本即可
        store.storeUpdateVersion = currentStoreUpdateVersion;
        canUpdate = true;
      }
    }
  });

  // 监听数据同步修改
  ipcRenderer.on(
    "pinia-store-set",
    (
      event,
      targetStoreName: string,
      jsonStr: string,
      isReset: boolean,
      storeUpdateVersion: number
    ) => {
      console.log("被动更新哦");
      // 监听到状态改变后，同步更新状态
      if (storeName === targetStoreName) {
        // 补充版本号是否重置标识
        isResetVersion = isReset;
        console.log("被动更新状态:" + storeName);
        // 2023/07/03  会有本地存储的版本没有即时同步的情况，这里手动设置一遍 最新版本
        setStoreVersion(storeName, storeUpdateVersion);

        const obj = JSON.parse(jsonStr);
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        canUpdate = false;

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
 * @param storeUpdateVersion  状态修改的版本号
 * @param isResetVersion 是否重置了版本号
 */
function updateStoreSync(
  stateJsonStr: string,
  storeName: string,
  storeUpdateVersion: number,
  isResetVersion: boolean
) {
  // 更新本地缓存的store版本号
  setStoreVersion(storeName, storeUpdateVersion);

  // 通知主线程更新
  ipcRenderer.invoke(
    "pinia-store-change",
    storeName,
    stateJsonStr,
    isResetVersion,
    storeUpdateVersion
  );

  // 更新本地缓存的store
  cacheUtils.set(STORE_CACHE_KEY_PREFIX + storeName, stateJsonStr);
}

/**
 * 更新本地缓存的store版本号
 * @param storeName  更新的状态名称
 * @param storeUpdateVersion  状态修改的版本号
 */
function setStoreVersion(storeName: string, storeUpdateVersion: number) {
  // 更新本地缓存的store版本号
  const storeCacheVersionKey = STORE_CACHE_VERSION_KEY_PREFIX + storeName;
  cacheUtils.set(storeCacheVersionKey, storeUpdateVersion, STORE_CACHE_TIME);
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
