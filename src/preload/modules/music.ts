import { ipcRenderer } from 'electron'

export default {
  getMusicData: (basePath: string) => ipcRenderer.invoke('getMusicList', basePath),
  getLyric: (filePath: string) => ipcRenderer.invoke('getLyric', filePath),
  onHandleMusicPlay: (callback) =>
    ipcRenderer.on('handleMusicPlay', (_event, value) => callback(value)),

  // 桌面歌词相关
  createLyricDesktop: () => ipcRenderer.invoke('createLyricDesktop'),
  toggleLyricDesktop: () => ipcRenderer.invoke('toggleLyricDesktop'),
  sendLyricData: (lyricData: any[], currentTime: number, isPlaying: boolean) =>
    ipcRenderer.invoke('sendLyricData', lyricData, currentTime, isPlaying),
  sendPlayStatus: (currentTime: number, isPlaying: boolean) =>
    ipcRenderer.invoke('sendPlayStatus', currentTime, isPlaying),
  // 移动桌面歌词窗口
  moveLyricDesktopWindow: (position: { x: number; y: number }) =>
    ipcRenderer.invoke('moveLyricDesktopWindow', position),
  onUpdateLyricData: (callback) =>
    ipcRenderer.on('updateLyricData', (_event, data) => callback(data)),
  onUpdatePlayStatus: (callback) =>
    ipcRenderer.on('updatePlayStatus', (_event, data) => callback(data)),
  offUpdateLyricData: () => ipcRenderer.removeAllListeners('updateLyricData'),
  offUpdatePlayStatus: () => ipcRenderer.removeAllListeners('updatePlayStatus'),

  // 音量相关
  changeVolume: (volume: number) => ipcRenderer.invoke('changeVolume', volume),
  onUpdateVolume: (callback: (volume: number) => void) =>
    ipcRenderer.on('updateVolume', (_event, volume) => callback(volume))
}
