<template>
  <el-menu
    :default-active="$route.path"
    class="el-menu-vertical-demo"
    :router="true"
    :collapse="true"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><user /></el-icon>
        <span>用户</span>
      </template>
      <el-menu-item-group>
        <template #title><span>Group One</span></template>
        <el-menu-item ><router-link to="/login">退出登录</router-link></el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-menu-item index="/index">
      <el-icon ><icon-menu /></el-icon>
      <template #title>首页</template>
    </el-menu-item>
    <el-menu-item index="/hello">
      <el-icon><document /></el-icon>
      <template #title>案例1</template>
    </el-menu-item>
    <el-menu-item index="/form">
      <el-icon><histogram /></el-icon>
      <template #title>表单</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>

import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
  User,
  Histogram
} from "@element-plus/icons-vue";

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

watch: {}
</script>
