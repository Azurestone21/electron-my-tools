import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTranscodeTaskStore } from '@renderer/store/modules/transcodeTask'
import { useTranscodeConfigStore } from '@renderer/store/modules/transcodeConfig'
import { ETranscodeStatus } from '@share/types/transcodeTask'

export const useTranscode = () => {
  const transcodeTaskStore = useTranscodeTaskStore()
  const transcodeConfigStore = useTranscodeConfigStore()

  // 转码相关状态
  const isTranscoding = ref<boolean>(false) // 是否正在转码
  const transcodeProgress = ref<number>(0) // 转码进度
  const transcodeStatus = ref<ETranscodeStatus>() // 转码状态
  const transcodeError = ref<string>('') // 转码错误信息
  const currentTaskId = ref<string>('') // 当前转码任务ID
  const actualVideoSrc = ref<string>('') // 实际视频播放路径

  let progressListener: (() => void) | null = null

  // 处理转码进度
  const handleTranscodeProgress = (progress: any) => {
    console.log('转码进度:', progress)
    console.log('currentTaskId.value:', currentTaskId.value)
    // 即使 currentTaskId 未设置，也更新任务状态
    transcodeTaskStore.updateTask(progress.taskId, {
      progress: progress.progress,
      status: progress.status,
      error: progress.error
    })

    // 如果是当前任务，更新本地状态
    if (progress.taskId === currentTaskId.value || !currentTaskId.value) {
      transcodeProgress.value = progress.progress
      transcodeStatus.value = progress.status

      if (progress.status === ETranscodeStatus.Completed) {
        console.log('转码完成:', progress.outputPath)
        actualVideoSrc.value = progress.outputPath
      } else if (progress.status === ETranscodeStatus.Failed) {
        transcodeError.value = progress.error || '转码失败'
      }
    }
  }

  // 删除转码任务
  const deleteTranscodeTask = async (taskId: string) => {
    console.log('🚀 ~ deleteTranscodeTask ~ taskId:', taskId)
    if (taskId) {
      transcodeTaskStore.removeTask(taskId)
      await window.videoHandle.deleteTranscodeTask(taskId)
    }
    if (currentTaskId.value === taskId) {
      resetTranscodeState()
    }
  }

  // 重置转码状态
  const resetTranscodeState = () => {
    console.log('重置转码状态')

    isTranscoding.value = false
    transcodeProgress.value = 0
    transcodeStatus.value = null
    transcodeError.value = ''
    currentTaskId.value = ''
    actualVideoSrc.value = ''
  }

  // 清理
  const cleanup = () => {
    if (progressListener) {
      progressListener()
      progressListener = null
    }
  }

  // 检查转码文件是否存在
  const checkTranscodeFileExists = async (filePath: string): Promise<boolean> => {
    console.log('🔍 检查转码文件是否存在:', filePath)
    try {
      // 检查文件是否存在
      const exists = await window.videoHandle.checkFileExists(filePath)
      console.log('📁 转码文件存在状态:', exists)
      return exists
    } catch (error) {
      console.error('❌ 检查转码文件失败:', error)
      return false
    }
  }

  // 转码视频
  const transcode = async (videoPath: string) => {
    try {
      const existingTask = transcodeTaskStore.getTaskByInputPath(videoPath)
      console.log('🚀 ~ transcodeAndPlay ~ existingTask:', existingTask)
      if (existingTask) {
        // 检查转码文件是否存在
        const fileExists = await checkTranscodeFileExists(existingTask.outputPath)
        if (!fileExists) {
          // 文件不存在，删除任务
          console.error('❌ 转码文件不存在，需要重新转码:', existingTask.outputPath)
          // 删除任务
          await deleteTranscodeTask(existingTask.taskId)
        } else if (
          existingTask.status === ETranscodeStatus.Running ||
          existingTask.status === ETranscodeStatus.Pending
        ) {
          console.log('转码任务已在运行中:', existingTask.taskId)
          currentTaskId.value = existingTask.taskId
          isTranscoding.value = true
          transcodeProgress.value = existingTask.progress
          transcodeStatus.value = existingTask.status as ETranscodeStatus
          return
        } else if (existingTask.status === ETranscodeStatus.Completed) {
          console.log('转码任务已完成，文件存在，直接播放:', existingTask.outputPath)
          actualVideoSrc.value = existingTask.outputPath
          return
        }
      }

      isTranscoding.value = true
      transcodeStatus.value = ETranscodeStatus.Pending

      // 获取转码配置
      const transcodeConfig = transcodeConfigStore.config
      console.log('转码配置:', transcodeConfig)

      const taskId = await window.videoHandle.startTranscodeTask(videoPath, transcodeConfig)
      console.log('新转码任务ID:', taskId)
      currentTaskId.value = taskId

      const task = await window.videoHandle.getTranscodeTask(taskId)
      if (task) {
        transcodeTaskStore.addTask(task)
      }

      if (task && task.status === ETranscodeStatus.Completed) {
        console.log('任务已完成，直接播放:', task.outputPath)
        actualVideoSrc.value = task.outputPath
      }
    } catch (error) {
      console.error('转码失败:', error)
      transcodeError.value = error instanceof Error ? error.message : '未知错误'
    } finally {
      isTranscoding.value = false
    }
  }

  // 检查视频是否需要转码
  const checkAndTranscode = async (videoPath: string) => {
    const ext = videoPath.split('.').pop()?.toLowerCase()
    console.log('🚀 ~ checkAndTranscode ~ videoPath:', videoPath)

    if (ext === 'mkv' && !videoPath.includes('_converted')) {
      console.log('检测到 MKV 文件，开始转码')
      await transcode(videoPath)
      return true
    } else {
      actualVideoSrc.value = videoPath
      return false
    }
  }

  // 生命周期
  onMounted(async () => {
    console.log('useTranscode onMounted - 开始注册进度监听器')
    try {
      // 检查 window.videoHandle 是否存在
      if (!window.videoHandle) {
        return
      }

      // 检查 onTranscodeProgress 方法是否存在
      if (!window.videoHandle.onTranscodeProgress) {
        return
      }

      // 设置转码进度监听器
      console.log('注册转码进度监听器')
      progressListener = window.videoHandle.onTranscodeProgress(handleTranscodeProgress)
    } catch (error) {
      console.error('注册进度监听器失败:', error)
    }
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    // 状态
    isTranscoding,
    transcodeProgress,
    transcodeStatus,
    transcodeError,
    currentTaskId,
    actualVideoSrc,

    // 方法
    checkAndTranscode,
    resetTranscodeState
  }
}
