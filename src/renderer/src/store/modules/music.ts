import { IPlayingSong, IPlaylist } from '@renderer/types/music'
import { isArray, isObject } from "lodash"

export const useMusicStore = defineStore('music', {
  state: () => ({
    basePath: '', // 音乐根目录
    musicList: [] as IPlaylist[], // 音乐列表
    playlists: [] as IPlaylist[], // 歌单列表
    playingSong: {} as IPlayingSong, // 当前播放音乐
    duration: 0, // 音频时长
    currentTime: 0, // 当前播放事件
    isPlay: false, // 是否正在播放
    playPattern: 'normal', // normal:顺序播放 loop:单曲循环
    volume: 0.05, // 音量

    globalAudioContext: null, // 全局音频上下文
    globalAudioAnalyser: null, // 全局音频分析器
    globalAudioSource: null, // 全局音频源节点
  }),
  getters: {
    // 获取所有歌单
    getAllPlaylists: (state) => state.playlists,
    // 根据ID获取歌单
    getPlaylistById: (state) => (id: number) => {
      return state.playlists.find(playlist => playlist.id === id)
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
    // 修改播放模式
    changePlayPattern() {
      let arr = ['normal', 'loop']
      let i = arr.findIndex((x) => x == this.playPattern)
      if (i < arr.length - 1) {
        this.playPattern = arr[i + 1]
      } else {
        this.playPattern = arr[0]
      }
    },

    // 新建歌单
    createPlaylist(name: string) {
      const newPlaylist: IPlaylist = {
        id: Date.now(),
        listname: name,
        songs: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.playlists.push(newPlaylist)
      return newPlaylist
    },

    // 编辑歌单名称
    updatePlaylistName(id: number, name: string) {
      const playlist = this.playlists.find(p => p.id === id)
      if (playlist) {
        playlist.listname = name
        playlist.updatedAt = Date.now()
      }
    },

    // 删除歌单
    deletePlaylist(id: number) {
      const index = this.playlists.findIndex(p => p.id === id)
      if (index > -1) {
        this.playlists.splice(index, 1)
      }
    },

    // 歌单排序
    sortPlaylists(playlists: IPlaylist[]) {
      this.playlists = playlists
    },

    // 添加歌曲到歌单
    addSongToPlaylist(playlistId: number, song: any) {
      const playlist = this.playlists.find(p => p.id === playlistId)
      if (playlist) {
        // 检查歌曲是否已存在
        const songExists = playlist.songs.some(s => s.id === song.id)
        if (!songExists) {
          playlist.songs.push(song)
          playlist.updatedAt = Date.now()
        }
      }
    },

    // 从歌单删除歌曲
    removeSongFromPlaylist(playlistId: number, songId: number) {
      console.log("🚀 ~ songId:", songId)
      const playlistIndex = this.playlists.findIndex(p => p.id === playlistId)
      console.log("🚀 ~ playlistIndex:", playlistIndex)
      console.log("🚀 ~ this.playlists[playlistIndex]:", this.playlists[playlistIndex])
      if (playlistIndex !== -1) {
        const index = this.playlists[playlistIndex].songs.findIndex(s => s.id === Number(songId))
        console.log("🚀 ~ index:", index)
        if (index > -1) {
          this.playlists[playlistIndex].songs.splice(index, 1)
          this.playlists[playlistIndex].updatedAt = Date.now()
        }
      }
    },

    // 歌单内歌曲排序
    sortPlaylistSongs(playlistId: number, songs: IPlayingSong[]) {
      const playlist = this.playlists.find(p => p.id === playlistId)
      if (playlist) {
        playlist.songs = songs
        playlist.updatedAt = Date.now()
      }
    },

    clearAudioContext() {
      this.globalAudioContext = null
      this.globalAudioAnalyser = null
      this.globalAudioSource = null
    }
  },
  persist: true // 持久化
})
