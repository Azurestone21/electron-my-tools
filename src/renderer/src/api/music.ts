import { TMusicPlayType } from "@share/types/music"

// 获取音乐数据
export const getMusicDataApi = (basePath: string) => {
  return window.musicApi.getMusicData(basePath)
}

// 获取歌词
export const getLyricApi = (filePath: string) => {
  return window.musicApi.getLyric(filePath)
}

// 选择音频文件
export const selectAudioFileApi = () => {
  return window.musicApi.selectAudioFile()
}

// 桌面歌词相关
// 创建桌面歌词窗口
export const createLyricDesktopApi = () => {
  return window.musicApi.createLyricDesktop()
}

// 切换桌面歌词窗口显示状态
export const toggleLyricDesktopApi = () => {
  return window.musicApi.toggleLyricDesktop()
}

// 发送歌词数据到桌面歌词窗口
export const sendLyricDataApi = (lyricData: any[], currentTime: number, isPlaying: boolean) => {
  return window.musicApi.sendLyricData(lyricData, currentTime, isPlaying)
}

// 发送播放状态到桌面歌词窗口
export const sendPlayStatusApi = (currentTime: number, isPlaying: boolean) => {
  return window.musicApi.sendPlayStatus(currentTime, isPlaying)
}

// 移动桌面歌词窗口
export const moveLyricDesktopWindowApi = (position: { x: number; y: number }) => {
  return window.musicApi.moveLyricDesktopWindow(position)
}

// 监听桌面歌词窗口更新歌词数据事件
export const onUpdateLyricDataApi = (callback: (data: any) => void) => {
  return window.musicApi.onUpdateLyricData(callback)
}

// 监听桌面歌词窗口更新播放状态事件
export const onUpdatePlayStatusApi = (callback: (data: any) => void) => {
  return window.musicApi.onUpdatePlayStatus(callback)
}

// 移除桌面歌词窗口更新歌词数据事件监听
export const offUpdateLyricDataApi = () => {
  return window.musicApi.offUpdateLyricData()
}

// 移除桌面歌词窗口更新播放状态事件监听
export const offUpdatePlayStatusApi = () => {
  return window.musicApi.offUpdatePlayStatus()
}

// 音量相关
// 改变音量
export const changeVolumeApi = (volume: number) => {
  return window.musicApi.changeVolume(volume)
}

// 设置音量
export const onUpdateVolumeApi = (callback: (volume: number) => void) => {
  return window.musicApi.onUpdateVolume(callback)
}

// 音乐控制相关
// 播放/暂停音乐
export const handleMusicPlayApi = (action: TMusicPlayType) => {
  return window.musicApi.handleMusicPlay(action)
}

// 监听音乐播放/暂停事件
export const onHandleMusicPlayApi = (callback: (action: TMusicPlayType) => void) => {
  return window.musicApi.onHandleMusicPlay(callback)
}
