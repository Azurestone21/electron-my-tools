<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const locale = zhCn
import AppAudio from './components/AppAudio.vue'
const musicStore = useMusicStore()
const { initSchedules } = useSchedule()

onMounted(async () => {
  // 初始化主进程的日程列表
  initSchedules()
})

onBeforeUnmount(() => {
  musicStore.clearAudioContext()
})
</script>

<template>
  <el-config-provider :locale="locale">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </el-config-provider>

  <app-audio />
</template>

<style>
@import './assets/main.css';
</style>
