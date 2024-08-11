import { rmSync } from "node:fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import pkg from "./package.json";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import path from "path";
// import mockServer from "vite-plugin-mock-server";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    // 动态设置全局变量，用于编译时使用的全局常量
    define: {
      G_IS_BUILD: isBuild // 用于渲染进程判断当前是否为打包环境
    },
    envDir: path.resolve(__dirname, "./env"),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@store": path.resolve(__dirname, "./src/store/modules"),
        "@api": path.resolve(__dirname, "./src/api"),
        "@globel": path.resolve(__dirname, "./globel"),
      },
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(__dirname, "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
        svgoOptions: {
          // 删除一些填充的属性
          plugins: [
            {
              name: "removeAttrs",
              params: { attrs: ["class", "data-name", "fill", "stroke"] },
            },
            // 删除样式标签
            "removeStyleElement",
          ],
        },
      }),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: "electron/main/index.ts",
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
              );
            } else {
              options.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
        {
          entry: "electron/preload/index.ts",
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined, // #332
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
      ]),
      // Use Node.js API in the Renderer-process
      renderer(),
      AutoImport({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
          // 自动导入图标组件
          IconsResolver({
            prefix: "Icon",
          }),
        ],
        dts: path.resolve(__dirname, "types/auto-imports.d.ts"),
      }),
      Components({
        resolvers: [
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ["ep"], // @iconify-json/ep 是 Element Plus 的图标库
          }),
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
        dts: path.resolve(__dirname, "types/components.d.ts"),
      }),
      Icons({
        autoInstall: true,
      }),
      // mock数据
      // mockServer({
      //   logLevel: "info",
      //   urlPrefixes: ["/api/"],
      //   mockRootDir: path.relative(__dirname, "./src/api/mock"),
      //   mockJsSuffix: ".mock.js",
      //   mockTsSuffix: ".mock.ts",
      //   noHandlerResponse404: true,
      // }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/styles/variables.scss' as *;`, // 引入全局变量文件
        },
      },
    },
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    clearScreen: false,
  };
});
