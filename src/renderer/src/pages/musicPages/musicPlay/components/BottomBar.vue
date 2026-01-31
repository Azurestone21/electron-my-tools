<!-- 底部 音乐播放控制 -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMusicPlayer } from '@renderer/hooks/music/useMusicPlayer'
const { play, playNext, playPrev } = useMusicPlayer()
import { secondsTimeFormat } from '@renderer/hooks/music/common'
import { handleVolumeWheel } from '../../../../hooks/music/volume'

const { proxy } = getCurrentInstance()
const emits = defineEmits(['onPropsExpandList'])

const musicStore = useMusicStore()
const { playingSong, isVideoPlay, duration, currentTime, playPattern, volume } =
  storeToRefs(musicStore)

let myAudio = null // audio
const barWidth = 600 // 进度条宽度

// 打开设置弹窗
const openSetting = () => {
  proxy.$eventBus.emit('openSetting')
}

// 展开音乐列表
const isExpand = ref<boolean>(false)
const onExpandList = () => {
  isExpand.value = !isExpand.value
  emits('onPropsExpandList')
}
// 切换播放模式
const changePlayPattern = () => {
  musicStore.changePlayPattern()
  if (myAudio && playPattern.value) {
    myAudio.loop = playPattern.value == 'loop'
  }
}

// 切换桌面歌词显示/隐藏
const toggleLyricDesktop = async () => {
  await window.musicApi.toggleLyricDesktop()
}
// 音频当前播放时间
// const timeupdate = (e) => {
//   musicStore.setStore({
//     currentTime: e.target.currentTime || 0
//   })
// }
// 音频进度百分比
const percentage = computed<number>(() => {
  return currentTime.value && duration.value
    ? Math.floor((currentTime.value / duration.value) * barWidth)
    : 0
})

// 调节音量
const changeVolume = (e) => {
  musicStore.setStore({
    volume: e.target.value
  })
  if (myAudio) {
    myAudio.volume = e.target.value
  }
}

onMounted(() => {})

useEventListener('click', (event) => changePlayProgress((event as MouseEvent).layerX), 'myProgress')
useEventListener('wheel', handleVolumeWheel, 'volumeControl')
</script>

<template>
  <div class="BottomBar">
    <div class="content">
      <div class="photo">
        <img :src="playingSong.imgSrc || ''" v-if="playingSong.imgSrc" />
        <el-icon color="#ccc" size="40" v-else><Headset /></el-icon>
      </div>

      <div class="bar">
        <!-- <audio id="myAudio" @timeupdate="timeupdate">
          <source :src="playingSong.songURL" type="audio/mpeg" />
          您的浏览器不支持 audio 元素。
        </audio> -->
        <div class="name">{{ playingSong.songname }} - {{ playingSong.songer }}</div>
        <div class="progress-bar">
          <!-- 进度条 -->
          <div
            id="myProgress"
            class="progress_bg"
            :style="{ width: `${MUSIC_PROGRESS_BAR_WIDTH}px` }"
          >
            <div
              class="progress"
              :style="{
                width: percentage + 'px'
              }"
            ></div>
          </div>
          <div class="totalTime">{{ secondsTimeFormat(duration) }}</div>
        </div>
        <div class="handle">
          <!-- 上一首 / 播放/暂停 / 下一首 -->
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
          <div class="video_list">
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
            <!-- 切换播放模式 -->
            <div class="cursor_pointer flex justify-center ml-[20px]" @click="changePlayPattern">
              <text v-if="playPattern == 'normal'">顺</text>
              <text v-if="playPattern == 'loop'">单</text>
            </div>
            <div class="cursor_pointer flex justify-center ml-[20px]" @click="toggleLyricDesktop">
              词
            </div>
            <!-- 展开/收起列表 -->
            <div class="cursor_pointer flex ml-[20px]" @click="onExpandList">
              <el-icon size="24" color="#fff" v-if="isExpand"><Expand /></el-icon>
              <el-icon size="24" color="#fff" v-else><Fold /></el-icon>
            </div>
            <div class="cursor_pointer flex ml-[20px]" @click="openSetting">
              <el-icon size="20" color="#fff"><Setting /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.BottomBar {
  background-color: rgb(108 180 243 / 33%);
  color: #fff;
}
.content {
  padding: 10px;
  display: flex;
  .photo {
    width: 80px;
    height: 80px;
    background-color: rgb(105, 105, 105);
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .bar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    .progress-bar {
      display: flex;
      align-items: center;
    }
    .progress_bg {
      height: 4px;
      border-radius: 2px;
      background-color: #fff;
      position: relative;
      cursor: pointer;
      .progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        cursor: pointer;
        background-color: var(--music-bar-active);
      }
    }
    .totalTime {
      margin-left: 20px;
      font-size: 12px;
    }
  }
  #volumeControl {
    background-color: #fff;
  }
  .handle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // 上一首 / 播放/暂停 / 下一首
    .video_handle {
      width: 120px;
      display: flex;
      align-items: center;
      .before,
      .next {
        color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
      }
      .launch {
        border-radius: 50%;
        color: #fff;
        margin: 0 16px;
        display: flex;
        align-items: center;
      }
    }
    .video_list {
      display: flex;
      align-items: center;
      // 音量
      .volume {
        height: 100%;
        overflow: hidden;
        margin-left: 20px;
        margin-top: -5px;
      }
      input[type='range'] {
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
        background-color: var(--music-bar-active);
        border: 1px solid transparent;
        // margin-top: -13px;
        /* 使用border-image属性给圆形添加渐变边框 */
        border-image: linear-gradient(var(--music-bar-active), var(--music-bar-active)) 0 fill / 3
          10 3 0 / 0px 0px 0 60px;
      }
    }
  }
}
</style>
