import { createPinia } from "pinia";
// import { shareStorePlugin } from "./plugins/shareStorePlugin";
import { shareStorePlugin } from "./plugins/shareStoreByActionPlugin";

const pinia = createPinia();

// 添加状态共享插件
pinia.use(shareStorePlugin);

export default pinia;
