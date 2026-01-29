// 处理url参数
export function stringify(obj, sep, eq) {
  sep = sep || '&'
  eq = eq || '='
  let str = ''
  for (var k in obj) {
    str += k + eq + unescape(obj[k]) + sep
  }
  return str.slice(0, -1)
}

// 处理url参数
export function parse(str) {
  let obj = new Object()
  let strArr = str.split('&')
  for (var i = 0; i < strArr.length; i++) {
    let index = strArr[i].indexOf('=')
    obj[strArr[i].slice(0, index)] = unescape(strArr[i].slice(index + 1))
  }
  return obj
}
