import { IScheduleItem } from '@share/types/schedule'
import { isObject } from "lodash"

export const useToolStore = defineStore('tool', {
  state: () => ({
    scheduleList: [] as IScheduleItem[] // 日程
  }),
  actions: {
    addSchedule(obj: IScheduleItem) {
      this.scheduleList.push(obj)
    },
    editSchedule(obj: IScheduleItem) {
      let i = this.scheduleList.findIndex((x) => x.id === obj.id)
      this.scheduleList[i] = {
        ...obj
      }
    },
    deleteSchedule(id: string) {
      this.scheduleList = this.scheduleList.filter((x) => x.id !== id)
    },
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
    }
  },
  persist: true // 持久化
})
