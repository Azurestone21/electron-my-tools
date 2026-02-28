// 转码配置类型定义
export interface ITranscodeConfig {
  // 视频设置
  video: {
    codec: string // 视频编码器
    preset: string // 编码预设（速度和压缩率的平衡）
    crf: number // 恒定速率因子（0-51，0无损，23默认）
    maxBitrate?: string // 最大比特率
  }

  // 音频设置
  audio: {
    codec: string // 音频编码器
    bitrate: string // 音频比特率
    channels?: number // 声道数
  }

  // 输出设置
  output: {
    format: string // 输出格式
    fastStart: boolean // 快速启动（适用于网络播放）
    overwrite: boolean // 覆盖现有文件
  }
}
