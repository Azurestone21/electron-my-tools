import { ipcMain, Notification } from 'electron'
import { IScheduleItem } from '../../share/types/schedule'

// 存储所有定时任务的定时器
const scheduleTimers: Map<string, NodeJS.Timeout> = new Map()

// 检测通知权限
const checkNotificationPermission = () => {
  return Notification.isSupported()
}

// 发送通知
export const sendScheduleNotice = (noticeParams: {
  title: string
  subtitle?: string
  body: string
}) => {
  if (!checkNotificationPermission()) {
    console.log('系统不支持通知功能')
    return
  }

  const notification = new Notification({
    ...noticeParams
  })

  notification.show()
}

// 检查时间是否匹配
const isTimeMatch = (schedule: IScheduleItem): boolean => {
  const now = new Date()
  const currentDay = now.getDay() + ''
  const currentTime = now.toTimeString().substring(0, 8) // HH:MM:SS

  // 检查星期是否匹配
  if (!schedule.week.includes(currentDay)) {
    return false
  }

  // 检查时间是否匹配
  return schedule.timeData.some((timeItem) => {
    if (timeItem.time) {
      const scheduleTime = new Date(timeItem.time).toTimeString().substring(0, 8)
      return currentTime === scheduleTime
    }
    return false
  })
}

// 处理单个日程的定时检查
const handleScheduleCheck = (schedule: IScheduleItem) => {
  if (isTimeMatch(schedule)) {
    // 发送通知
    sendScheduleNotice({
      title: schedule.name,
      body: schedule.message
    })

    // 如果是一次性日程，执行后删除
    if (schedule.frequency === '2') {
      removeSchedule(schedule.id)
    }
  }
}

// 添加或更新日程
const addOrUpdateSchedule = (schedule: IScheduleItem) => {
  // 先删除旧的定时器
  removeSchedule(schedule.id)

  // 创建新的定时器，每秒检查一次
  const timer = setInterval(() => {
    handleScheduleCheck(schedule)
  }, 1000)

  // 存储定时器
  scheduleTimers.set(schedule.id, timer)
}

// 删除日程
const removeSchedule = (scheduleId: string) => {
  const timer = scheduleTimers.get(scheduleId)
  if (timer) {
    clearInterval(timer)
    scheduleTimers.delete(scheduleId)
  }
}

// 初始化所有日程
export const initSchedules = (schedules: IScheduleItem[]) => {
  // 先清除所有旧的定时器
  clearAllSchedules()

  // 添加所有新的日程
  schedules.forEach((schedule) => {
    addOrUpdateSchedule(schedule)
  })
}

// 清除所有日程
const clearAllSchedules = () => {
  scheduleTimers.forEach((timer) => {
    clearInterval(timer)
  })
  scheduleTimers.clear()
}

// 日程管理相关的IPC事件
export const scheduleManager = () => {
  // 初始化所有日程
  ipcMain.handle('initSchedules', async (_event, schedules) => {
    initSchedules(schedules)
    return true
  })

  // 添加日程
  ipcMain.handle('addSchedule', async (_event, schedule) => {
    addOrUpdateSchedule(schedule)
    return true
  })

  // 更新日程
  ipcMain.handle('updateSchedule', async (_event, schedule) => {
    addOrUpdateSchedule(schedule)
    return true
  })

  // 删除日程
  ipcMain.handle('deleteSchedule', async (_event, scheduleId) => {
    removeSchedule(scheduleId)
    return true
  })
}
