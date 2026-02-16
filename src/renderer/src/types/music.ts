// export interface IMusic {
//   id: number
//   listname: string // 目录名称
//   songs: IPlayingSong[] // 歌曲列表
// }
// 歌单类型定义
export interface IPlaylist {
  id: number
  listname: string // 歌单名称
  songs: IPlayingSong[] // 歌曲列表
  createdAt: number
  updatedAt: number
}
// 歌曲类型定义
export interface IPlayingSong {
  parentIndex: number
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

export type TMusicPlayType = 'play' | 'pause' | 'before' | 'next'
export type TKeyCodeType = 'Space' | 'ArrowLeft' | 'ArrowRight'
