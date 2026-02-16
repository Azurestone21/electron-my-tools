export interface IAudioMetadata {
  id: number
  fileName: string
  filePath: string
  songName: string
  songer: string
  lyricPath: string
  coverPath: string
  size: number
  containerFormat: string
}

// 歌曲类型定义
export interface IPlayingSong extends IAudioMetadata {
  parentIndex: number
}

// 歌单类型定义
export interface IPlaylist {
  id: number
  listname: string // 歌单名称
  songs: IPlayingSong[] // 歌曲列表
  createdAt: number
  updatedAt: number
}

export type TMusicPlayType = 'play' | 'pause' | 'before' | 'next'
export type TKeyCodeType = 'Space' | 'ArrowLeft' | 'ArrowRight'
