import { ipcRenderer } from 'electron'
import { IScheduleItem } from '../../share/types/schedule'

export default {
  initSchedules: (schedules: IScheduleItem[]) => ipcRenderer.invoke('initSchedules', schedules),
  addSchedule: (schedule: IScheduleItem) => ipcRenderer.invoke('addSchedule', schedule),
  updateSchedule: (schedule: IScheduleItem) => ipcRenderer.invoke('updateSchedule', schedule),
  deleteSchedule: (scheduleId: string) => ipcRenderer.invoke('deleteSchedule', scheduleId)
}
