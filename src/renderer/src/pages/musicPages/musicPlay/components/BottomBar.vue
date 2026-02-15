<!-- 底部 音乐播放控制 -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@renderer/store/modules/music'
import { useMusicPlayer } from '@renderer/hooks/music/useMusicPlayer'
import { secondsTimeFormat } from '@renderer/hooks/music/common'
import { adjustVolume, handleVolumeWheel } from '../../../../hooks/music/volume'
import { MUSIC_PROGRESS_BAR_WIDTH } from '@renderer/config/music'
import { useEventListener } from '@renderer/hooks/useEventListener'
import {
  Headset,
  CaretLeft,
  VideoPlay,
  VideoPause,
  CaretRight,
  Expand,
  Fold,
  Setting
} from '@element-plus/icons-vue'

const musicStore = useMusicStore()
const { playingSong, isPlay, duration, currentTime, playPattern, volume } = storeToRefs(musicStore)

const { play, playNext, playPrev, changePlayProgress, changePlayPattern } = useMusicPlayer()

defineProps({
  isShowMusicList: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits([
  'onToggleMusicList',
  'onToggleSetting',
  'onToggleDesktopLyric',
  'onToggleMusicStore'
])

// 打开设置弹窗
const openSetting = () => {
  emits('onToggleSetting')
}

// 展开音乐列表
const onToggleMusicList = () => {
  emits('onToggleMusicList')
}

// 切换桌面歌词显示/隐藏
const toggleLyricDesktop = () => {
  emits('onToggleDesktopLyric')
}

const toggleMusicStore = () => {
  emits('onToggleMusicStore')
}
// 音频当前播放时间
// const timeupdate = (e) => {
//   musicStore.setStore({
//     currentTime: e.target.currentTime || 0
//   })
// }
// 音频进度百分比
const percentage = computed<number>(() => {
  return currentTime.value && duration.value ? (currentTime.value / duration.value) * 100 : 0
})

// 调节音量
const changeVolume = (e) => {
  musicStore.setStore({
    volume: e.target.value
  })
  adjustVolume(e.target.value)
}

onMounted(() => {})

useEventListener('click', (event) => changePlayProgress((event as MouseEvent).layerX), 'myProgress')
useEventListener('wheel', handleVolumeWheel, 'volumeControl')
</script>

<template>
  <div class="BottomBar">
    <div class="content">
      <div class="song_cover">
        <div class="photo">
          <img :src="playingSong.imgSrc || ''" v-if="playingSong.imgSrc" />
          <el-icon color="#ccc" size="40" v-else><Headset /></el-icon>
        </div>
      </div>

      <div class="bar">
        <!-- <audio id="myAudio" @timeupdate="timeupdate">
          <source :src="playingSong.songURL" type="audio/mpeg" />
          您的浏览器不支持 audio 元素。
        </audio> -->
        <!-- <div class="name">{{ playingSong.songname }} - {{ playingSong.songer }}</div> -->
        <div class="progress-bar">
          <div class="totalTime">
            {{ secondsTimeFormat(currentTime) }}
          </div>
          <!-- 进度条 -->
          <div id="myProgress" class="progress_bg">
            <div
              class="progress"
              :style="{
                width: percentage + '%'
              }"
            ></div>
          </div>
          <div class="totalTime">
            {{ secondsTimeFormat(duration) }}
          </div>
        </div>
        <div class="play_pattern">
          <!-- 切换播放模式 -->
          <div class="cursor_pointer flex justify-center ml-[20px]" @click="changePlayPattern">
            <text v-if="playPattern == 'normal'">顺</text>
            <text v-if="playPattern == 'loop'">单</text>
          </div>
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
          <div class="cursor_pointer flex justify-center" @click="toggleLyricDesktop">词</div>
        </div>
      </div>
      <div class="handle">
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

          <!-- 展开/收起列表 -->
          <div class="cursor_pointer flex ml-[10px]" @click="onToggleMusicList">
            <el-icon class="handle_icon" v-if="isShowMusicList"><Expand /></el-icon>
            <el-icon class="handle_icon" v-else><Fold /></el-icon>
          </div>
          <div class="cursor_pointer flex ml-[10px]" @click="toggleMusicStore">
            <el-icon class="handle_icon"><HelpFilled /></el-icon>
          </div>
          <div class="cursor_pointer flex ml-[10px]" @click="openSetting">
            <el-icon class="handle_icon"><Operation /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.BottomBar {
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--foreground);
  width: 100%;
  height: 80px;
}
.content {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  .song_cover {
    flex: 1;

    .photo {
      width: 60px;
      height: 60px;
      background-color: rgb(105, 105, 105);
      margin-right: 10px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .bar {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 60%;
    .progress-bar {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .progress_bg {
      margin: 10px;
      width: 100%;
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
        background-color: var(--primary);
      }
    }
    .totalTime {
      font-size: 12px;
    }
  }
  .play_pattern {
    display: flex;
    align-items: center;
  }
  // 上一首 / 播放/暂停 / 下一首
  .video_handle {
    margin: 0 20px;
    width: 120px;
    display: flex;
    align-items: center;
    .before,
    .next {
      color: var(--foreground);
      border: 2px solid var(--foreground);
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

      .handle_icon {
        font-size: 20px;
        color: var(--foreground);
      }
    }
  }
}
</style>
