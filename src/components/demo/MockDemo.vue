<template>
  <div class="mockDemo">
    <GoBack></GoBack>
    <h1>数据模拟demo页</h1>
    <el-button @click="refreshPage">刷新数据</el-button>
    <ul>
      <li>
        <span class="title">模拟1-10颗星星:</span>
        <span style="color: pink"> {{ starts }}</span>
      </li>
      <li>
        <span class="title">模拟3个用户:</span>
        <ul v-for="item in persons" :key="item.id" class="persion">
          <li>ID：{{ item.id }}</li>
          <li>NAME：{{ item.name }}</li>
          <li>AGE：{{ item.age }}</li>
          <li>EMAIL：{{ item.email }}</li>
        </ul>
      </li>
      <li></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus';
import Mock from 'mockjs';

// 刷新页面
function refreshPage() {
  location.reload()
}
// 随机1-10颗星星
const starts: string = Mock.mock({
  'starts|1-10': '★'
}).starts;
// 随机3个用户
const persons: [any] = Mock.mock({
  'array|3': [
    {
      id: '@id', // 随机id
      name: '@cname', // 随机中文名称
      'age|18-35': 18, // 随机年龄 18-35
      email: '@email' // 随机邮箱
    }
  ]
}).array;

console.log(Mock.mock({
  id: '@id', // 随机id
  name: '@cname', // 随机中文名称
  'age|18-35': 18, // 随机年龄 18-35
  email: '@email' // 随机邮箱
}));

</script>

<style scoped>
ul {
  list-style: none;
}

.mockDemo .title {
  font-weight: bold;
}

.mockDemo .persion {
  border-bottom: 1px solid #ccc;
}
</style>
