<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useMusicStore } from './store/modules/music'
import { storeToRefs } from 'pinia'
import { initMainProcessSchedules } from './utils/schedules'
const locale = zhCn
const musicStore = useMusicStore()
const { playingSong } = storeToRefs(musicStore)

// 音频当前播放时间
const timeupdate = (e) => {
  musicStore.setStore({
    currentTime: e.target.currentTime || 0
  })
}

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
