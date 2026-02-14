export interface IVideo {
  id: number
  fileName: string
  filePath: string
  fileSize: number
  duration: number
  width: number
  height: number
  videoCodec: string
  audioCodec: string
  containerFormat: string
}

export interface IVideoList {
  id: number
  name: string
  list: IVideo[]
  createdAt: number
  updatedAt: number
}
