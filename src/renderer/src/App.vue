<script setup lang="ts">
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
import { ElConfigProvider } from 'element-plus';
import zhCn from'element-plus/es/locale/lang/zh-cn';
const locale = zhCn;
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<style>
@import './assets/main.css';
</style>
