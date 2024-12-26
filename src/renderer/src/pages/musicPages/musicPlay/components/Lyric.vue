<!-- 歌词 -->
<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useIndexStore } from '@renderer/store'
const indexStore = useIndexStore()
import { parseTime } from '@renderer/utils/index'

// 当前歌词
const lyricArr = ref([])
const activityLyric = computed(() => {
  if (lyricArr.value.length && indexStore.currentTime) {
    let i = 0
    lyricArr.value.forEach((item, index) => {
      if (parseTime(item.time) <= indexStore.currentTime) {
        i = index
      }
    })
    return i
  }
  return 0
})
// 获取歌词
const getLyric = async () => {
  if (indexStore.playingSong.lyric) {
    lyricArr.value = (await musicApi.getLyric(indexStore.playingSong.lyric)) || []
  }
  if (lyricArr.value.length == 0) {
    lyricArr.value.push({
      time: '00:00.00',
      lyric: '~~~~~'
    })
  }
}
onMounted(() => {
  getLyric()
})
watchEffect(() => {
  if (indexStore.playingSong.lyric) {
    getLyric()
  }
})

const myScroll = (e) => {
  // 保留scrollTop
  // console.log('正在滑动', e.target.scrollTop)
  // 显示timer
  // this.requireShowTimerAndHr = true
}
</script>

<template>
  <div class="no-copy">
    <div v-if="lyricArr" class="lyricArr" @scroll="myScroll($event)">
      <ul>
        <li
          v-for="(row, index) in lyricArr"
          :key="index"
          :class="{ lyric: true, active: index == activityLyric }"
        >
          {{ row.lyric }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
.lyricArr {
  height: 100%;
  overflow: auto;
  text-align: center;
  line-height: 30px;

  &::-webkit-scrollbar {
    display: none;
  }
  .lyric {
    font-size: 12px;
    color: #999;
  }
  .active {
    font-size: 16px;
    color: var(--theme-color-music);
  }
  ul {
    padding: 0;
  }
}
</style>
