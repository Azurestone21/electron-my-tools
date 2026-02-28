import { ITranscodeConfig } from '@share/types/transcodeConfig'

// 默认转码配置
export const defaultTranscodeConfig: ITranscodeConfig = {
  video: {
    codec: 'libx264',
    preset: 'fast',
    crf: 23
  },
  audio: {
    codec: 'aac',
    bitrate: '192k'
  },
  output: {
    format: 'mp4',
    fastStart: true,
    overwrite: true
  }
}

// 支持的视频编码器
export const supportedVideoCodecs = [
  { value: 'libx264', label: 'H.264 (libx264)' },
  { value: 'libx265', label: 'H.265/HEVC (libx265)' },
  { value: 'libvpx-vp9', label: 'VP9 (libvpx-vp9)' }
]

// 支持的编码预设
export const supportedPresets = [
  { value: 'ultrafast', label: '超快速' },
  { value: 'superfast', label: '超快' },
  { value: 'veryfast', label: '非常快' },
  { value: 'faster', label: '更快' },
  { value: 'fast', label: '快' },
  { value: 'medium', label: '中等' },
  { value: 'slow', label: '慢' },
  { value: 'slower', label: '更慢' },
  { value: 'veryslow', label: '非常慢' }
]

// 支持的音频编码器
export const supportedAudioCodecs = [
  { value: 'aac', label: 'AAC' },
  { value: 'libmp3lame', label: 'MP3' },
  { value: 'libopus', label: 'Opus' }
]

// 支持的音频比特率
export const supportedAudioBitrates = [
  { value: '96k', label: '96 kbps' },
  { value: '128k', label: '128 kbps' },
  { value: '192k', label: '192 kbps' },
  { value: '256k', label: '256 kbps' },
  { value: '320k', label: '320 kbps' }
]

// 支持的输出格式
export const supportedOutputFormats = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'mkv', label: 'MKV' }
]
