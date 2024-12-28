/**
 * 判断数据是否是对象
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]'
}
/**
 * 判断数据是否是数组
 */
export function isArray(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]'
}
/**
 * 判断数据是否是布尔值
 */
export function isBoolean(obj) {
  return Object.prototype.toString.call(obj) == '[object Boolean]'
}
/**
 * 判断数据是否是字符串
 */
export function isString(obj) {
  return Object.prototype.toString.call(obj) == '[object String]'
}
/**
 * 判断数据是否是undefined
 */
export function isUndefined(obj) {
  return Object.prototype.toString.call(obj) == '[object Undefined]'
}
/**
 * 判断数据是否是null
 */
export function isNull(obj) {
  return Object.prototype.toString.call(obj) == '[object Null]'
}
/**
 * 判断数据是否是number
 */
export function isNumber(obj) {
  return Object.prototype.toString.call(obj) == '[object Number]'
}
/**
 * 判断数据是否是function
 */
export function isFunction(obj) {
  return Object.prototype.toString.call(obj) == '[object Function]'
}

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
