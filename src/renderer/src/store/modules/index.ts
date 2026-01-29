import { isObject } from "lodash"

export const useIndexStore = defineStore('index', {
  state: () => ({
    location: null,
    city: null,
    todayWeather: {},

    pageStack: [], // 路由栈

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
    setPage(route) {
      this.pageStack = route
    },
    pushPage(route) {
      this.pageStack.push(route)
    },
    popPage() {
      this.pageStack.pop()
    },
    clearPage() {
      this.pageStack = []
    }
  },
  persist: true // 持久化
})
