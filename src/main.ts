import { createApp } from "vue";
import "./style.css";
import "element-plus/theme-chalk/el-message.css";
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-loading.css";
import App from "./App.vue";
import "./scripts/appInit";
import router from "./router";
import pinia from "./store";
import i18n from "./locales";
import "virtual:svg-icons-register";
import { initLangListener } from "@/locales";
import { initTheme } from "@/utils/themeUtils";

const app = createApp(App);
// main.ts

// 配置路由
app.use(router);
// 配置pinia
app.use(pinia);
// 配置国际化
app.use(i18n);

// 注入路由实例
app.provide('$router', router)
app.provide('$route', router.currentRoute)

app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
  // 初始化多语言切换监听
  initLangListener();
  // 主题色初始化
  initTheme();
});
