<template>
  <div class="box">
    <GoBack></GoBack>
    <h1 class="header">sass基础使用演示</h1>
    <div class="body"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
// 定义变量
$hoverColor: pink;
$imgDir: "@/assets/imgs";

// 嵌套样式
.box {
  .header {
    color: green;

    // 引用父级元素
    &:hover {
      color: $hoverColor;
      cursor: pointer;
    }
  }
  .body {
    height: 300px;
    // 拼接变量
    background: url("#{$imgDir}/test.jpeg") center center;
    background-size: cover;
  }
}
</style>
