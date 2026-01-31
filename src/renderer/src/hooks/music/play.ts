import { TMusicPlayType } from '@renderer/types/music'
let myAudio: HTMLAudioElement | null = null

/**
 * 获取下一首要播放的音乐
 * @param type 操作类型：before上一首、next下一首
 * @param musicList 播放列表
 * @param currentMusic 当前播放音乐
 * @returns
 */
export function getPlayMusic(type, musicList, currentMusic) {
  let songIndex = currentMusic.songIndex
  let parentIndex = currentMusic.parentIndex
  let currntSortLength = musicList[parentIndex]?.songs?.length
  let parentLength = musicList.length

  let newIndex = songIndex
  if (type === 'before') {
    if (songIndex != 0) {
      newIndex = songIndex - 1
    }
  } else {
    if (songIndex < currntSortLength - 1) {
      newIndex = songIndex + 1
    } else if (parentIndex < parentLength - 1) {
      newIndex = 0
    }
  }
  return musicList[parentIndex]?.songs[newIndex]
}

// 初始化音频元素
export const initAudio = (audioElement: HTMLAudioElement) => {
  myAudio = audioElement
}

// 播放/暂停音乐
export const play = (refresh: boolean = false) => {
  if (!myAudio) return

  const musicStore = useMusicStore()

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

// 上一首 / 下一首
export const changeMusic = (type: string) => {
  const musicStore = useMusicStore()
  const { musicList, playingSong } = musicStore

  const song = getPlayMusic(type, musicList, playingSong)
  musicStore.setStore({
    playingSong: song
  })

  play(true)
}

// 键盘事件处理函数
export const listenKeyDown = (e) => {
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

// 监听主线程的事件
export const listenMusicPlay = async () => {
  await window.musicApi.onHandleMusicPlay((value: TMusicPlayType) => {
    if (value === 'play' || value === 'pause') {
      play(false)
    } else {
      changeMusic(value)
    }
  })
}
