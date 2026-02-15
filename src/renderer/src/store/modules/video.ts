import { IVideo, IVideoList } from '@renderer/types/video'
import { isArray, isObject } from 'lodash'

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoList: [] as IVideoList[], // 视频列表
    playingVideo: {} as IVideo, // 当前播放视频
    currentTime: 0, // 当前播放事件
    isPlay: false, // 是否正在播放
    playbackRate: 1, // 倍速
    volume: 0.05 // 音量
  }),
  getters: {
    // 获取所有视频
    getAllVideos: (state) => state.videoList,
    // 根据ID获取视频
    getVideoById: (state) => (id: number) => {
      return state.videoList.find((video) => video.id === id)
    }
  },

  actions: {
    setStore(payload) {
      let keys = Object.keys(payload)
      keys.forEach((item) => {
        if (isArray(payload[item])) {
          this[item] = payload[item]
        } else if (isObject(payload[item])) {
          this[item] =
            Object.keys(payload[item]).length > 0
              ? Object.assign({}, this[item], payload[item])
              : payload[item]
        } else {
          this[item] = payload[item]
        }
      })
    },

    // 新建歌单
    createPlaylist(name: string) {
      const newPlaylist: IVideoList = {
        id: Date.now(),
        name: name,
        list: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.videoList.push(newPlaylist)
      return newPlaylist
    },

    // 编辑歌单名称
    updatePlaylistName(id: number, name: string) {
      const playlist = this.videoList.find((p) => p.id === id)
      if (playlist) {
        playlist.name = name
        playlist.updatedAt = Date.now()
      }
    },

    // 删除视频
    deletePlaylist(id: number) {
      const index = this.videoList.findIndex((p) => p.id === id)
      if (index > -1) {
        this.videoList.splice(index, 1)
      }
    },

    // 视频排序
    sortPlaylists(playlists: IVideoList[]) {
      this.videoList = playlists
    },

    // 添加视频到视频合集
    addVideoToPlaylist(playlistId: number, video: IVideo) {
      console.log("🚀 ~ this.videoList:", video)
      const playlist = this.videoList.find((p) => p.id === playlistId)
      console.log("🚀 ~ playlist:", playlist)
      if (playlist) {
        // 检查视频是否已存在
        const videoExists = playlist.list?.some((s) => s.filePath === video.filePath)
        if (!videoExists) {
          playlist.list.push(video)
          playlist.updatedAt = Date.now()
        }
      }
    },

    // 从歌单删除视频
    removeVideoFromPlaylist(playlistId: number, videoId: number) {
      console.log('🚀 ~ videoId:', videoId)
      const playlistIndex = this.videoList.findIndex((p) => p.id === playlistId)
      console.log('🚀 ~ playlistIndex:', playlistIndex)
      console.log('🚀 ~ this.videoList[playlistIndex]:', this.videoList[playlistIndex])
      if (playlistIndex !== -1) {
        const index = this.videoList[playlistIndex].list.findIndex((s) => s.id === Number(videoId))
        console.log('🚀 ~ index:', index)
        if (index > -1) {
          this.videoList[playlistIndex].list.splice(index, 1)
          this.videoList[playlistIndex].updatedAt = Date.now()
        }
      }
    },

    // 视频内视频排序
    sortPlaylistVideos(playlistId: number, videos: IVideo[]) {
      const playlist = this.videoList.find((p) => p.id === playlistId)
      if (playlist) {
        playlist.list = videos
        playlist.updatedAt = Date.now()
      }
    },

    // 清空数据
    clearAllData() {
      this.videoList = []
      this.playingVideo = {} as IVideo
      this.currentTime = 0
      this.isPlay = false
      this.playbackRate = 1
      this.volume = 0.05
    }
  },
  persist: true // 持久化
})
