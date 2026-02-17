import { IScheduleItem } from '@share/types/schedule'

// 初始化主进程的日程列表
export const initSchedulesApi = async (schedules: IScheduleItem[]) => {
  await window.scheduleHandle.initSchedules(schedules)
}

// 添加主进程的日程
export const addScheduleApi = async (schedule: IScheduleItem) => {
  await window.scheduleHandle.addSchedule(schedule)
}

// 更新主进程的日程
export const updateScheduleApi = async (schedule: IScheduleItem) => {
  await window.scheduleHandle.updateSchedule(schedule)
}

// 删除主进程的日程
export const deleteScheduleApi = async (id: string) => {
  await window.scheduleHandle.deleteSchedule(id)
}
