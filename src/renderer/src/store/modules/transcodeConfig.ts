import { defineStore } from 'pinia'
import { defaultTranscodeConfig } from '@share/config/transcodeConfig'
import { ITranscodeConfig } from '@share/types/transcodeConfig'

export const useTranscodeConfigStore = defineStore('transcodeConfig', {
  state: () => ({
    // 使用深拷贝避免修改原始配置对象
    config: JSON.parse(JSON.stringify(defaultTranscodeConfig)) as ITranscodeConfig
  }),

  actions: {
    // 更新配置
    updateConfig(newConfig: Partial<ITranscodeConfig>) {
      this.config = {
        ...this.config,
        ...newConfig,
        video: {
          ...this.config.video,
          ...(newConfig.video || {})
        },
        audio: {
          ...this.config.audio,
          ...(newConfig.audio || {})
        },
        output: {
          ...this.config.output,
          ...(newConfig.output || {})
        }
      }
    },

    // 重置为默认配置
    resetToDefault() {
      // 使用深拷贝避免修改原始配置对象
      this.config = JSON.parse(JSON.stringify(defaultTranscodeConfig))
    },

    // 设置特定的视频配置
    setVideoConfig(videoConfig: Partial<ITranscodeConfig['video']>) {
      this.config.video = {
        ...this.config.video,
        ...videoConfig
      }
    },

    // 设置特定的音频配置
    setAudioConfig(audioConfig: Partial<ITranscodeConfig['audio']>) {
      this.config.audio = {
        ...this.config.audio,
        ...audioConfig
      }
    },

    // 设置特定的输出配置
    setOutputConfig(outputConfig: Partial<ITranscodeConfig['output']>) {
      this.config.output = {
        ...this.config.output,
        ...outputConfig
      }
    }
  },

  persist: {
    key: 'transcode-config',
    storage: localStorage
  }
})
