<template>
  <div class="weiXinLoginBox">
    <webview id="webview" :src="wxloginurl"></webview>
    <div class="qrcode" v-loading="loading">
      <img src="" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from "qrcode";
import { getUrlParam } from "@/utils/myUtils";
import { ref, onMounted } from "vue";

const emit = defineEmits(["wxloginCallback"]);
const loading = ref(true);
const wxloginurl = ref("");

// ***** 只需修改以下2个参数的值即可 *****
// 回调地址 这里其实只需要保证和微信开放平台配置的服务器域名一致即可，地址随便填，因为我们真正要取到的是回调的code
const webviewUrl = encodeURIComponent(`服务器回调地址`);
const appId = "";
// 可由后端生成，用做安全校验，微信回调会返回这个值
const state = Math.random().toString().slice(2);

// 拼接微信登录请求地址
wxloginurl.value = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${webviewUrl}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

// 获取微信登录的二维码
onMounted(() => {
  const webview = document.querySelector("webview") as any;
  webview.addEventListener("dom-ready", (e: any) => {
    console.log("webview加载完毕~~");
    webview
      .executeJavaScript(`document.querySelector('.qrcode').outerHTML`)
      .then((res: any) => {
        const uuid = res?.match(/src="\/connect\/qrcode\/(\S*)">/)[1];
        const qrCodeUrl = `https://open.weixin.qq.com/connect/confirm?uuid=${uuid}&chInfo=ch_share__chsub_CopyLink`;
        console.log("qrcodeUrl", qrCodeUrl);
        QRCode.toDataURL(qrCodeUrl, (err: any, url: string) => {
          loading.value = false;
          if (err) return;
          // 这里的url就是要显示在真实页面上的二维码了
          const img = document.querySelector("img");
          if (img) {
            img.src = url;
          }
        });
      });
  });

  // 微信扫码后的webView跳转监听
  webview.addEventListener("will-navigate", (e: any) => {
    console.log(
      "监听到用户扫码后的webView跳转，得到的登录code为",
      getUrlParam(e.url, "code")
    );
    loading.value = true;
    // 将得到的code返回给父组件
    emit("wxloginCallback", getUrlParam(e.url, "code"));
  });
});
</script>

<style scoped lang="scss">
.weiXinLoginBox {
  width: 100%;
  #webview {
    height: 0;
  }
  .qrcode {
    width: 200px;
    height: 200px;
    margin: 0 auto;

    img {
      width: 100%;
      height: 100%;
      margin: auto;
    }
  }
}
</style>
