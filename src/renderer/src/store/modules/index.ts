import { IAppSettings, IPageStack } from '@share/types/global'
import { isObject } from 'lodash'

export const useIndexStore = defineStore('index', {
  state: () => ({
    appSettingsVisible: false,
    appSettings: {
      theme: 'light'
    } as IAppSettings,
    location: null,
    city: null,
    todayWeather: {},
    pageStack: [] as IPageStack[], // 路由栈
    remark: [] // 备注
  }),
  getters: {},

  actions: {
    setStore(payload) {
      let keys = Object.keys(payload)
      keys.forEach((item) => {
        if (isObject(payload[item])) {
          this[item] =
            Object.keys(payload[item]).length > 0
              ? Object.assign({}, this[item], payload[item])
              : payload[item]
        } else {
          this[item] = payload[item]
        }
      })
    },
    // 路由
    setPage(route: IPageStack[]) {
      this.pageStack = route
    },
    pushPage(route: IPageStack) {
      this.pageStack.push(route)
    },
    popPage() {
      this.pageStack.pop()
    },
    clearPage() {
      this.pageStack = []
    },
    setAppSettings(setting: IAppSettings) {
      this.appSettings = setting
    }
  },
  persist: true // 持久化
})
