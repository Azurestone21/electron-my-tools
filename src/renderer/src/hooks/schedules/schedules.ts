import { IScheduleItem } from '@renderer/types/schedule'
import { cloneDeep } from 'lodash'
import { useToolStore } from '@renderer/store/modules/tool'
import { storeToRefs } from 'pinia'

// 初始化主进程的日程列表
export const initMainProcessSchedules = async () => {
  const toolStore = useToolStore()
  const { scheduleList } = storeToRefs(toolStore)
  const list = cloneDeep(scheduleList.value)
  await window.scheduleHandle.initSchedules(list)
}

// 添加主进程的日程列表
export const addMainProcessSchedules = async (schedule: IScheduleItem) => {
  await window.scheduleHandle.addSchedule(schedule)
}

// 更新主进程的日程列表
export const updateMainProcessSchedules = async (schedule: IScheduleItem) => {
  await window.scheduleHandle.updateSchedule(schedule)
}

// 删除主进程的日程列表
export const deleteMainProcessSchedules = async (id: string) => {
  await window.scheduleHandle.deleteSchedule(id)
}
