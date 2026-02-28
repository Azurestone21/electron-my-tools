import { createPinia } from 'pinia' // Vue 状态管理库
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist)

export default pinia

export * from './modules/index'
export * from './modules/user'
export * from './modules/music'
export * from './modules/tool'
export * from './modules/video'
export * from './modules/transcodeTask'
export * from './modules/transcodeConfig'
