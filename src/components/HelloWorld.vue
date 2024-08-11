<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCounterStore } from "@store/counterStore";
import langMap from "@/locales/langMap";
import { loginApi } from "@api/auth";
import { onMounted, ref, reactive, onUnmounted } from "vue";
import electronUtils from "@/utils/electronUtils";
import myUtils from "@/utils/myUtils";
import { ElMessage } from "element-plus";
import { ipcRenderer } from "electron";

onMounted(() => {
  const paramData = myUtils.getParamFromUrl();
  if (paramData) {
    ElMessage.success(paramData.message);
  }

  ipcRenderer.on("test-event-broadcast", eventBroadcastHandle);
  // 版本更新，下载进度回调
  ipcRenderer.on("download-progress", downloadProgressHandle);
});

// 广播事件处理
function eventBroadcastHandle(e: any, data: any) {
  console.log("监听到广播内容：");
  console.log(JSON.parse(data));
  // counterStore.myAction()
}
// 版本更新，处理下载进度回调
function downloadProgressHandle(e: any, data: any) {
  console.log(data);
}
console.log("dev独有的环境变量：" + import.meta.env.VITE_DEV_PARAM);
const counterStore = useCounterStore();

const router = useRouter();
function goBack() {
  router.back();
}

async function add100() {
  const result = await counterStore.add100();
  console.log(counterStore.messages);
}

function login() {
  loginApi({ username: "lzp", password: "666" }).then((res) => {
    console.log(res);
  });
}

const showProcess = ref(false);

/**切换process 显示/隐藏 */
function switchProcess() {
  showProcess.value = !showProcess.value;
  electronUtils.showProcess(showProcess.value);
}
interface IUserInfo {
  name: string;
  age: number;
  likes: Array<string>;
}

const userInfo = reactive<IUserInfo>({
  name: "",
  age: 18,
  likes: [],
});

userInfo.likes.push("game");

onUnmounted(() => {
  ipcRenderer.removeListener("test-event-broadcast", eventBroadcastHandle);
  ipcRenderer.removeListener("download-progress", downloadProgressHandle);
});

// 通过浏览器唤醒应用的url获取房间号
function getRoomCodeByUrl() {
  const roomCode = ipcRenderer.sendSync("get-roomCode");
  myUtils.message(`房间号为：${roomCode}`, "success");
}
</script>

<template>
  <SvgIcon
    name="renwen"
    class="myIcon"
    :size="60"
    style="color: pink"
  ></SvgIcon>
  <h1>{{ $t(langMap.app_title) }}</h1>
  <h1>
    当前的计数为：{{ counterStore.counter }} 双倍值为：{{
      counterStore.doubleCounter
    }}
  </h1>
  <ul>
    <li>
      <el-button type="success" @click="goBack">返回上一页</el-button>
    </li>
    <li>
      <el-icon size="25" color="red">
        <i-ep-edit />
      </el-icon>
    </li>
    <li>
      <el-button type="warning" @click="counterStore.counter++"
        >直接操作state去改变值</el-button
      >
    </li>
    <li>
      <el-button type="info" @click="counterStore.increment"
        >increment</el-button
      >
    </li>
    <li>
      <el-button type="success" @click="add100">异步加100</el-button>
    </li>
    <li>
      <Language></Language>
    </li>
    <li>
      <el-button type="primary" @click="login">登录请求</el-button>
    </li>
    <li>
      <el-button type="warning" @click="switchProcess">{{
        showProcess ? "关闭process" : "显示process"
      }}</el-button>
    </li>
    <li>
      <el-button @click="getRoomCodeByUrl">获取url中传来的房间号</el-button>
    </li>
    <li>
      <el-button @click="electronUtils.checkUpdate">检测版本更新</el-button>
    </li>
    <!-- 微信登录
    <wei-xin-login></wei-xin-login> -->
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
}
</style>
