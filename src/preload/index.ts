import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import musicApi from './modules/music'
import schedule from './modules/schedule'
import video from './modules/video'

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
    // 暴露音乐相关API
    contextBridge.exposeInMainWorld('musicApi', musicApi)
    // 暴露计划任务相关API
    contextBridge.exposeInMainWorld('scheduleHandle', schedule)
    // 暴露视频相关API
    contextBridge.exposeInMainWorld('videoHandle', video)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
