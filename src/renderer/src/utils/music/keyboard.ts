import { handleMusicPlayApi } from '@renderer/api/music'

// 键盘事件处理
export const handleMusicKeydown = (e: KeyboardEvent) => {
  switch (e.code) {
    case 'Space':
      handleMusicPlayApi('play')
      break
    case 'ArrowLeft':
      handleMusicPlayApi('before')
      break
    case 'ArrowRight':
      handleMusicPlayApi('next')
      break
  }
}
