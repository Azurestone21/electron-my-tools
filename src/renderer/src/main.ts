import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css' //引入element-plus 样式
import ElementPlus from 'element-plus' //完整引入
import router from '@renderer/router';  // 路由
import pinia from './store'; // 引入pinia状态管理
import mitt from 'mitt'; // 引入mitt事件总线
const app = createApp(App)

// 全局注册所有icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 事件总线
app.config.globalProperties.$eventBus = mitt()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
