<template>
  <div class="box">
    <GoBack></GoBack>
    <h1>多主体一键切换</h1>
    <ul>
      <li>
        <a href="">这是一个a链接</a>
      </li>
      <li>
        <el-button type="primary">element的primary按钮</el-button>
      </li>
      <li>
        <ThemeSwitch></ThemeSwitch>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.box {
  height: 100%;
  width: 100%;
  background-color: $backgroundColor;
  // color: $textColor;
  h1 {
    // color: $primaryColor;
  }
  a {
    color: $linkColor;
  }
}
</style>
