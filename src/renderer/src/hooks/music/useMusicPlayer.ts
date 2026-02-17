import { ref, onMounted } from 'vue'
import { useMusicStore } from '@renderer/store/modules/music'
import { onHandleMusicPlayApi } from '@renderer/api/music'
import { getPlayMusic, changePlayProgress } from '@renderer/utils/music/player'
import { handleMusicKeydown } from '@renderer/utils/music/keyboard'

export function useMusicPlayer() {
  const musicStore = useMusicStore()
  const myAudio = ref<HTMLAudioElement | null>(null)

  // 初始化音频元素
  const initAudio = () => {
    myAudio.value = document.getElementById('myAudio') as HTMLAudioElement
    if (!myAudio.value) console.warn('音频元素未初始化，请传入有效的 audio DOM 元素')
  }

  // 播放/暂停音乐
  const play = (refresh: boolean = false) => {
    if (!myAudio.value) return

    if (refresh) {
      myAudio.value.load()
      myAudio.value.currentTime = 0
      musicStore.setStore({
        currentTime: 0
      })
    }

    if (myAudio.value.paused) {
      myAudio.value.currentTime = musicStore.currentTime
      myAudio.value.play()
    } else {
      myAudio.value.pause()
    }

    musicStore.setStore({
      isPlay: !myAudio.value.paused
    })
  }

  // 切换音乐
  const changeMusic = (type: 'before' | 'next') => {
    const { playlists, playingSong } = musicStore
    const song = getPlayMusic(type, playlists, playingSong)
    if (!song) return
    musicStore.setStore({ playingSong: song })
    play(true)
  }

  // 监听 IPC 音乐播放事件
  const listenIPCMusicPlay = async () => {
    await onHandleMusicPlayApi((action: 'play' | 'pause' | 'before' | 'next') => {
      if (action === 'play' || action === 'pause') {
        play(false)
      } else {
        changeMusic(action)
      }
    })
  }

  // 改变播放进度
  const handleChangePlayProgress = (layerX: number) => {
    if (!myAudio.value) return
    const t = changePlayProgress(layerX, myAudio.value)
    musicStore.setStore({
      currentTime: t
    })
  }

  onMounted(() => {
    initAudio()
    listenIPCMusicPlay()
  })

  return {
    play,
    playPrev: () => changeMusic('before'),
    playNext: () => changeMusic('next'),
    changePlayProgress: handleChangePlayProgress,
    handleKeyDown: handleMusicKeydown
  }
}
