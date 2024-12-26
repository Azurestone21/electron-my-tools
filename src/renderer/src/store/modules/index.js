import { defineStore } from 'pinia'
import { isObject } from '@renderer/utils/index'

export const useIndexStore = defineStore('index', {
  state: () => ({
    location: null,
    city: null,
    todayWeather: {},
    pageStack: [], // 路由栈

    basePath: '',
    musicList: [],
    playingSong: {},
    currentTime: 0,
    isVideoPlay: false,
    playPattern: 'normal', // normal:顺序 loop:单曲循环

    remark: []
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },

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
    },
    // 修改播放模式
    changePlayPattern() {
      let arr = ['normal', 'loop']
      let i = arr.findIndex((x) => x == this.playPattern)
      if (i < arr.length - 1) {
        this.playPattern = arr[i + 1]
      } else {
        this.playPattern = arr[0]
      }
    },
    // 备注
    handleRemark(type, index) {
      if (type == 'plus') {
        this.remark.push('')
      } else {
        this.remark.splice(index, 1)
      }
    }
  },
  persist: true // 持久化
})
