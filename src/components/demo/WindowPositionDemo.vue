<template>
  <div class="mockDemo">
    <GoBack></GoBack>
    <ul>
      <li>
        <el-input v-model="windowKey" placeholder="输入windowKey" style="width: 200px;"></el-input>
      </li>
      <li>
        <el-form inline>
          <el-form-item label="距离左边距离">
            <el-input v-model="x"></el-input>
          </el-form-item>
          <el-form-item label="距离上边距离">
            <el-input v-model="y"></el-input>
          </el-form-item>
          <el-form-item label="距离左边偏移量">
            <el-input v-model="offsetX"></el-input>
          </el-form-item>
          <el-form-item label="距离上边偏移量">
            <el-input v-model="offsetY"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              @click="
                changeWindowPosition({
                  x: Number.parseFloat(x),
                  y: Number.parseFloat(y),
                  offsetX: Number.parseFloat(offsetX),
                  offsetY: Number.parseFloat(offsetY),
                  windowKey,
                })
              "
              >移动位置</el-button
            >
          </el-form-item>
        </el-form>
      </li>
      <li>
        <el-button
          @click="
            changeWindowPosition({
              position: 'top-left',
              offsetX: Number.parseFloat(offsetX),
              offsetY: Number.parseFloat(offsetY),
              windowKey,
            })
          "
          >左上</el-button
        >
        <el-button
          @click="
            changeWindowPosition({
              position: 'top-right',
              offsetX: Number.parseFloat(offsetX),
              offsetY: Number.parseFloat(offsetY),
              windowKey,
            })
          "
          >右上</el-button
        >
      </li>
      <li>
        <el-button
          @click="
            changeWindowPosition({
              position: 'center',
              offsetX: Number.parseFloat(offsetX),
              offsetY: Number.parseFloat(offsetY),
              windowKey,
            })
          "
          >居中</el-button
        >
      </li>
      <li>
        <el-button
          @click="
            changeWindowPosition({
              position: 'bottom-left',
              offsetX: Number.parseFloat(offsetX),
              offsetY: Number.parseFloat(offsetY),
              windowKey,
            })
          "
          >左下</el-button
        >
        <el-button
          @click="
            changeWindowPosition({
              position: 'bottom-right',
              offsetX: Number.parseFloat(offsetX),
              offsetY: Number.parseFloat(offsetY),
              windowKey,
            })
          "
          >右下</el-button
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { changeWindowPosition } from "@/utils/electronUtils";
import { ref } from "vue";
const x = ref("0");
const y = ref("0");
const offsetX = ref("0");
const offsetY = ref("0");
const windowKey = ref("");
</script>

<style scoped>
ul {
  list-style: none;
}
</style>
