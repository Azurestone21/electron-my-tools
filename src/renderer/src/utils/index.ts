// 处理url参数
export function stringify(obj, sep?: string, eq?: string) {
  sep = sep || '&'
  eq = eq || '='
  let str = ''
  for (var k in obj) {
    str += k + eq + unescape(obj[k]) + sep
  }
  return str.slice(0, -1)
}

// 处理url参数
export function parse(str: string) {
  let obj = new Object()
  let strArr = str.split('&')
  for (var i = 0; i < strArr.length; i++) {
    let index = strArr[i].indexOf('=')
    obj[strArr[i].slice(0, index)] = unescape(strArr[i].slice(index + 1))
  }
  return obj
}

// 格式化时长（秒数转换为 时:分:秒 格式）
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

