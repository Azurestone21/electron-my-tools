import { changeVolumeApi } from '@renderer/api/music'

// 获取当前音量（确保返回有效数字）
export const getVolume = () => {
  const musicStore = useMusicStore()
  const { volume } = storeToRefs(musicStore)
  return typeof volume.value === 'number' && isFinite(volume.value) ? volume.value : 0.05
}

// 调整音量（增加或减少）
export const adjustVolume = (delta: number) => {
  // 确保当前音量是有效的数字
  let currentVolume = getVolume()
  let newVolume = currentVolume + Number(delta || 0)
  // 限制音量范围在0到1之间
  if (newVolume < 0) newVolume = 0
  if (newVolume > 1) newVolume = 1
  // 确保新音量是有效的数字
  if (!isFinite(newVolume)) {
    newVolume = 0
  }

  // 通过IPC通知主进程更新音量
  changeVolumeApi(newVolume)
}

// 处理音量区域的鼠标滚轮事件
export const handleVolumeWheel = (e: WheelEvent) => {
  e.preventDefault()
  // 滚轮向上滚动增加音量，向下滚动减少音量
  const delta = e.deltaY < 0 ? 0.05 : -0.05
  adjustVolume(delta)
}
