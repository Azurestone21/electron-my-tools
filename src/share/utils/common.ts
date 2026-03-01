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
    let remainingSeconds =
      seconds % 60 > 10 ? Math.floor(seconds % 60) : `0${Math.floor(seconds % 60)}`
    return `${minutes}:${remainingSeconds}`
  }
  return '00:00'
}

/**
 * 格式化文件大小
 * @param {*} size 字节数
 * @returns '123.45 MB'
 */
export const formatFileSize = (size) => {
  if (!size) {
    return '0 B'
  } else if (size > 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  } else if (size > 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  } else if (size > 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${size.toFixed(2)} B`
  }
}

/**
 * 生成基础唯一ID
 * @returns {string} 唯一ID字符串
 */
export function generateSimpleId(index?: number) {
  // 1. 时间戳（毫秒级，纯数字）
  const timestamp = Date.now()
  // 2. 6位随机数（0-9999，纯数字）
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(6, '0')
  // 3. 2位循环索引（00-99，纯数字）
  const indexStr = (index || 0).toString().padStart(2, '0')
  return `${timestamp}${random}${indexStr}`
}
