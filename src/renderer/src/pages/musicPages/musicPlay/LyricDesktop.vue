<!-- 桌面歌词 -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { parseTime } from '@renderer/utils/music-play'

// 状态管理
const lyricArr = ref([])
const currentTime = ref(0)
const isPlaying = ref(false)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })

// 歌词配置
const lyricConfig = ref({
  position: { x: 0, y: 0 },
  size: { width: 400, height: 100 },
  opacity: 0.8,
  fontSize: 16,
  fontColor: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  isShow: true
})

// 当前活跃歌词索引
const activityLyric = computed(() => {
  if (lyricArr.value.length && currentTime.value) {
    let i = 0
    lyricArr.value.forEach((item, index) => {
      if (parseTime(item.time) <= currentTime.value) {
        i = index
      }
    })
    return i
  }
  return 0
})

// 加载歌词配置
const loadLyricConfig = async () => {
  try {
    const config = await window.musicApi.loadLyricDesktopConfig()
    if (config) {
      lyricConfig.value = config
    }
  } catch (error) {
    console.error('加载歌词配置失败:', error)
  }
}

// 保存歌词配置
const saveLyricConfig = async () => {
  try {
    await window.musicApi.saveLyricDesktopConfig(lyricConfig.value)
  } catch (error) {
    console.error('保存歌词配置失败:', error)
  }
}

// 处理窗口拖动
const handleMouseDown = (event) => {
  console.log('🚀 ~ handleMouseDown ~ event:', event)
  isDragging.value = true
  startPos.value = {
    x: event.clientX - lyricConfig.value.position.x,
    y: event.clientY - lyricConfig.value.position.y
  }
  // 添加临时的鼠标移动和释放事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  // console.log('🚀 ~ handleMouseDown ~ 事件监听器已添加')
}

const handleMouseMove = async (event) => {
  if (isDragging.value) {
    const newPosition = {
      x: event.clientX - startPos.value.x,
      y: event.clientY - startPos.value.y
    }
    lyricConfig.value.position = newPosition
    await window.musicApi.moveLyricDesktopWindow(newPosition)
  }
}

const handleMouseUp = () => {
  console.log('🚀 ~ handleMouseUp ~ isDragging.value:', isDragging.value)
  if (isDragging.value) {
    isDragging.value = false
    saveLyricConfig()
  }
  // 移除临时的鼠标移动和释放事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  // console.log('🚀 ~ handleMouseUp ~ 事件监听器已移除')
}

// 处理窗口大小调整
const handleResize = (event) => {
  lyricConfig.value.size = {
    width: event.target.offsetWidth,
    height: event.target.offsetHeight
  }
  saveLyricConfig()
}

// 关闭桌面歌词
const closeLyricDesktop = async () => {
  console.log('🚀 ~ 关闭桌面歌词:')
  await window.musicApi.toggleLyricDesktop()
}

// 监听IPC事件
onMounted(async () => {
  loadLyricConfig()

  // 监听歌词数据更新
  await window.musicApi.onUpdateLyricData((data) => {
    console.log('🚀 ~ data:', data)
    lyricArr.value = data.lyricData || []
    currentTime.value = data.currentTime || 0
    isPlaying.value = data.isPlaying || false
  })

  // 监听播放状态更新
  window.musicApi.onUpdatePlayStatus((data) => {
    currentTime.value = data.currentTime || 0
    isPlaying.value = data.isPlaying || false
  })

  // 鼠标事件监听器在handleMouseDown中动态添加
  console.log('🚀 ~ onMounted ~ 组件挂载完成')
})

onBeforeUnmount(() => {
  // 事件监听器在handleMouseUp中已经移除
  console.log('🚀 ~ onBeforeUnmount ~ 组件卸载完成')

  // 移除IPC事件监听
  window.musicApi.offUpdateLyricData()
  window.musicApi.offUpdatePlayStatus()
})
</script>

<template>
  <div
    class="lyric-desktop"
    :style="{
      opacity: lyricConfig.opacity,
      fontSize: lyricConfig.fontSize + 'px',
      color: lyricConfig.fontColor,
      backgroundColor: lyricConfig.backgroundColor
    }"
    @mousedown="handleMouseDown"
    @resize="handleResize"
  >
    <!-- 控制栏 -->
    <div class="control-bar">
      <div class="close-btn" @click="closeLyricDesktop">
        <el-icon size="14" color="#fff"><Close /></el-icon>
      </div>
    </div>

    <!-- 歌词显示区域 -->
    <div class="lyric-content" @mousedown="handleMouseDown">
      <div v-if="lyricArr.length > 0" class="lyric-list">
        <!-- 当前歌词 -->
        <div v-if="lyricArr[activityLyric]" class="lyric-item active">
          {{ lyricArr[activityLyric].lyric }}
        </div>

        <!-- 下一句歌词 -->
        <div v-if="lyricArr[activityLyric + 1]" class="lyric-item next">
          {{ lyricArr[activityLyric + 1].lyric }}
        </div>
      </div>
      <div v-else class="no-lyric">暂无歌词</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.lyric-desktop {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 119, 255, 0.3), rgba(0, 60, 179, 0.4));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  user-select: none;
  cursor: move;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 119, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* 控制栏 */
  .control-bar {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(5px);
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);

    .close-btn {
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &:hover .control-bar {
    opacity: 1;
    transform: translateY(0);
  }

  /* 歌词内容 */
  .lyric-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;

    /* 歌词列表 */
    .lyric-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      /* 歌词项 */
      .lyric-item {
        padding: 8px 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        /* 当前歌词 */
        &.active {
          font-weight: 700;
          transform: scale(1.08);
          opacity: 1;
          color: #ffffff;
          text-shadow: 0 4px 8px rgba(0, 119, 255, 0.5);
          animation: pulse 2s infinite ease-in-out;
        }

        /* 下一句歌词 */
        &.next {
          font-size: 0.85em;
          opacity: 0.7;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    /* 无歌词提示 */
    .no-lyric {
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
      font-size: 0.9em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  /* 调整大小手柄 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
    border-radius: 0 0 12px 0;
    transition: all 0.3s ease;
  }

  &:hover::after {
    background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.5) 50%);
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    text-shadow: 0 4px 8px rgba(0, 119, 255, 0.5);
  }
  50% {
    text-shadow: 0 6px 12px rgba(0, 119, 255, 0.7);
  }
}
</style>
