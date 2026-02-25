<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  src: string
  currentTime?: number
  volume?: number
  playbackRate?: number
  isPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentTime: 0,
  volume: 0.05,
  playbackRate: 1,
  isPlay: false
})

const emit = defineEmits<{
  'update:currentTime': [value: number]
  'update:volume': [value: number]
  'update:playbackRate': [value: number]
  'update:isPlay': [value: boolean]
  timeupdate: [value: number]
  ended: []
  loadedmetadata: [duration: number]
}>()

const videoElement = ref<HTMLVideoElement>()
const actualSrc = ref<string>(props.src)

// 更新播放时间
const handleTimeUpdate = () => {
  if (videoElement.value) {
    const currentTime = videoElement.value.currentTime
    emit('update:currentTime', currentTime)
    emit('timeupdate', currentTime)
  }
}

// 更新视频元数据
const handleLoadedMetadata = () => {
  if (videoElement.value) {
    const duration = videoElement.value.duration
    emit('loadedmetadata', duration)
  }
}

// 播放视频
const handlePlay = () => {
  emit('update:isPlay', true)
}

// 暂停视频
const handlePause = () => {
  emit('update:isPlay', false)
}

// 视频播放结束
const handleEnded = () => {
  emit('ended')
}

// 更新音量
const handleVolumeChange = () => {
  if (videoElement.value) {
    emit('update:volume', videoElement.value.volume)
  }
}

// 更新播放速率
const handleRateChange = () => {
  if (videoElement.value) {
    emit('update:playbackRate', videoElement.value.playbackRate)
  }
}

watch(
  () => props.src,
  (newSrc) => {
    console.log('🚀 ~ props.src:', newSrc)
    if (videoElement.value && newSrc) {
      actualSrc.value = newSrc
      if (!videoElement.value.paused) {
        videoElement.value.pause()
      }
      videoElement.value.src = newSrc
      videoElement.value.load()
    }
  }
)

watch(
  () => actualSrc.value,
  (newSrc) => {
    if (videoElement.value && newSrc) {
      videoElement.value.src = newSrc
      videoElement.value.load()
      videoElement.value.play()
    }
  }
)

watch(
  () => props.currentTime,
  (newTime) => {
    if (videoElement.value && Math.abs(videoElement.value.currentTime - newTime) > 0.5) {
      videoElement.value.currentTime = newTime
    }
  }
)

watch(
  () => props.volume,
  (newVolume) => {
    if (videoElement.value && Math.abs(videoElement.value.volume - newVolume) > 0.01) {
      videoElement.value.volume = newVolume
    }
  }
)

watch(
  () => props.playbackRate,
  (newRate) => {
    if (videoElement.value && Math.abs(videoElement.value.playbackRate - newRate) > 0.01) {
      videoElement.value.playbackRate = newRate
    }
  }
)

watch(
  () => props.isPlay,
  (newIsPlay) => {
    if (videoElement.value) {
      if (newIsPlay) {
        videoElement.value.play()
      } else {
        videoElement.value.pause()
      }
    }
  }
)

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.volume = props.volume
    videoElement.value.playbackRate = props.playbackRate
  }
})

onBeforeUnmount(() => {
  if (videoElement.value) {
    videoElement.value.pause()
  }
})

defineExpose({
  videoElement,
  play: () => videoElement.value?.play(),
  pause: () => videoElement.value?.pause(),
  currentTime: () => videoElement.value?.currentTime,
  volume: () => videoElement.value?.volume,
  playbackRate: () => videoElement.value?.playbackRate,
  duration: () => videoElement.value?.duration,
  requestPictureInPicture: () => videoElement.value?.requestPictureInPicture(),
  requestFullscreen: () => videoElement.value?.requestFullscreen()
})
</script>

<template>
  <div class="video-wrapper">
    <video
      ref="videoElement"
      class="video-player"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @volumechange="handleVolumeChange"
      @ratechange="handleRateChange"
    ></video>
  </div>
</template>

<style lang="less" scoped>
.video-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
