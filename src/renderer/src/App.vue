<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useMusicStore } from './store/modules/music'
import { storeToRefs } from 'pinia'
import { initMainProcessSchedules } from './utils/schedules'
import { watchEffect } from 'vue'
const locale = zhCn
const musicStore = useMusicStore()
const { playingSong, currentTime } = storeToRefs(musicStore)

// 音频当前播放时间
const timeupdate = (e) => {
  musicStore.setStore({
    currentTime: e.target.currentTime || 0
  })
}

// 获取歌词并发送到桌面歌词
const getLyric = async () => {
  if (playingSong.value.lyric) {
    try {
      const lyricArr = await window.musicApi.getLyric(playingSong.value.lyric) || []
      
      // 发送歌词数据到桌面歌词
      await window.musicApi.sendLyricData(
        JSON.parse(JSON.stringify(lyricArr)),
        Number(musicStore.currentTime),
        Boolean(musicStore.isVideoPlay)
      )
    } catch (error) {
      console.error('获取歌词失败:', error)
    }
  }
}

// 监听播放状态变化，持续发送数据到桌面歌词
watchEffect(() => {
  if (playingSong.value.lyric) {
    getLyric()
  }
  if (currentTime.value !== undefined) {
    // 发送播放状态到桌面歌词
    window.musicApi.sendPlayStatus(currentTime.value, musicStore.isVideoPlay)
  }
})

onMounted(() => {
  // 监听主进程发送的通知
  initMainProcessSchedules()
})
</script>

<template>
  <el-config-provider :locale="locale">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </el-config-provider>

  <audio id="myAudio" @timeupdate="timeupdate">
    <source :src="playingSong.songURL" type="audio/mpeg" />
    您的浏览器不支持 audio 元素。
  </audio>
</template>

<style>
@import './assets/main.css';
</style>
