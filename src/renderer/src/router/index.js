import { createRouter, createWebHashHistory } from 'vue-router'
import { useIndexStore } from '@renderer/store'

const router = createRouter({
  mode: 'hash',
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '默认路径',
      redirect: '/layout'
    },
    {
      path: '/login',
      name: '登录',
      component: () => import('@renderer/pages/Login.vue')
    },
    {
      path: '/layout',
      component: () => import('@renderer/pages/Layout.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: '首页',
          component: () => import('@renderer/pages/home.vue')
        },
        {
          path: '/tool/index',
          name: '工具',
          component: () => import('@renderer/pages/toolPages/ToolMgmt.vue')
        },
        {
          path: '/tool/color',
          name: '颜色转换',
          component: () => import('@renderer/pages/toolPages/ColorChange.vue')
        },
        {
          path: '/tool/data',
          name: '数据转换',
          component: () => import('@renderer/pages/toolPages/DataChange.vue')
        },
        {
          path: '/tool/music',
          name: '音乐解码',
          component: () => import('@renderer/pages/toolPages/MusicChange.vue')
        },
        {
          path: '/tool/photoCompression',
          name: '图片压缩',
          component: () => import('@renderer/pages/toolPages/PhotoCompression.vue')
        },
        {
          path: '/music',
          name: '音乐',
          component: () => import('@renderer/pages/musicPages/musicPlay/MusicPlay.vue'),
          meta: {
            keepAlive: true
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log("router.beforeEach", to.path)
  const indexStore = useIndexStore() // 不能写在外面，会报错
  // 记录进入的路由
  let index = indexStore.pageStack.findIndex((x) => x.path == to.path)
  if (index != -1) {
    indexStore.setPage = indexStore.pageStack.splice(index + 1)
  } else {
    indexStore.pushPage({
      path: to.path,
      name: to.name
    })
  }
  next()
})

router.afterEach((to, from) => {
  // const indexStore = useIndexStore() // 不能写在外面，会报错
  // console.log("router.beforeEach 页面栈", indexStore.pageStack)
})
export default router
