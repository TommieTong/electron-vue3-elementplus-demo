<template>
  <el-dropdown @command="handleCommand">
    <span class="el-dropdown-link">
      {{ langMap.languageMap.get(currentLang) }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :command="langEntry[0]"
          :key="langEntry[0]"
          :disabled="currentLang == langEntry[0]"
          v-for="langEntry in langMap.languageMap.entries()"
          >{{ langEntry[1] }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { ArrowDown } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import langMap from "@/locales/langMap";
import cacheUtils from "@/utils/cacheUtils";
import { useAppStore } from "@/store/modules/appStore";
import { ipcRenderer } from "electron";

const appStore = useAppStore();
const i18n = useI18n();
// 计算属性获取i18n的值
const currentLang = computed(() => i18n.locale.value);

// 切换语言
function handleCommand(lang: string) {
  i18n.locale.value = lang;
  // 设置缓存的值
  cacheUtils.set("lang", lang);
  // 更新全局状态
  appStore.lang = lang;
  // 主进程通知其他窗口同步修改语言
  ipcRenderer.invoke("lang:change", lang);
}
</script>
<style scoped>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
