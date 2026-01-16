<!-- 底部 音乐播放控制 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const musicStore = useMusicStore()
const { playingSong, isVideoPlay, currentTime, musicList, playPattern } = storeToRefs(musicStore)
import { secondsTimeFormat, MusicPlayType, KeyCodeType, getPlayMusic } from '@renderer/utils/music-play'
const emits = defineEmits(['onPropsExpandList'])

let myAudio = null // audio
let duration = 0 // 音频时长
const barWidth = 600  // 进度条宽度
const musicTime = ref<string>('00:00') // 音频时间

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
// 改变播放模式
const changePlayPattern = () => {
  musicStore.changePlayPattern()
  if (myAudio && playPattern.value) {
    myAudio.loop = playPattern.value == 'loop'
  }
}
// 音频当前播放时间
// const timeupdate = (e) => {
//   musicStore.setStore({
//     currentTime: e.target.currentTime || 0
//   })
// }
// 音频进度百分比
const percentage = computed<number>(() => {
  return currentTime.value && duration ? Math.floor((currentTime.value / duration) * barWidth) : 0
})
// 播放/暂停音乐
const play = (refresh) => {
  if (refresh) {
    myAudio.load()
    myAudio.currentTime = 0
    musicStore.setStore({
      currentTime: 0
    })
  }
  if (myAudio.paused) {
    myAudio.currentTime = currentTime.value
    myAudio.play()
  } else {
    myAudio.pause()
  }
  musicStore.setStore({
    isVideoPlay: !myAudio.paused
  })
}
// 上一首 / 下一首
const changeMusic = (type: string) => {
  const song =  getPlayMusic(type, musicList.value, playingSong.value)
  musicStore.setStore({
    playingSong: song
  })
  play(true)
}

onMounted(() => {
  myAudio = document.getElementById('myAudio') as HTMLAudioElement

  // 监听播放完成事件
  myAudio.addEventListener(
    'ended',
    function () {
      changeMusic('next')
    },
    false
  )
  // 浏览器可以开始播放时，在dom挂载完直接获取duration会返回NaN
  myAudio.addEventListener('canplay', function () {
    duration = myAudio.duration // 时长
    myAudio.volume = 0.05 // 音量
    myAudio.loop = playPattern.value == 'loop' // 单曲循环
    musicTime.value = secondsTimeFormat(myAudio.duration)
  })
  // 获取鼠标点击的位置，改变播放进度
  const progressEl = document.getElementById('myProgress')
  progressEl.addEventListener('click', function (event) {
    if (myAudio.duration) {
      let t = Math.floor((event.layerX / barWidth) * myAudio.duration)
      myAudio.currentTime = t
      musicStore.setStore({
        currentTime: t
      })
    }
  })
  // 监听滑块的变化改变音量
  const volumeControl = document.getElementById('volumeControl') as HTMLInputElement
  volumeControl.addEventListener('input', function () {
    myAudio.volume = this.value
  })
  // 监听键盘事件
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case KeyCodeType.Space:
        play(false)
        break
      case KeyCodeType.ArrowLeft:
        changeMusic('before')
        break
      case KeyCodeType.ArrowRight:
        changeMusic('next')
        break
    }
  })
})
// 接收列表点击切换歌曲的事件
proxy.$eventBus.on('changePlayingSong', () => {
  play(true)
})
// 监听主线程的事件
window.musicApi.onHandleMusicPlay((value:string) => {
  if (value == MusicPlayType.play || value == MusicPlayType.pause) {
    play(false)
  } else {
    changeMusic(value)
  }
})
</script>

<template>
  <div class="BottomBar">
    <div class="content">
      <div class="photo flex-center">
        <img :src="playingSong.imgSrc || ''" v-if="playingSong.imgSrc" />
        <el-icon color="#ccc" size="40" v-else><Headset /></el-icon>
      </div>

      <div class="bar">
        <!-- <audio id="myAudio" @timeupdate="timeupdate">
          <source :src="playingSong.songURL" type="audio/mpeg" />
          您的浏览器不支持 audio 元素。
        </audio> -->
        <div class="name">{{ playingSong.songname }} - {{ playingSong.songer }}</div>
        <div class="flex-algin-center">
          <!-- 进度条 -->
          <div class="progress_bg" :style="{ width: `${barWidth}px` }" id="myProgress">
            <div
              class="progress"
              :style="{
                width: percentage + 'px'
              }"
            ></div>
          </div>
          <div class="totalTime">{{ musicTime }}</div>
        </div>
        <div class="handle flex-row-between-center">
          <!-- 上一首 / 播放/暂停 / 下一首 -->
          <div class="video_handle flex-row-between-center">
            <div class="before cursor_pointer flex-center" @click="changeMusic('before')">
              <el-icon size="24"><CaretLeft /></el-icon>
            </div>
            <div class="launch cursor_pointer flex-center" @click="play(false)">
              <el-icon size="34" v-if="isVideoPlay"><VideoPause /></el-icon>
              <el-icon size="34" v-else><VideoPlay /></el-icon>
            </div>
            <div class="next cursor_pointer flex-center" @click="changeMusic('next')">
              <el-icon size="24"><CaretRight /></el-icon>
            </div>
          </div>
          <div class="video_list">
            <div class="volume">
              <input id="volumeControl" type="range" min="0" max="1" step="0.01" value="0.1" />
            </div>
            <!-- 切换播放模式 -->
            <div class="cursor_pointer flex-center ml-[20px]" @click="changePlayPattern">
              <text v-if="playPattern == 'normal'">顺</text>
              <text v-if="playPattern == 'loop'">单</text>
            </div>
            <div class="cursor_pointer ml-[20px]">词</div>
            <!-- 展开/收起列表 -->
            <div class="cursor_pointer flex-center ml-[20px]" @click="onExpandList">
              <el-icon size="24" color="#fff" v-if="isExpand"><Expand /></el-icon>
              <el-icon size="24" color="#fff" v-else><Fold /></el-icon>
            </div>
            <div class="cursor_pointer ml-[20px]" @click="openSetting">
              <el-icon size="24" color="#fff"><Setting /></el-icon>
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
    // 上一首 / 播放/暂停 / 下一首
    .video_handle {
      width: 120px;
      .before,
      .next {
        width: 30px;
        height: 30px;
        color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
      }
      .launch {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        color: #fff;
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
