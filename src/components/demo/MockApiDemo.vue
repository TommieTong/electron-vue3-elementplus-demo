<template>
  <div>
    <GoBack></GoBack>
    <h1>测试本地模拟接口</h1>
    <el-button type="info" @click="handleLogin">登录请求</el-button>
    <el-button type="success" @click="handleGetUserInfo">获取用户信息</el-button>
  </div>
</template>

<script setup lang="ts">
import { loginApi, getUserInfoApi } from '../../api/auth'
import myUtils from '../../utils/myUtils'
// 登录
function handleLogin() {
  loginApi({ username: 'xxx', password: 'xxx' }).then(res => {
    myUtils.message(`登录请求响应:=>${res.data.accessToken}`)
  })
}

// 登录
function handleGetUserInfo() {
  getUserInfoApi("xxaxxx").then(res => {
    myUtils.message(`用户信息响应：=> userId:${res.data.userId}, nickName: ${res.data.nickName},age:${res.data.nickName}}`)
  })
}

</script>

<style scoped></style>