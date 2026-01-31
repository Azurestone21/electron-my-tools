import { IPlayingSong } from '@renderer/types/music'
import { isObject } from "lodash"

export const useMusicStore = defineStore('music', {
  state: () => ({
    basePath: '', // 音乐根目录
    musicList: [] as IPlayingSong[], // 音乐列表
    playingSong: {} as IPlayingSong, // 当前播放音乐
    duration: 0, // 音频时长
    currentTime: 0, // 当前播放事件
    isPlay: false, // 是否正在播放
    playPattern: 'normal', // normal:顺序播放 loop:单曲循环
    volume: 0.05 // 音量
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
    // 修改播放模式
    changePlayPattern() {
      let arr = ['normal', 'loop']
      let i = arr.findIndex((x) => x == this.playPattern)
      if (i < arr.length - 1) {
        this.playPattern = arr[i + 1]
      } else {
        this.playPattern = arr[0]
      }
    }
  },
  persist: true // 持久化
})
