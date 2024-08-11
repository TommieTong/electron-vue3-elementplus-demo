<template>
  <div>
    <go-back></go-back>
    <ul>
      <li><el-button @click="eventOnTest">同步通信测试</el-button></li>
      <li><el-button @click="eventHandleTest">异步通信测试</el-button></li>
      <li><el-button @click="eventHandleOnceTest">异步通信一次</el-button></li>
      <li>
        <el-button @click="eventHandleTogeterTestClick">双向通信</el-button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from "electron";
import { onMounted, onUnmounted } from "vue";

onMounted(()=>{
  ipcRenderer.on("event-handle-togeter-test",eventHandleTogeterTest);
  ipcRenderer.on("event-from-main",eventFromMain);
});

// 同步通信测试
function eventOnTest() {
  const result = ipcRenderer.sendSync("event-on-test", "狼来了");
  console.log(result);
}

// 异步通信测试
function eventHandleTest() {
  ipcRenderer.invoke("event-handle-test", "小龙你好").then((res) => {
    console.log(res);
  });
}

// 异步通信一次
function eventHandleOnceTest() {
  ipcRenderer.invoke("event-handleOnce-test");
}

function eventHandleTogeterTestClick(){
  ipcRenderer.invoke("event-handle-togeter-test","奥利给");
}

// 双向通信测试
function eventHandleTogeterTest(e:any,data:string) {
  console.log("渲染进程监听到：",data);
}

// 来自主进程的消息
function eventFromMain(e:any,data:string){
  console.log("监听到消息",data)
}

onUnmounted(()=>{
  ipcRenderer.removeListener("event-handle-togeter-test",eventHandleTogeterTest);
  ipcRenderer.removeListener("event-from-main",eventFromMain);
});
</script>

<style scoped lang="scss"></style>
