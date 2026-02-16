import { onMounted, onUnmounted } from 'vue'
import { IPlaylist, IPlayingSong, TMusicPlayType } from '@renderer/types/music'
import { useEventListener } from '../useEventListener'

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
  const getPlayMusic = (
    type: TMusicPlayType,
    playlists: IPlaylist[],
    currentMusic: IPlayingSong
  ) => {
    // 当前播放音乐的索引（歌曲索引）
    const songIndex = currentMusic.songIndex
    // 当前播放音乐所在的歌单id
    const parentId = currentMusic.parentIndex
    // 当前播放音乐所在的歌单索引
    const playlistIndex = playlists.findIndex((p) => p.id + '' === parentId + '')
    // 当前播放音乐所在的歌单的歌曲数量
    const currntSortLength = playlists[playlistIndex]?.songs?.length
    // 总歌单数量
    const parentLength = playlists.length
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
      } else if (playlistIndex < parentLength - 1) {
        newIndex = 0
      }
    }
    return playlists[playlistIndex]?.songs[newIndex]
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
    const { playlists, playingSong } = musicStore
    const song = getPlayMusic(type, playlists, playingSong)
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
    // 监听音乐播放控制事件（播放/暂停/上一首/下一首）
    await window.musicApi.onHandleMusicPlay((action: TMusicPlayType) => {
      if (action === 'play' || action === 'pause') {
        play(false)
      } else {
        changeMusic(action)
      }
    })
  }

  // 改变播放时间
  const changePlayProgress = (layerX: number) => {
    if (!myAudio) return // 音频未初始化则忽略
    const progressBar = document.getElementById('audioProgress') as HTMLElement
    if (myAudio.duration) {
      let t = Math.floor((layerX / progressBar.clientWidth) * myAudio.duration)
      myAudio.currentTime = t
      musicStore.setStore({
        currentTime: t
      })
    }
  }

  // 切换播放模式
  const changePlayPattern = () => {
    const { playPattern } = musicStore
    musicStore.changePlayPattern()
    if (myAudio && playPattern) {
      myAudio.loop = playPattern === 'loop'
    }
  }

  // 生命周期：挂载时初始化
  onMounted(() => {
    initAudio() // 初始化音频实例
    listenIPCMusicPlay() // 注册 IPC 监听
  })

  // 键盘事件监听
  useEventListener('keydown', handleKeyDown, window)

  // 卸载时清理副作用
  onUnmounted(() => {})

  // 对外暴露的 API
  return {
    play, // 播放/暂停（传入 true 则刷新并重新播放）
    playPrev: () => changeMusic('before'), // 快捷上一首
    playNext: () => changeMusic('next'), // 快捷下一首
    changePlayProgress, // 改变播放时间
    changePlayPattern // 切换播放模式
  }
}
