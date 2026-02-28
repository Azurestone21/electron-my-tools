import { ipcRenderer } from 'electron'

export default {
  selectFile: (fileType: string) => ipcRenderer.invoke('selectFile', fileType),
  transform: (filePath: any[]) => ipcRenderer.invoke('transform', filePath),
  startTranscodeTask: (inputPath: string) => ipcRenderer.invoke('startTranscodeTask', inputPath),
  getTranscodeTask: (taskId: string) => ipcRenderer.invoke('getTranscodeTask', taskId),
  cancelTranscodeTask: (taskId: string) => ipcRenderer.invoke('cancelTranscodeTask', taskId),
  deleteTranscodeTask: (taskId: string) => ipcRenderer.invoke('deleteTranscodeTask', taskId),
  checkFileExists: (filePath: string) => ipcRenderer.invoke('checkFileExists', filePath),
  onTranscodeProgress: (callback: (progress: any) => void) => {
    const listener = (_event: any, progress: any) => callback(progress)
    ipcRenderer.on('transcode-progress', listener)
    return () => ipcRenderer.removeListener('transcode-progress', listener)
  }
}
