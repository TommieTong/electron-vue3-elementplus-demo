<template>
  <drag-tool>
    <div class="drag-box">拖拽区域</div>
  </drag-tool>
  <h1>{{ $t(langMap.app_title) }} 当前计数为：{{ counterStore.counter }}</h1>
  <div>
    <el-select
      v-model="windowPath"
      value-key=""
      placeholder="输入路由地址"
      clearable
      filterable
      style="width: 200px"
    >
      <el-option
        v-for="path in routerPaths"
        :key="path"
        :label="path"
        :value="path"
      >
      </el-option>
    </el-select>
    <el-input
      v-model="windowKey"
      placeholder="输入新建窗口的key"
      style="width: 200px"
    ></el-input>
    <el-button @click="openWindow">新建窗口</el-button>
  </div>
  <div class="demo-link-box">
    <h3>Demo演示</h3>
    <ul class="demo-link">
      <li><router-link to="/hello">路由跳转helloworld页</router-link></li>
      <li><router-link to="/demo/mockDemo">mockjs案例</router-link></li>
      <li><router-link to="/demo/mockApiDemo">前端模拟接口</router-link></li>
      <li><router-link to="/demo/sassDemo">sass使用演示</router-link></li>
      <li><router-link to="/demo/themeDemo">主题切换演示</router-link></li>
      <li><router-link to="/demo/ipcDemo">ipc通信演示</router-link></li>
      <li>
        <router-link to="/demo/windowPositionDemo">窗口位置修改</router-link>
      </li>
    </ul>
  </div>
  <div class="demo-link-box">
    <h3>功能演示</h3>
    <ul class="demo-link">
      <li>切换语言：<Language></Language></li>
      <li>切换主题：<ThemeSwitch></ThemeSwitch></li>
      <li><el-button @click="eventBroadcast">测试事件广播</el-button></li>
      <li><el-button @click="decoratorTest">测试装饰器</el-button></li>
      <li><el-button @click="piniaTestWindow">pinia状态同步演示</el-button></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCounterStore } from "@store/counterStore";
import { ref } from "vue";
import electronUtils from "@/utils/electronUtils";
import langMap from "@/locales/langMap";
import myUtils from "@/utils/myUtils";
import { ipcRenderer } from "electron";

const counterStore = useCounterStore();
const router = useRouter();
const windowKey = ref("");

console.log("mac地址为：", myUtils.getMacAddress());

const windowPath = ref("/hello");
const routerPaths = ref<string[]>([]);
// 取到所有的路径
routerPaths.value = router.getRoutes().map((item) => item.path);

function openWindow() {
  electronUtils.createWindow({
    route: windowPath.value,
    key: windowKey.value,
    param: JSON.stringify({
      message: "向你问个好~~",
    }),
  });

  // electronUtils.openWindow(windowPath.value, {
  //   message: "向你问个好~~",
  // });
}

let lzp = {
  name: "lzp",
  likes: {
    sports: new Map<string, string>([
      ["k1", "v1"],
      ["k2", "v2"],
    ]),
  },
  game: new Map<string, string>([
    ["kk1", "vv1"],
    ["kk2", "vv2"],
  ]),
};

console.log("自定义工具类进行序列化");
console.log(myUtils.stringify(lzp));

// 事件广播测试
function eventBroadcast() {
  electronUtils.eventBroadcast({
    channel: "test-event-broadcast",
    body: JSON.stringify({ name: "编程小龙", value: "hello" }),
  });
}

// 测试装饰器
function decoratorTest() {
  ipcRenderer.invoke("gogo", 99);
}

// 测试pinia状态同步
function piniaTestWindow(){
  electronUtils.createWindow({
    route: "/demo/piniaTest",
  });
  electronUtils.createWindow({
    route: "/demo/piniaTest",
  });
}

</script>

<style scoped lang="scss">
.drag-box {
  width: 200px;
  height: 50px;
  border: 1px solid #ccc;
  background: pink;
  margin: 0 auto;
  user-select: none;
  &:hover {
    cursor: grab;
  }
}
h1 {
  // color: $primaryColor;
}
ul {
  list-style: none;
}
.demo-link-box {
  border: 1px solid #ccc;
  h3 {
    // color: $primaryColor;
  }
  .demo-link {
    display: flex;
    flex-wrap: wrap;
    li {
      width: 33%;
      box-sizing: border-box;
      text-align: left;
    }
  }
}
</style>
