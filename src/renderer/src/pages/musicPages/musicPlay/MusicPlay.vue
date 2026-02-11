<!-- 音乐播放页 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const musicStore = useMusicStore()
const { playingSong, basePath } = storeToRefs(musicStore)
import { useMusicPlayer } from '@renderer/hooks/music/useMusicPlayer'
const { play } = useMusicPlayer()

import BottomBar from './components/BottomBar.vue'
import Lyric from './components/Lyric.vue'
import MusicList from './components/MusicList.vue'
import Settings from './components/Settings.vue'
import MusicStore from './components/MusicStore.vue'
import AudioSpectrum from './components/AudioSpectrum.vue'

// 初始化音乐列表
const getMusicList = async () => {
  const data = await window.musicApi.getMusicData(basePath.value)
  musicStore.setStore({
    musicList: data
  })
}
// 切换播放歌曲
const changePlayingSong = (song) => {
  musicStore.setStore({
    playingSong: song,
    currentTime: 0,
    isPlay: false
  })
  play(true)
}
// 音乐列表是否显示
const isShowMusicList = ref<boolean>(false)
const onToggleMusicList = () => {
  isShowMusicList.value = !isShowMusicList.value
}
// 设置抽屉是否显示
const openSetting = ref<boolean>(false)
const toggleSetting = () => {
  openSetting.value = !openSetting.value
}
// 桌面歌词
const toggleLyricDesktop = async () => {
  await window.musicApi.toggleLyricDesktop()
}
// 音乐库
const isShowMusicStore = ref<boolean>(false)
const toggleMusicStore = async () => {
  isShowMusicStore.value = !isShowMusicStore.value
}

onMounted(() => {
  getMusicList()
})

// 监听刷新音乐列表事件
proxy.$eventBus.on('refreshMusic', () => {
  getMusicList()
})
onBeforeUnmount(() => {
  proxy.$eventBus.off('refreshMusic')
})
</script>

<template>
  <div class="page">
    <div id="musicPlay" class="musicPlay">
      <div class="content">
        <div class="left hide-scrollbar"><Lyric /></div>
        <div class="right hide-scrollbar" v-if="isShowMusicList">
          <MusicList @changePlayingSong="changePlayingSong" />
        </div>
      </div>
      <div class="audio-spectrum-wrapper">
        <AudioSpectrum />
      </div>
      <div class="footer">
        <BottomBar
          :isShowMusicList="isShowMusicList"
          @onToggleMusicList="onToggleMusicList"
          @onToggleSetting="toggleSetting"
          @onToggleDesktopLyric="toggleLyricDesktop"
          @onToggleMusicStore="toggleMusicStore"
        />
      </div>
    </div>
    <div class="bg">
      <img :src="playingSong.imgSrc || ''" />
    </div>
    <Settings :open="openSetting" @onCancel="toggleSetting" />
    <MusicStore :open="isShowMusicStore" @onCancel="toggleMusicStore" />
  </div>
</template>

<style lang="less" scoped>
div {
  user-select: none;
}
.page {
  padding: 0;
}
.musicPlay {
  position: relative;
  z-index: 1;
  width: 100%;
  height: calc(100% - 100px);
}
.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  img {
    width: 100%;
    height: 100%;
    filter: blur(5px);
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* 设置蒙版颜色和透明度 */
    z-index: 1;
  }
}
.content {
  display: flex;
  height: 100%;
  .left,
  .right {
    flex: 1;
    flex-shrink: 0;
    overflow: auto;
  }
  .right {
    flex: 1;
    width: 50%;
  }
}
.audio-spectrum-wrapper {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100px;
  padding-left: 80px;
}
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
