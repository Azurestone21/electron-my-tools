<!-- 歌词 -->
<script setup lang="ts">
const musicStore = useMusicStore()
const { playingSong, currentTime } = storeToRefs(musicStore)
import { parseTime } from '@renderer/hooks/music/common'

// 当前歌词
const lyricArr = ref([])
const activityLyric = computed(() => {
  if (lyricArr.value.length && musicStore.currentTime) {
    let i = 0
    lyricArr.value.forEach((item, index) => {
      if (parseTime(item.time) <= musicStore.currentTime) {
        i = index
      }
    })
    return i
  }
  return 0
})
// 获取歌词
const getLyric = async () => {
  if (playingSong.value.lyric) {
    lyricArr.value = (await window.musicApi.getLyric(playingSong.value.lyric)) || []
  }
  if (lyricArr.value.length == 0) {
    lyricArr.value.push({
      time: '00:00.00',
      lyric: '~~~~~'
    })
  }
}

// 歌词滚动
let lyricEl = ref()
let ulEl = ref()
const setLyricOffset = () => {
  let maxOffset = 0
  let liHeight = 30
  let clientHeighHalf = 240
  if (lyricEl.value || ulEl.value) {
    clientHeighHalf = lyricEl.value.clientHeight / 2
    maxOffset = ulEl.value.clientHeight - lyricEl.value.clientHeight
  }
  let index: number = activityLyric.value
  let offset =
    liHeight * index + liHeight / 2 - clientHeighHalf
  if (offset < 0) offset = 0
  if (offset > maxOffset) offset = maxOffset
  if (ulEl.value) {
    ulEl.value.style.transform = `translateY(-${offset}px)`
  }
}
const myScroll = (_e) => {
  // console.log('滑动', e.target.scrollTop)
}

onMounted(() => {
  getLyric()
})
watchEffect(() => {
  if (playingSong.value.lyric) {
    getLyric()
  }
  if (currentTime.value) {
    setLyricOffset()
  }
})
</script>

<template>
  <div ref="lyricEl" v-if="lyricArr" class="lyric_container no-copy" @scroll="myScroll($event)">
    <ul ref="ulEl">
      <li
        v-for="(row, index) in lyricArr"
        :key="index"
        :class="{ lyric: true, active: index == activityLyric }"
      >
        {{ row.lyric }}
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.lyric_container {
  height: 100%;
  overflow: hidden;
  text-align: center;
  line-height: 30px;

  &::-webkit-scrollbar {
    display: none;
  }
  ul {
    padding: 0;
  }
  .lyric {
    font-size: 12px;
    color: var(--foreground);
  }
  .active {
    font-size: 16px;
    color: var(--primary);
  }
}
</style>
