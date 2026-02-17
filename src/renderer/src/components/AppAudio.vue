<!-- 音频组件 -->
<script setup lang="ts">
import { watchEffect, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '../store/modules/music'
const musicStore = useMusicStore()
const { playingSong, currentTime, playPattern } = storeToRefs(musicStore)
import { getVolume } from '@renderer/utils/volume'
import { useMusicPlayer } from '@renderer/hooks/music/useMusicPlayer'
import { useEventListener } from '@renderer/hooks/useEventListener'
import {
  getLyricApi,
  sendLyricDataApi,
  sendPlayStatusApi,
  onUpdateVolumeApi
} from '@renderer/api/music'
const { playNext } = useMusicPlayer()

let myAudio = ref<HTMLAudioElement | null>(null)

// 音频当前播放时间
const timeupdate = (e) => {
  musicStore.setStore({
    currentTime: e.target.currentTime || 0
  })
}

// 获取歌词并发送到桌面歌词
const getLyric = async () => {
  if (playingSong.value.lyricPath) {
    try {
      const lyricArr = (await getLyricApi(playingSong.value.lyricPath)) || []

      // 发送歌词数据到桌面歌词
      await sendLyricDataApi(
        JSON.parse(JSON.stringify(lyricArr)),
        Number(musicStore.currentTime),
        Boolean(musicStore.isPlay)
      )
    } catch (error) {
      console.error('获取歌词失败:', error)
    }
  }
}

// 监听播放状态变化，持续发送数据到桌面歌词
watchEffect(() => {
  if (playingSong.value.lyricPath) {
    getLyric()
  }
  if (currentTime.value !== undefined) {
    // 发送播放状态到桌面歌词
    sendPlayStatusApi(currentTime.value, musicStore.isPlay)
  }
})

// 监听音量变化
watchEffect(() => {
  if (myAudio.value) {
    myAudio.value.volume = getVolume()
  }
})

onMounted(async () => {
  // 获取音频元素
  myAudio.value = document.getElementById('myAudio') as HTMLAudioElement
  // 监听音量变化（跨窗口同步）
  onUpdateVolumeApi((volume) => {
    musicStore.setStore({
      volume: volume
    })
  })
})

// 可播放事件监听
useEventListener(
  'canplay',
  () => {
    musicStore.setStore({
      duration: myAudio.value?.duration || 0
    })
    myAudio.value.volume = getVolume()
  },
  'myAudio'
)
// 播放完成事件监听
useEventListener('ended', playNext, 'myAudio')

onUnmounted(() => {
  musicStore.setStore({
    isPlay: false
  })
})
</script>

<template>
  <div>
    <audio id="myAudio" :loop="playPattern === 'loop'" @timeupdate="timeupdate">
      <source :src="playingSong.filePath" type="audio/mpeg" />
      您的浏览器不支持 audio 元素。
    </audio>
  </div>
</template>

<style lang="less" scoped></style>
