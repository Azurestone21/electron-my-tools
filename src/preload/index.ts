import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IScheduleItem } from './types/schedule'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('myHandle', {
      login: (isLogin: boolean) => {
        ipcRenderer.send('login', isLogin)
      },
      handleScreen: (type: string) => {
        ipcRenderer.send('handleScreen', type)
      }
    })
    contextBridge.exposeInMainWorld('musicApi', {
      getMusicData: (basePath:string) => ipcRenderer.invoke('getMusicList', basePath),
      getLyric: (filePath:string) => ipcRenderer.invoke('getLyric', filePath),
      onHandleMusicPlay: (callback) => ipcRenderer.on('handleMusicPlay', (_event, value) => callback(value)),
    })

    contextBridge.exposeInMainWorld('scheduleHandle', {
      initSchedules: (schedules: IScheduleItem[]) => ipcRenderer.invoke('initSchedules', schedules),
      addSchedule: (schedule: IScheduleItem) => ipcRenderer.invoke('addSchedule', schedule),
      updateSchedule: (schedule: IScheduleItem) => ipcRenderer.invoke('updateSchedule', schedule),
      deleteSchedule: (scheduleId: string) => ipcRenderer.invoke('deleteSchedule', scheduleId),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
