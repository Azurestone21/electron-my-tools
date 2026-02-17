import { useMusicStore } from '@renderer/store/modules/music'
import { storeToRefs } from 'pinia'
import { changeVolumeApi } from '@renderer/api/music'

// 获取当前音量（确保返回有效数字）
export const getVolume = () => {
  const musicStore = useMusicStore()
  const { volume } = storeToRefs(musicStore)
  return typeof volume.value === 'number' && isFinite(volume.value) ? volume.value : 0.05
}

// 调整音量（增加或减少）
export const adjustVolume = (delta: number) => {
  let currentVolume = getVolume()
  let newVolume = currentVolume + Number(delta || 0)
  if (newVolume < 0) newVolume = 0
  if (newVolume > 1) newVolume = 1
  if (!isFinite(newVolume)) {
    newVolume = 0
  }
  changeVolumeApi(newVolume)
}

// 处理音量区域的鼠标滚轮事件
export const handleVolumeWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY < 0 ? 0.05 : -0.05
  adjustVolume(delta)
}
