<!-- 数据转换 -->
<script setup lang="ts">
import JSONViewer from './components/JSONViewer'
import { ref, watch, onUnmounted } from 'vue'
const originText = ref<string>('')
const targetJson = ref<any>('')
const error = ref<string>('')

// 拖动相关变量
const isDragging = ref(false)
const leftWidth = ref('50%')
let startX = 0
let startWidth = 0

// 拖动开始事件
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startX = e.clientX
  startWidth = parseFloat(leftWidth.value)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  // 阻止默认行为和事件冒泡
  e.preventDefault()
  e.stopPropagation()
}

// 拖动过程事件
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const contentEl = document.querySelector('.content') as HTMLElement
  if (!contentEl) return

  const contentWidth = contentEl.offsetWidth
  const deltaX = e.clientX - startX
  const deltaPercent = (deltaX / contentWidth) * 100

  let newWidth = startWidth + deltaPercent
  // 限制最小宽度为30%
  newWidth = Math.max(30, Math.min(70, newWidth))

  leftWidth.value = `${newWidth}%`
}

// 拖动结束事件
const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 监听拖动结束
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

watch(originText, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // 处理转换逻辑
    try {
      error.value = ''
      if (newVal.trim() === '') {
        targetJson.value = null
        return
      }
      // 解析JSON字符串
      const parsed = JSON.parse(newVal)
      targetJson.value = parsed
    } catch (e) {
      error.value = 'JSON解析错误: ' + (e as Error).message
      targetJson.value = null
    }
  }
})
</script>

<template>
  <div class="page">
    <div class="content">
      <div class="left" :style="{ width: leftWidth }">
        <textarea
          class="origin_input"
          type="text"
          placeholder="请输入JSON字符串"
          v-model="originText"
        ></textarea>
      </div>
      <div class="split" @mousedown="handleMouseDown"></div>
      <div class="right">
        <JSONViewer :json="targetJson" :error="error" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.page {
  padding: 20px 20px 34px 20px;
}
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  overflow: hidden;

  .left {
    height: 100%;
    background-color: var(--card);
    border-radius: 8px;
    overflow: hidden;

    .origin_input {
      width: 100%;
      height: 100%;
      max-height: 90%;
      padding: 10px;
      outline: none;
      resize: none;
      overflow: auto;
      // border: 1px dashed var(--border);
      background: transparent;
      font-size: 14px;
      color: var(--foreground);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .split {
    width: 5px;
    height: 100%;
    background-color: var(--border);
    cursor: e-resize;
    border-radius: 2px;
    margin: 0 5px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--accent);
    }

    &.dragging {
      background-color: var(--primary);
    }
  }

  .right {
    flex: 1;
    height: 100%;
    background-color: var(--card);
    padding: 10px;
    border-radius: 8px;
    overflow: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    color: var(--foreground);
  }
}
</style>
