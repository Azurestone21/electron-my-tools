import { ElectronAPI } from '@electron-toolkit/preload'

interface VideoMetadata {
  id: number
  fileName: string
  filePath: string
  fileSize: number
  duration: number
  width: number
  height: number
  videoCodec: string
  audioCodec: string
  containerFormat: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown,
    myHandle: any,
    musicApi: any,
    scheduleHandle: any,
    videoHandle: any,
  }
}
