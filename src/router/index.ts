import { createRouter, createWebHashHistory } from "vue-router";
import { isLoggedIn } from "@/utils/myUtils";

const router = createRouter({
  //  hash 模式。
  mode: "hash",
  history: createWebHashHistory(),
  routes: [
    // 设置首页
    {
      path: "/index",
      component: () => import("../components/demo/Index.vue"),
        /* G_IS_BUILD // 区分生产与正式环境的主页
          ? import("../components/HelloWorld.vue")
          : import("../components/demo/Index.vue"),  */
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import("../components/Login/Login.vue"),
      meta: { hideSide: true } // 标记此路由不需要侧边栏
    },
    // 配置helloworld页的路径
    {
      path: "/hello",
      component: () => import("../components/HelloWorld.vue"),
      // meta: { requiresAuth: true } // 标记此路由需要认证
    },
    /** ================= 放置各种操作的demo ============== */
    {
      path: '/form',
      name: 'Form',
      component: () => import("../components/Form/Form.vue"),
    },
    {
      path: "/demo",
      component: () => import("../components/demo/Index.vue"),
    },
    {
      path: "/demo/mockDemo",
      component: () => import("../components/demo/MockDemo.vue"),
    },
    {
      path: "/demo/mockApiDemo",
      component: () => import("../components/demo/MockApiDemo.vue"),
    },
    {
      path: "/demo/sassDemo",
      component: () => import("@/components/demo/SassDemo.vue"),
    },
    {
      path: "/demo/themeDemo",
      component: () => import("@/components/demo/ThemeDemo.vue"),
    },
    {
      path: "/demo/piniaTest",
      component: () => import("@/components/demo/PiniaTest.vue"),
    },
    {
      path: "/demo/ipcDemo",
      component: () => import("@/components/demo/ipcDemo.vue"),
    },
    {
      path: "/demo/windowPositionDemo",
      component: () => import("@/components/demo/WindowPositionDemo.vue"),
    },
  ],
});

// 导航守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要认证
  if (to.meta && to.meta.requiresAuth) {
    // 检查用户是否已登录
    if (!isLoggedIn()) {
      // 未登录，重定向到登录页
      console.log('未登录，重定向到登录页');
      
      next({ name: 'Login' })
    } else {
      // 已登录，继续前往目标页面
      next()
    }
  } else {
    // 不需要认证，直接前往目标页面
    next()
  }
})

export default router;
