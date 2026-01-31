import { onMounted, onUnmounted } from 'vue'
import { IMusic, IPlayingSong, TMusicPlayType } from '@renderer/types/music'
import { getVolume } from './volume'

// 音频实例全局维护
let myAudio: HTMLAudioElement | null = null

/**
 * 音乐播放核心 Hooks
 * @param audioElement 音频 DOM 元素
 * @returns 对外暴露的状态和方法
 */
export function useMusicPlayer() {
  const musicStore = useMusicStore()

  /**
   * 获取下一首要播放的音乐
   * @param type 操作类型：before上一首、next下一首
   * @param musicList 播放列表
   * @param currentMusic 当前播放音乐
   * @returns
   */
  const getPlayMusic = (type: TMusicPlayType, musicList: IMusic[], currentMusic: IPlayingSong) => {
    let songIndex = currentMusic.songIndex
    let parentIndex = currentMusic.parentIndex
    let currntSortLength = musicList[parentIndex]?.songs?.length
    let parentLength = musicList.length

    let newIndex = songIndex
    if (type === 'before') {
      // 上一首
      if (songIndex != 0) {
        newIndex = songIndex - 1
      }
    } else {
      // 下一首
      if (songIndex < currntSortLength - 1) {
        newIndex = songIndex + 1
      } else if (parentIndex < parentLength - 1) {
        newIndex = 0
      }
    }
    return musicList[parentIndex]?.songs[newIndex]
  }

  // 初始化音频元素
  const initAudio = () => {
    myAudio = document.getElementById('myAudio') as HTMLAudioElement
    if (!myAudio) console.warn('音频元素未初始化，请传入有效的 audio DOM 元素')
  }

  // 播放/暂停核心方法
  const play = (refresh: boolean = false) => {
    if (!myAudio) return

    if (refresh) {
      myAudio.load()
      myAudio.currentTime = 0
      musicStore.setStore({
        currentTime: 0
      })
    }

    if (myAudio.paused) {
      myAudio.currentTime = musicStore.currentTime
      myAudio.play()
    } else {
      myAudio.pause()
    }

    musicStore.setStore({
      isPlay: !myAudio.paused
    })
  }

  // 上一首/下一首切歌
  const changeMusic = (type: TMusicPlayType) => {
    const { musicList, playingSong } = musicStore
    const song = getPlayMusic(type, musicList, playingSong)
    if (!song) return // 无可用歌曲则返回
    musicStore.setStore({ playingSong: song })
    play(true) // 切歌后刷新并播放
  }

  // 键盘事件处理（空格/左箭头/右箭头）
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!myAudio) return // 音频未初始化则忽略键盘事件
    switch (e.code) {
      case 'Space':
        //播放/暂停
        window.musicApi.handleMusicPlay('play')
        break
      case 'ArrowLeft':
        // 上一首
        window.musicApi.handleMusicPlay('before')
        break
      case 'ArrowRight':
        // 下一首
        window.musicApi.handleMusicPlay('next')
        break
    }
  }

  // 监听主进程 IPC 音乐播放事件
  const listenIPCMusicPlay = async () => {
    if (!window.musicApi?.onHandleMusicPlay) {
      console.warn('未检测到 musicApi，IPC 通信初始化失败')
      return
    }
    // 监听音乐播放控制事件（播放/暂停/上一首/下一首）
    await window.musicApi.onHandleMusicPlay((value: TMusicPlayType) => {
      if (value === 'play' || value === 'pause') {
        play(false)
      } else {
        changeMusic(value)
      }
    })
  }

  // 生命周期：挂载时初始化
  onMounted(() => {
    const { playPattern } = musicStore
    initAudio() // 初始化音频实例
    listenIPCMusicPlay() // 注册 IPC 监听
    window.addEventListener('keydown', handleKeyDown) // 注册键盘事件
    // 监听播放完成事件
    myAudio.addEventListener(
      'ended',
      function () {
        changeMusic('next')
      },
      false
    )
    myAudio.addEventListener('canplay', function () {
      musicStore.setStore({
        duration: myAudio.duration
      })
      // 确保音量是有效的数字
      myAudio.volume = getVolume() // 音量
      myAudio.loop = playPattern == 'loop' // 单曲循环
    })
  })

  // 卸载时清理副作用
  onUnmounted(() => {
    // 移除键盘事件监听
    window.removeEventListener('keydown', handleKeyDown)
    // 若 IPC 有移除监听的方法，需在此处调用（示例：window.musicApi.offHandleMusicPlay()）
  })

  // 对外暴露的 API（组件仅需使用这些方法/状态）
  return {
    play, // 播放/暂停（传入 true 则刷新并重新播放）
    playPrev: () => changeMusic('before'), // 快捷上一首
    playNext: () => changeMusic('next') // 快捷下一首
  }
}
