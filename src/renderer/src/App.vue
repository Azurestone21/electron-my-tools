<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const locale = zhCn
import { useIndexStore } from '@renderer/store'
const indexStore = useIndexStore()

// 音频当前播放时间
const timeupdate = (e) => {
  indexStore.setStore({
    currentTime: e.target.currentTime || 0
  })
}
</script>

<template>
  <el-config-provider :locale="locale">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </el-config-provider>

  <audio id="myAudio" @timeupdate="timeupdate">
    <source :src="indexStore.playingSong.songURL" type="audio/mpeg" />
    您的浏览器不支持 audio 元素。
  </audio>
</template>

<style>
@import './assets/main.css';
</style>
