import {ipcMain} from 'electron';

/**
 * 实验性功能，给类的方法添加上该注解，可自动生成对应方法名的主进程handle，并把参数返回
 * @param {string} customChannel 自channel的名称，如果没有值，则取对应的方法名
 * @example
 * class Person {
 *   // @IpcMainListenerDecorator("lzp666") //  会创建一个channel名为 lzp666的handle 
 *   @IpcMainListenerDecorator() // 会创建一个channel名 gogo的handle
 *   gogo(_,age:number) {
 *     console.log(age);
 *   }
 * }
 */
export const IpcMainListenerDecorator = (customChannel?: string): MethodDecorator => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    // 取该方法名作为channel名，监听渲染进程的通信事件
    ipcMain.handle(customChannel ?? propertyKey.toString(), (...args: any[]) => {
      return originalMethod.apply(this, args);
    });
    return descriptor;
  };
};