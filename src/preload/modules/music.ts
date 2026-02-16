import { ipcRenderer } from 'electron'

export default {
  // getMusicData: (basePath: string) => ipcRenderer.invoke('getMusicList', basePath),
  getLyric: (filePath: string) => ipcRenderer.invoke('getLyric', filePath),

  selectAudioFile: () => ipcRenderer.invoke('selectAudioFile'),

  // 桌面歌词相关
  // 创建桌面歌词窗口
  createLyricDesktop: () => ipcRenderer.invoke('createLyricDesktop'),
  // 切换桌面歌词窗口显示状态
  toggleLyricDesktop: () => ipcRenderer.invoke('toggleLyricDesktop'),
  // 发送歌词数据到桌面歌词窗口
  sendLyricData: (lyricData: any[], currentTime: number, isPlaying: boolean) =>
    ipcRenderer.invoke('sendLyricData', lyricData, currentTime, isPlaying),
  // 发送播放状态到桌面歌词窗口
  sendPlayStatus: (currentTime: number, isPlaying: boolean) =>
    ipcRenderer.invoke('sendPlayStatus', currentTime, isPlaying),
  // 移动桌面歌词窗口
  moveLyricDesktopWindow: (position: { x: number; y: number }) =>
    ipcRenderer.invoke('moveLyricDesktopWindow', position),
  // 监听桌面歌词窗口更新歌词数据事件
  onUpdateLyricData: (callback) =>
    ipcRenderer.on('updateLyricData', (_event, data) => callback(data)),
  // 监听桌面歌词窗口更新播放状态事件
  onUpdatePlayStatus: (callback) =>
    ipcRenderer.on('updatePlayStatus', (_event, data) => callback(data)),
  // 移除桌面歌词窗口更新歌词数据事件监听
  offUpdateLyricData: () => ipcRenderer.removeAllListeners('updateLyricData'),
  // 移除桌面歌词窗口更新播放状态事件监听
  offUpdatePlayStatus: () => ipcRenderer.removeAllListeners('updatePlayStatus'),

  // 音量相关
  // 改变音量
  changeVolume: (volume: number) => ipcRenderer.invoke('changeVolume', volume),
  // 设置音量
  onUpdateVolume: (callback: (volume: number) => void) =>
    ipcRenderer.on('updateVolume', (_event, volume) => callback(volume)),

  // 音乐控制相关
  // 播放/暂停音乐
  handleMusicPlay: (action: string) => ipcRenderer.invoke('handleMusicPlay', action),
  // 监听音乐播放/暂停事件
  onHandleMusicPlay: (callback) =>
    ipcRenderer.on('handleMusicPlay', (_event, value) => callback(value))
}
