<template>
  <div>
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="yyyy-MM-dd"
      @change="handleDateChange"
    />
    <el-table :data="tableData">
      <el-table-column prop="date" label="日期" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="address" label="地址" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 初始化数据
const dateRange = ref(['2021-09-01', '2021-09-30']);
const tableData = ref([
  {
    date: '2021-09-01',
    name: '张三',
    address: '上海市',
  },
  {
    date: '2021-09-02',
    name: '李四',
    address: '北京市',
  },
]);

// 处理日期选择器变化
function handleDateChange(dates) {
  console.log('Selected dates:', dates);
}

// 导入 Element Plus 组件
import { ElDatePicker, ElTable, ElTableColumn } from 'element-plus';

// 使用 Element Plus 的样式
import 'element-plus/dist/index.css';
</script>