<!-- 音乐列表 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance();
const musicStore = useMusicStore()
const { playingSong, musicList } = storeToRefs(musicStore)

// 计算当前播放的专辑索引
const activeNames = computed(() => {
  return playingSong.value.parentIndex + ''
})
// 切换播放歌曲
const changePlayingSong = (song) => {
  musicStore.setStore({
    playingSong: song,
    currentTime: 0,
    isVideoPlay: false
  })
  proxy.$eventBus.emit('changePlayingSong')
}
</script>

<template>
  <div class="music_list no-copy cursor_pointer">
    <el-collapse accordion v-model="activeNames">
      <el-collapse-item
        class="collapse_item"
        :title="item.listname"
        :name="item.id + ''"
        v-for="item in musicList"
        :key="item.id"
      >
        <div
          class="song_item flex-row-between-center"
          v-for="song in item.songs"
          :key="song.id"
          @dblclick="changePlayingSong(song)"
        >
          <div :class="{ song_name: true, active: playingSong.songname == song.songname }">
            {{ song.id + 1 }} {{ song.songname }} - {{ song.songer }}
          </div>
          <div class="time">{{}}</div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style lang="less" scoped>
.music_list {
  height: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  :deep(.el-collapse)  {
    background-color: transparent !important;
    border: none !important;
  }
  :deep(.el-collapse-item__header) {
    background-color: transparent !important;
    border: none !important;
    color: #ccc;
    height: 30px;
    // padding: 0 10px;
  }
  :deep(.el-collapse-item__wrap) {
    background-color: transparent !important;
    border: none !important;
  }
  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
  .song_item {
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    background-color: transparent !important;
    color: #ccc;
    padding: 0 10px;
    &:nth-child(odd) {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    &:nth-child(even) {
      // background-color: transparent;
    }
    .song_name {
      width: 80%;
      white-space: nowrap;
      overflow: hidden;
    }
    .active,
    &:hover {
      color: var(--theme-color-music);
    }
    .time {
      width: 20%;
      flex-shrink: 0;
    }
  }
}
</style>
