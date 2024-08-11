import { createI18n } from "vue-i18n";
import en from "./packages/en";
import zhCn from "./packages/zh-cn";
import jp from "./packages/jp";
import cacheUtils from "@/utils/cacheUtils";
import { useAppStore } from "@/store/modules/appStore";
import { ipcRenderer } from "electron";

// 初始化i18n
const i18n = createI18n({
  legacy: false, // 解决Not available in legacy mode报错
  globalInjection: true, // 全局模式，可以直接使用 $t
  locale: cacheUtils.get("lang") || "zhCn", // 从本地缓存中取语言，如果没有 默认为中文
  fallbackLocale: "en", // set fallback locale
  messages: {
    en,
    zhCn,
    jp
  },
});

export default i18n;

// 初始化语言监听
export function initLangListener() {
  const appStore = useAppStore();
  // 监听语言切换时，同步本窗口更新
  ipcRenderer.on("lang:change", (event, lang: string) => {
    i18n.global.locale.value = lang;
    appStore.lang = lang;
  });
}
