export interface VideoMetadata {
  id: string
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

export interface IVideo extends VideoMetadata {
  parentId: string
}

export interface IVideoList {
  id: string
  name: string
  list: IVideo[]
  createdAt: number
  updatedAt: number
}
