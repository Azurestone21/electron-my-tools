// export interface IMusic {
//   id: number
//   listname: string // 目录名称
//   songs: IPlayingSong[] // 歌曲列表
// }
// 歌单类型定义
export interface IPlaylist {
  id: number
  listname: string  // 歌单名称
  songs: IPlayingSong[] // 歌曲列表
  createdAt: number
  updatedAt: number
}
// 歌曲类型定义
export interface IPlayingSong {
  parentIndex: number
  id: number
  listname: string // 目录名称
  filename: string // 文件名
  songname: string // 歌曲名称
  songURL: string // 歌曲文件路径
  songIndex: number // 歌曲索引
  songer: string // 歌手
  imgSrc: string // 封面 URL
  lyric: string // 歌词文件路径
  isLoadDown: boolean // 是否下载完成
  songs: IPlayingSong[] // 歌曲列表
}

export type TMusicPlayType = 'play' | 'pause' | 'before' | 'next'
export type TKeyCodeType = 'Space' | 'ArrowLeft' | 'ArrowRight'
