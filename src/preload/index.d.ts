import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown,
    myHandle: any,
    musicApi: any,
    scheduleHandle: any,
    videoHandle: any,
    formatHandle: any,
  }
}
