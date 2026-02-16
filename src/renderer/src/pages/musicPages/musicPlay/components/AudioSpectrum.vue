<!-- 音频频谱组件 -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMusicStore } from '@renderer/store/modules/music'

const musicStore = useMusicStore()
const { isPlay, globalAudioContext, globalAudioAnalyser, globalAudioSource } =
  storeToRefs(musicStore)

const spectrumCanvas = ref(null)
let canvasCtx = null // Canvas 2D 上下文
let canvasWidth = 600 // 画布宽度
let canvasHeight = 100 // 画布高度

// 音频相关
let audioContext = null // Web Audio 上下文
let audioAnalyser = null // 音频分析器
let audioSource = null // 音频源
let audioElement = null // 音频元素
let animationId = null // 动画帧ID

// 获取音频元素
const getAudioElement = () => {
  return document.getElementById('myAudio') as HTMLAudioElement
}

// 初始化 Canvas 上下文
onMounted(() => {
  // 初始化 Canvas
  if (spectrumCanvas.value) {
    // 设置画布尺寸
    canvasWidth = spectrumCanvas.value.offsetWidth
    canvasHeight = spectrumCanvas.value.offsetHeight
    spectrumCanvas.value.width = canvasWidth
    spectrumCanvas.value.height = canvasHeight

    canvasCtx = spectrumCanvas.value.getContext('2d')
  }

  // 初始化音频元素
  audioElement = getAudioElement()

  // 初始化 Web Audio Context（使用单例）
  try {
    // 如果全局 audioContext 已存在，直接使用
    if (globalAudioContext?.value) {
      audioContext = globalAudioContext.value
      audioAnalyser = globalAudioAnalyser.value
      audioSource = globalAudioSource.value
    } else {
      // 首次初始化
      audioContext = new AudioContext()

      // 创建分析器节点
      audioAnalyser = audioContext.createAnalyser()
      audioAnalyser.fftSize = 256 // FFT大小

      // 创建音频源并连接分析器
      audioSource = audioContext.createMediaElementSource(audioElement)
      audioSource.connect(audioAnalyser) // 源 -> 分析器
      audioAnalyser.connect(audioContext.destination) // 分析器 -> 扬声器

      // 保存到全局变量
      musicStore.setStore({
        globalAudioContext: audioContext,
        globalAudioAnalyser: audioAnalyser,
        globalAudioSource: audioSource
      })
    }
  } catch (error) {
    console.error('音频频谱初始化失败:', error)
  }
})

// 监听播放状态变化
watch(isPlay, (newVal) => {
  if (newVal) {
    // 激活 AudioContext
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
    drawSpectrum()
  } else {
    cancelAnimationFrame(animationId)
    // 清空画布
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight)
    }
  }
})

// 绘制频谱动效（核心函数）
const drawSpectrum = () => {
  if (!audioAnalyser || !canvasCtx) return

  try {
    // 获取频域数据（0-255 的数值数组）
    const bufferLength = audioAnalyser.frequencyBinCount // 频域数据长度（= fftSize/2）
    const dataArray = new Uint8Array(bufferLength)
    audioAnalyser.getByteFrequencyData(dataArray)

    // 清空画布
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 频谱柱样式配置
    const barWidth = (canvasWidth / bufferLength) * 1.5 // 柱宽度
    const barGap = 2 // 柱间距
    let x = 0 // 柱的X坐标

    // 遍历频域数据，绘制每个频谱柱
    for (let i = 0; i < bufferLength; i++) {
      // 将 0-255 的数据映射为画布高度范围内的数值
      const barHeight = (dataArray[i] / 255) * canvasHeight * 0.8

      // 设置渐变颜色
      const gradient = canvasCtx.createLinearGradient(0, canvasHeight - barHeight, 0, canvasHeight)
      gradient.addColorStop(0, '#409eff') // 主题色
      gradient.addColorStop(1, '#67c23a')

      // 绘制频谱柱
      canvasCtx.fillStyle = gradient
      canvasCtx.fillRect(x, canvasHeight - barHeight, barWidth - barGap, barHeight)

      // 更新下一个柱的X坐标
      x += barWidth
    }
  } catch (error) {
    console.error('绘制频谱失败:', error)
  }

  // 循环绘制
  animationId = requestAnimationFrame(drawSpectrum)
}

// 清理当前组件的资源（不清理全局 audioContext）
const cleanUpAudio = () => {
  // 停止动画
  cancelAnimationFrame(animationId)
  animationId = null

  // 清空画布
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight)
  }
}

// 销毁时清理资源，避免内存泄漏
onBeforeUnmount(() => {
  cleanUpAudio()
})
</script>

<template>
  <div class="audio-spectrum">
    <!-- 频谱绘制画布 -->
    <canvas ref="spectrumCanvas" class="spectrum-canvas"></canvas>
  </div>
</template>

<style lang="less" scoped>
.audio-spectrum {
  width: 100%;
  height: 100px;

  .spectrum-canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
