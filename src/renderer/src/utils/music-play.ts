// 音乐歌词时间
// str: 00:10:00, return 10s
export function parseTime(str) {
  let [min, s, ms] = str.split(':')
  return min * 60 + s * 1 + ~~(ms / 0.6) / 100
}

/**
 * 秒转分钟
 * @param {*} seconds
 * @returns '00:00'
 */
export function secondsTimeFormat(seconds) {
  if (seconds) {
    let minutes =
      Math.floor(seconds / 60) > 10 ? Math.floor(seconds / 60) : `0${Math.floor(seconds / 60)}`
    let remainingSeconds = seconds % 60 > 10 ? Math.floor(seconds % 60) : `0${Math.floor(seconds % 60)}`
    return  `${minutes}:${remainingSeconds}`
  }
  return '00:00'
}

export enum MusicPlayType {
  play = 'play',
  pause = 'pause',
  before = 'before',
  next = 'next'
}
export enum KeyCodeType {
  Space = 'Space',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight'
}

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
  if (type == MusicPlayType.before) {
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
