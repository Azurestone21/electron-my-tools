<!-- 视频播放页 -->
<script setup lang="ts">
import MyTabs from '@renderer/components/MyTabs.vue'
import VideoStore from '@renderer/pages/videoPages/components/VideoStore.vue'

import { useEventListener } from '@renderer/hooks/useEventListener'
import { formatDuration } from '@renderer/utils'
import { storeToRefs } from 'pinia'
const videoStore = useVideoStore()
const { currentTime, volume, isPlay, videoList, playingVideo, playbackRate } =
  storeToRefs(videoStore)

const videoRef = ref<HTMLVideoElement>()
const isShowList = ref<boolean>(false)
const videoTabs = ref<{ key: string; name: string }[]>([])
const activeTab = ref<string>('')

const contextMenuVisible = ref<boolean>(false)
const contextMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const selectedVideo = ref<any>(null)

onMounted(() => {
  videoTabs.value = getVideoTabs()
  activeTab.value = videoTabs.value[0].key
})

// 视频集合列表标签
const getVideoTabs = () => {
  return videoList.value.map((item) => {
    return {
      key: item.id + '',
      name: item.name
    }
  })
}

// 切换视频列表
const handleChangeTab = (tabKey: string) => {
  activeTab.value = tabKey
}

// 当前播放视频列表
const currentVideoList = computed(() => {
  if (activeTab.value) {
    return videoList.value.find((item) => item.id + '' === activeTab.value)
  } else {
    return videoList.value[0]
  }
})

// 添加视频
const addVideoToList = async () => {
  const videos = await window.videoHandle.selectVideoFile()
  if (videos && videos.length > 0) {
    if (videoList.value.length === 0) {
      videoStore.createPlaylist('默认列表')
    }
    const defaultPlaylist = videoList.value[0]
    videos.forEach((video) => {
      videoStore.addVideoToPlaylist(defaultPlaylist.id, video)
    })
  }
}

// 播放上一个视频
const playPrev = () => {
  const currentIndex = currentVideoList.value.list.findIndex(
    (item) => item.id === playingVideo.value.id
  )
  if (currentIndex > 0) {
    playVideo(currentVideoList.value.list[currentIndex - 1])
  } else {
    playVideo(currentVideoList.value.list[currentVideoList.value.list.length - 1])
  }
}
// 播放下一个视频
const playNext = () => {
  const currentIndex = currentVideoList.value.list.findIndex(
    (item) => item.id === playingVideo.value.id
  )
  if (currentIndex < currentVideoList.value.list.length - 1) {
    playVideo(currentVideoList.value.list[currentIndex + 1])
  } else {
    playVideo(currentVideoList.value.list[0])
  }
}
// 播放/暂停视频
const play = (refresh: boolean = false) => {
  if (!videoRef.value) return

  if (refresh) {
    videoRef.value.load()
    videoRef.value.currentTime = 0
    videoStore.setStore({
      currentTime: 0
    })
  }

  if (videoRef.value.paused) {
    videoRef.value.currentTime = videoStore.currentTime
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }

  videoStore.setStore({
    isPlay: !videoRef.value.paused
  })
}
// 切换视频
const playVideo = (video) => {
  videoStore.setStore({
    playingVideo: video
  })
  play(true)
}

// 更新当前播放时间
const updateCurrentTime = (e) => {
  videoStore.setStore({
    currentTime: e.target.currentTime || 0
  })
}
// 改变播放时间
const changePlayProgress = (e: any) => {
  if (!videoRef.value) return // 视频未初始化则忽略
  const progressBar = document.getElementById('videoProgress') as HTMLElement
  if (playingVideo.value.duration) {
    let t = Math.floor((e.layerX / progressBar.clientWidth) * playingVideo.value.duration)
    videoRef.value.currentTime = t
    videoStore.setStore({
      currentTime: t
    })
  }
}
// 视频进度百分比
const percentage = computed<number>(() => {
  return currentTime.value && playingVideo.value.duration
    ? (currentTime.value / playingVideo.value.duration) * 100
    : 0
})

// 获取当前音量（确保返回有效数字）
const getVolume = () => {
  return typeof volume.value === 'number' && isFinite(volume.value) ? volume.value : 0.05
}
// 调整音量（增加或减少）
const adjustVolume = (delta: number) => {
  // 确保当前音量是有效的数字
  let currentVolume = getVolume()
  let newVolume = currentVolume + Number(delta || 0)
  // 限制音量范围在0到1之间
  if (newVolume < 0) newVolume = 0
  if (newVolume > 1) newVolume = 1
  // 确保新音量是有效的数字
  if (!isFinite(newVolume)) {
    newVolume = 0
  }

  videoRef.value.volume = newVolume
  videoStore.setStore({
    volume: newVolume
  })
}
// 处理音量区域的鼠标滚轮事件
const handleVolumeWheel = (e: WheelEvent) => {
  e.preventDefault()
  // 滚轮向上滚动增加音量，向下滚动减少音量
  const delta = e.deltaY < 0 ? 0.05 : -0.05
  adjustVolume(delta)
}
// 调节音量
const changeVolume = (e) => {
  const newVolume = Number(e.target.value)
  videoRef.value.volume = newVolume
  videoStore.setStore({
    volume: newVolume
  })
}

// 处理倍速选择改变
const handleSpeedChange = (e) => {
  const newRate = Number(e.target.value)
  videoRef.value.playbackRate = newRate
  videoStore.setStore({
    playbackRate: newRate
  })
}

// 展开/收起列表
const toggleShowList = () => {
  isShowList.value = !isShowList.value
  videoTabs.value = getVideoTabs()
}

// 打开视频库
const toggleVideoStore = () => {
  isShowVideoStore.value = !isShowVideoStore.value
}

onMounted(() => {
  videoStore.initializeStore()
})

onBeforeUnmount(() => {
  videoRef.value.pause()
  videoStore.setStore({
    isPlay: false
  })
})

useEventListener('wheel', handleVolumeWheel, 'volumeControl')
</script>

<template>
  <div class="page">
    <div class="video_container">
      <video ref="videoRef" class="video_player" @timeupdate="updateCurrentTime">
        <source :src="playingVideo.filePath" type="video/mp4" />
      </video>
      <div class="video_play_handle">
        <div class="bar">
          <!-- 播放进度 -->
          <div class="progress-bar">
            <!-- 进度条 -->
            <div class="progress_bg" id="videoProgress" @click="changePlayProgress">
              <div
                class="progress"
                :style="{
                  width: percentage + '%'
                }"
              ></div>
            </div>
            <div class="totalTime">
              {{ formatDuration(currentTime) }} / {{ formatDuration(playingVideo?.duration || 0) }}
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="play_pattern">
            <!-- 上一集 / 播放/暂停 / 下一集 -->
            <div class="video_handle">
              <div class="before cursor_pointer" @click="playPrev">
                <el-icon size="24"><CaretLeft /></el-icon>
              </div>
              <div class="launch cursor_pointer" @click="play(false)">
                <el-icon size="34" v-if="isPlay"><VideoPause /></el-icon>
                <el-icon size="34" v-else><VideoPlay /></el-icon>
              </div>
              <div class="next cursor_pointer" @click="playNext">
                <el-icon size="24"><CaretRight /></el-icon>
              </div>
            </div>
          </div>

          <div class="handle">
            <!-- 音量 -->
            <div class="volume">
              <input
                id="volumeControl"
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="changeVolume"
              />
            </div>

            <!-- 倍速控制 -->
            <div class="speed_container">
              <select v-model="playbackRate" @change="handleSpeedChange" class="speed_select">
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <!-- 展开/收起列表 -->
            <div class="cursor_pointer flex ml-[10px]" @click="toggleShowList">
              <el-icon class="handle_icon" v-if="isShowList"><Expand /></el-icon>
              <el-icon class="handle_icon" v-else><Fold /></el-icon>
            </div>

            <div class="cursor_pointer flex ml-[10px]" @click="toggleVideoStore">
              <el-icon class="handle_icon"><HelpFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="video_list" v-show="isShowList">
      <div class="video_list_header">
        <div class="video_list_title">播放列表</div>
      </div>
      <div class="video_list_tabs">
        <MyTabs :tabs="videoTabs" :activeTab="activeTab" @onChangeTab="handleChangeTab" />
      </div>
      <div class="video_list_content">
        <div
          class="video_list_item"
          :class="{ active: item.id === playingVideo.id }"
          v-for="(item, index) in currentVideoList?.list"
          :key="item.id"
          @dblclick="playVideo(item)"
        >
          <div>{{ index + 1 }}. {{ item.fileName }}</div>
          <div>{{ formatDuration(item.duration) }}</div>
        </div>
      </div>
    </div>

    <VideoStore :open="isShowVideoStore" @onCancel="toggleVideoStore" />
  </div>
</template>

<style lang="less" scoped>
div {
  user-select: none;
}
.page {
  padding: 0;
  height: 100%;
  display: flex;
}
.video_container {
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .video_player {
    width: 100%;
    height: 0;
    flex: 1;
  }

  .video_play_handle {
    width: 100%;
    height: 60px;
    background-color: var(--card);
    border: 1px solid var(--border);
  }

  .bar {
    width: 100%;

    .progress-bar {
      flex: 1;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0 10px;
    }
    .progress_bg {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background-color: var(--border);
      position: relative;
      cursor: pointer;
      .progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        cursor: pointer;
        background-color: var(--primary);
      }
    }
    .totalTime {
      margin-left: 10px;
      flex-shrink: 0;
      font-size: 12px;
      color: var(--foreground);
    }
  }

  .play_pattern {
    display: flex;
    align-items: center;
  }
  // 上一首 / 播放/暂停 / 下一首
  .video_handle {
    margin: 0 10px;
    width: 120px;
    display: flex;
    align-items: center;
    .before,
    .next {
      color: var(--foreground);
      border-radius: 50%;
      display: flex;
      align-items: center;
    }
    .launch {
      border-radius: 50%;
      color: var(--foreground);
      margin: 0 16px;
      display: flex;
      align-items: center;
    }
  }
  .handle {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 10px;

    // 音量
    .volume {
      height: 100%;
      overflow: hidden;
      margin-left: 20px;
      margin-top: -5px;
    }
    input[type='range'] {
      background-color: var(--border);
      -webkit-appearance: none; // 去掉默认的样式
      appearance: none;
      width: 68px;
      height: 4px;
      border-radius: 2px;
    }
    /* 定义range控件容器的样式 */
    [type='range' i]::-webkit-slider-container {
    }
    /* 滑块样式  圆形*/
    [type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      cursor: default;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary);
      border: 1px solid transparent;
      // margin-top: -13px;
      /* 使用border-image属性给圆形添加渐变边框 */
      border-image: linear-gradient(var(--primary), var(--primary)) 0 fill / 3 10 3 0 / 0px 0px 0
        60px;
    }

    .speed_container {
      margin-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .speed_select {
      cursor: pointer;
      text-align: center;
      background-color: var(--card);
      color: var(--foreground);
    }

    .handle_icon {
      font-size: 20px;
      color: var(--foreground);
    }
  }
}
.video_list {
  width: 300px;
  height: 100%;
  background-color: var(--card);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;

  .video_list_header {
    height: 40px;
    line-height: 40px;
    padding: 12px 10px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .video_list_title {
      font-size: 16px;
      color: var(--foreground);
    }
    .add_video {
      cursor: pointer;
      font-size: 14px;
      color: var(--foreground);
    }
  }

  .video_list_tabs {
    padding: 0 10px;
  }

  .video_list_content {
    flex: 1;
    overflow: auto;
    margin: 10px 0;
    .video_list_item {
      padding: 5px 10px;
      cursor: pointer;
      font-size: 14px;
      color: var(--foreground);
      &:hover {
        background-color: var(--border);
      }
      &.active {
        color: var(--primary);
      }
    }
  }
}
</style>
