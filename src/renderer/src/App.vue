<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const locale = zhCn
import AppAudio from './components/AppAudio.vue'
import { initMainProcessSchedules } from './hooks/schedules/schedules'

onMounted(async () => {
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

  <app-audio />
</template>

<style>
@import './assets/main.css';
</style>
