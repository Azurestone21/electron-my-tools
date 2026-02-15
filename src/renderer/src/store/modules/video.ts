import { IVideo, IVideoList } from '@renderer/types/video'
import { isArray, isObject } from 'lodash'

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoList: [] as IVideoList[], // 视频列表
    currentTab: '1', // 当前选中的视频列表
    playingVideo: {} as IVideo, // 当前播放视频
    currentTime: 0, // 当前播放事件
    isPlay: false, // 是否正在播放
    playbackRate: 1, // 倍速
    volume: 0.05 // 音量
  }),
  getters: {
    getActiveListId: (state) => {
      return state.currentTab || state.playingVideo?.parentId || 1
    },
    getCurrentList: (state) => {
      const activeListId = state.currentTab || state.playingVideo?.parentId || 1
      return state.videoList.find((p) => p.id + '' === activeListId + '') || state.videoList[0]
    },
    getVideoTabs: (state) => {
      return state.videoList.map((item) => {
        return {
          key: item.id + '',
          name: item.name
        }
      })
    }
  },

  actions: {
    // 初始化数据
    initializeStore() {
      if (!this.videoList || this.videoList.length === 0) {
        this.videoList = [
          {
            id: 1,
            name: '默认合集',
            list: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ]
      }
    },

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
      const playlist = this.videoList.find((p) => p.id === playlistId)
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
      const playlistIndex = this.videoList.findIndex((p) => p.id === playlistId)
      if (playlistIndex !== -1) {
        const index = this.videoList[playlistIndex].list.findIndex((s) => s.id === Number(videoId))
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
