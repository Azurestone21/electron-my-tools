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

export function stringify(obj, sep, eq) {
  sep = sep || '&'
  eq = eq || '='
  let str = ''
  for (var k in obj) {
    str += k + eq + unescape(obj[k]) + sep
  }
  return str.slice(0, -1)
}

export function parse(str) {
  var obj = new Object()
  strs = str.split('&')
  for (var i = 0; i < strs.length; i++) {
    let index = strs[i].indexOf('=')
    obj[strs[i].slice(0, index)] = unescape(strs[i].slice(index + 1))
  }
  return obj
}

