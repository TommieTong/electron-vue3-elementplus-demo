/** 一些全局的对象补充声明 */
export {};
declare global {
  // 通用事件对象
  interface EventInfo {
    channel: string; // 对应渲染层监听管道
    body: string; // JSON序列化后的消息内容
  }

  // 窗口创建参数规范
  interface IWindowConfig {
    key?: string; // 窗口唯一key，不传则取窗口的id，假如已存在该key则聚焦该窗口
    route?: string; // 窗口路由
    width?: number; // 窗口宽度
    height?: number; // 窗口高度
    param?: string; // 传递参数，新窗口打开时能直接从路由中获取，拼接url传递，推荐只传小数据
  }

  /**
   * ================= 窗口定位相关参数 ================
   */
  /** 自定义定位类型 */
  type MyPosition =
    | "center" // 居中
    | "bottom-left" // 左下
    | "bottom-right" // 右下
    | "top-right" // 右上
    | "top-left"; // 左上

  /**
   * 注意，这里指的屏幕是当前窗口所在的屏幕【存在多个屏幕的情况下】
   */
  interface IWindowPosition {
    windowKey?:string; // 窗口的key，不传就是修改本窗口的位置
    x?: number; // 屏幕左上角开始x轴位置
    y?: number; // 屏幕左上角开始y轴位置
    relativeWindowId?: number; // 相对于某个窗口的位置/默认相对于屏幕
    position?: MyPosition; // 相对于屏幕或窗口的位置
    offsetX?: number; // X轴偏移量
    offsetY?: number; // Y轴偏移量
  }
}
