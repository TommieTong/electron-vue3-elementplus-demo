<template>
  <div
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @mousedown="mousedown"
    @mouseup="mouseup"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import electronUtils from "@/utils/electronUtils";
// 鼠标进入判断，只有鼠标进入到范围内，才能进行鼠标按压拖拽
let enterFlag = false;
// 鼠标按压判断，只有鼠标进入范围内，并且按压状态，此时释放鼠标才会关闭窗口移动
let mousedownFlag = false;
let timer: NodeJS.Timeout | null;

/**鼠标按压 */
function mousedown() {
  if (enterFlag) {
    electronUtils.windowMove(true);
    mousedownFlag = true;
  }
}

/**鼠标释放 */
function mouseup() {
  if (enterFlag && mousedownFlag) {
    electronUtils.windowMove(false);
    mousedownFlag = false;
  }
}

/**鼠标移入 */
function mouseenter() {
  enterFlag = true;
}

/**鼠标移出 */
function mouseleave() {
  enterFlag = false;
  // 避免卡顿的情况下，鼠标滑出移动范围，但窗口仍跟随鼠标移动
  if (timer !== null) {
    timer = setTimeout(() => {
      mousedownFlag = false;
      electronUtils.windowMove(false);
      timer = null;
    }, 1000);
  }
}
</script>

<style scoped lang="scss"></style>
