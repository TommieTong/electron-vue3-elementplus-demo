import themeDarkConfig from "@/styles/json/theme-dark.json";
import themeLightConfig from "@/styles/json/theme-light.json";
import cacheUtils from "@/utils/cacheUtils";
import { ipcRenderer } from "electron";
import { useAppStore } from "@/store/modules/appStore";

/**主题前缀 */
export const keyThemePrefix = "theme_";

/**主题模式 枚举 */
export const enum themeModeEnum {
  dark = "dark",
  light = "light",
}

/**主题map，方便在主题切换组件中取值 */
export const themeModeMap = new Map<string, string>([
  [themeModeEnum.dark, "暗色主题"],
  [themeModeEnum.light, "亮色主题"],
]);

/**
 * 设置样式属性
 * @param key 样式名
 * @param value  样式值
 */
function setStyleProperty(key: string, value: string) {
  document.getElementsByTagName("body")[0].style.setProperty(key, value);
}
/**
 * 从缓存或默认json样式配置中全局设置样式变量
 */
export const initTheme = () => {
  // 从缓存中取出当前主题模式，默认为 light模式
  themeChange(
    cacheUtils.get(keyThemePrefix + "mode") || themeModeEnum.light,
    false
  );

  // 监听主进程通知样式修改时，同步窗口更新样式
  ipcRenderer.on("theme-style:changed", (event, mode: string) => {
    // 有mode说明是走主题切换
    if (mode) {
      /// 必须指定electron不同步，不然会循环调用
      themeChange(mode, false);
    } else {
      // 没有传mode，则是用户自定义样式修改，此时只修改本地存储的样式
      // 取到所有样式的key 和value
      const styleKeys = Object.keys(themeLightConfig);
      for (const styleKey of styleKeys) {
        const styleValue: string = cacheUtils.get(keyThemePrefix + styleKey);
        if (styleValue) {
          /// 设置样式
          setStyleProperty(styleKey, styleValue);
        }
      }
    }
  });
};

/**
 * 切换主题模式
 * @param mode 主题模式
 * @param electronChange 窗口是否需要同步修改 默认需要
 */
export function themeChange(mode: string, electronChange = true) {
  // app状态管理
  const appStore = useAppStore();
  // 设置主题状态
  appStore.theme = mode;
  // 设置缓存为对应主题
  cacheUtils.set(keyThemePrefix + "mode", mode);
  // 通知主进程告诉其他窗口同步修改主题样式
  if (electronChange) {
    ipcRenderer.invoke("theme-style:change", mode);
  }

  // 取到对应主题的json配置
  let themeConfig;
  switch (mode) {
    case themeModeEnum.dark:
      themeConfig = themeDarkConfig;
      break;
    // 补充任意个自定义主题色.......
    default:
      themeConfig = themeLightConfig;
      break;
  }

  // 取到所有样式的key 和 value
  const styleKeys = Object.keys(themeConfig);
  const styleValues = Object.values(themeConfig);

  // 遍历设置全局scss变量的样式
  for (let i = 0; i < styleKeys.length; i++) {
    const styleKey = styleKeys[i];
    /// 走缓存或json配置的默认值
    const styleValue: string =
      cacheUtils.get(keyThemePrefix + styleKey) || styleValues[i];
    /// 设置样式
    setStyleProperty(styleKey, styleValue);
  }
}

/**
 * 修改全局样式的值
 * @param param scss定义的样式名称，参考 {src\styles\variables.scss}
 * @param value 样式值
 */
export function styleChange(param: string, value: string) {
  // 修改页面的变量
  setStyleProperty(param, value);

  // 修改缓存值
  cacheUtils.set(keyThemePrefix + param, value);
}

export default {
  themeChange,
  initTheme,
  styleChange,
  keyThemePrefix,
};
