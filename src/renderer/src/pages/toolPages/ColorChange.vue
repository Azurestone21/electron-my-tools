<!-- 颜色 RGB <-> 十六进制 -->
<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

/**
 * 将RGB颜色转换为16进制格式
 * @param {string} rgb 格式的颜色值字符串，如 rgb(52, 180, 137)
 */
function rgbToHex(rgb:string):string {
  // 正则表达式匹配rgb格式
  const regex = /^\s*rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)\s*$/
  const match = regex.exec(rgb)
  if (match) {
    // 将RGB转换为十六进制格式
    return (
      '#' +
      match
        .slice(1, 4)
        .map(function (x) {
          const hex = parseInt(x).toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')
    )
  } else {
    return ''
  }
}

/**
 * 将16进制颜色转换为RGB或RGBA格式
 * @param {string} hexColor 16进制的颜色值，如 #FF0000 或 FF0000
 * @param {number} [a=1] 透明度，取值 0 - 1，默认 1，若 a 的值 大于 1 或者 小于 0 则将返回 RGB 格式的值
 */
function hexToRgba(hexColor:string, a:number = 1):string {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (hexColor && reg.test(hexColor)) {
    // 移除前缀#符号
    hexColor = hexColor.replace(/^\s*#|\s*$/g, '')
    // 将三位十六进制转换为六位
    if (hexColor.length === 3) {
      hexColor = hexColor.replace(/(.)/g, '$1$1')
    }
    // 提取R、G、B各自的十六进制表示方式
    const r = parseInt(hexColor.substr(0, 2), 16)
    const g = parseInt(hexColor.substr(2, 2), 16)
    const b = parseInt(hexColor.substr(4, 2), 16)
    const rgb = a < 0 || a > 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
    return rgb
  } else {
    return ''
  }
}

const rgbColor = ref<string>('')
const rgbChangeRes = ref<string>('')
const hexColor = ref<string>('')
const hexChangeRes = ref<string>('')

const rgbChange = () => {
  if (rgbColor.value) {
    let result = rgbToHex(rgbColor.value)
    rgbChangeRes.value = result
  } else {
    ElMessage.warning('请输入RGB颜色')
  }
}
const hexChange = () => {
  if (hexColor.value) {
    let result = hexToRgba(hexColor.value)
    hexChangeRes.value = result
  } else {
    ElMessage.warning('请输入HEX颜色')
  }
}
const rgbPicker = (value:string):void => {
  rgbColor.value = value
}
const hexPicker = (value:string):void => {
  hexColor.value = value
}
</script>

<template>
  <div class="page">
    <div class="flex item">
      <span>RGB->HEX：</span>
      <el-input v-model="rgbColor" style="width: 180px" placeholder="请输入RGB颜色" />
      <el-color-picker v-model="rgbColor" size="large" show-alpha @change="rgbPicker" />
      <el-button type="primary" size="default" @click="rgbChange" class="btn">转换</el-button>
      <el-input v-model="rgbChangeRes" style="width: 180px" disabled />
      <el-color-picker v-model="rgbChangeRes" disabled size="large" />
    </div>
    <div class="flex item">
      <span>HEX->RGB：</span>
      <el-input v-model="hexColor" style="width: 180px" placeholder="请输入HEX颜色" />
      <el-color-picker v-model="hexColor" size="large" @change="hexPicker" />
      <el-button type="primary" size="default" @click="hexChange" class="btn">转换</el-button>
      <el-input v-model="hexChangeRes" style="width: 180px" disabled />
      <el-color-picker v-model="hexChangeRes" disabled size="large" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.item {
  margin-top: 20px;
}
.btn {
  margin: 0 20px;
}
</style>
