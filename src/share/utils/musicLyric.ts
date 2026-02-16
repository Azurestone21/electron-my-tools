import { readFileSync } from 'fs'

/**
 * 歌词格式
 * 第1种. [00:02.33]作[00:02.48]词[00:02.63]：[00:02.79]严[00:02.94]书[00:03.09]
 * 第2种. [00:02.33]作词：严书
 */

/**
 * 处理歌词
 * @param {*} path 歌词文件路径
 * @returns
 */
const handleMusicLyric = function (path) {
  let arr: { time: string; lyric: string }[] = [
    // {
    //   time: '00:00.00',
    //   lyric: '啦啦啦啦啦啦'
    // }
  ]

  try {
    let content = readFileSync(path, 'utf-8')
    content = content.slice(1, -1)
    let rows = content.split('\n') // 按换行符分割
    rows.forEach((row, index) => {
      let lyric = row
      const regex = /\[([0123]\d|[0-9]):([0-9]\d)(:|.)([0-9]\d)\]/g
      const timeArr = row.match(regex) // 匹配所有[00:02.33]时间格式的字符串
      if (timeArr && timeArr.length) {
        timeArr.forEach((t) => {
          lyric = lyric.replace(t, '') // 每一行歌词去掉所有[00:02.33]时间格式的字符串
        })
        arr[index] = {
          time: timeArr[0]?.replace('[', '')?.replace(']', '') || '',
          lyric
        }
      } else {
        arr[index] = {
          time: '',
          lyric
        }
      }
    })
    return arr
  } catch (error) {
    console.log('handleMusicLyric ~ error:', error)
  }
}

// str: 00:10:00, return 10s
const parseTime = (str) => {
  let [min, s, ms] = str.split(':')
  return min * 60 + s * 1 + ~~(ms / 0.6) / 100
}

export { handleMusicLyric, parseTime }
