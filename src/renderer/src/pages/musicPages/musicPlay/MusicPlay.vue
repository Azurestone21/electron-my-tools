<!-- 音乐播放页 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const musicStore = useMusicStore()
const { playingSong, basePath } = storeToRefs(musicStore)

import BottomBar from './components/BottomBar.vue'
import Lyric from './components/Lyric.vue'
import MusicList from './components/MusicList.vue'
import Settings from './components/Settings.vue'

const isShowList = ref<boolean>(false)
const onExpandList = () => {
  isShowList.value = !isShowList.value
}
const openSetting = ref<boolean>(false)
const handleSetting = () => {
  openSetting.value = !openSetting.value
}
const getMusicList = async () => {
  const data = await window.musicApi.getMusicData(basePath.value)
  musicStore.setStore({
    musicList: data
  })
}
onMounted(() => {
  getMusicList()
})
proxy.$eventBus.on('openSetting', () => {
  handleSetting()
})
proxy.$eventBus.on('refreshMusic', () => {
  getMusicList()
})
onBeforeUnmount(() => {
  proxy.$eventBus.off('changePlayingSong')
  proxy.$eventBus.off('openSetting')
  proxy.$eventBus.off('refreshMusic')
})
</script>

<template>
  <div class="page">
    <div class="musicPlay">
      <div class="content">
        <div class="left hide-scrollbar"><Lyric /></div>
        <div class="right hide-scrollbar" v-if="isShowList"><MusicList /></div>
      </div>
      <div class="footer">
        <BottomBar @onPropsExpandList="onExpandList" />
      </div>
    </div>
    <div class="bg">
      <img :src="playingSong.imgSrc || ''" />
    </div>
    <Settings :open="openSetting" @onCancel="handleSetting"/>
  </div>
</template>

<style lang="less" scoped>
.page {
  padding: 0;
}
.musicPlay {
  position: relative;
  width: 100%;
  height: calc(100% - 100px);
}
.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
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
.footer {
  position: fixed;
  bottom: 0;
  left: 64px;
  width: calc(100% - 64px);
  height: 100px;
}

</style>
