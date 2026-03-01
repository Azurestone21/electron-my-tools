export interface IAudioMetadata {
  id: string
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
  parentId: string
}

// 歌单类型定义
export interface IPlaylist {
  id: string
  listname: string // 歌单名称
  songs: IPlayingSong[] // 歌曲列表
  createdAt: number
  updatedAt: number
}

export type TMusicPlayType = 'play' | 'pause' | 'before' | 'next'
export type TKeyCodeType = 'Space' | 'ArrowLeft' | 'ArrowRight'
