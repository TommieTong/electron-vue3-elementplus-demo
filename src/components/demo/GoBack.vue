<!-- 封装按钮，点击返回上一级页面 -->
<template>
  <el-button @click="goBack" type="success">
    <slot>返回</slot>
  </el-button>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
let router = useRouter();
/// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped></style>
