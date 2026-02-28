import { BrowserWindow, dialog, ipcMain } from 'electron'
import { getVideoMetadata } from './video'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { ETranscodeStatus, ITranscodeProgress, ITranscodeTask } from '@share/types/transcodeTask'

const videoExtensions = ['mkv'] // 视频文件格式

// 获取文件类型的扩展名
const getFileTypeExtensions = (fileType: string) => {
  if (fileType === 'video') {
    return videoExtensions
  }
  return []
}

// 选择文件
const selectFile = async (win: BrowserWindow, fileType: string) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: fileType, extensions: getFileTypeExtensions(fileType) }]
  })
  if (canceled) {
    return ''
  }
  if (filePaths[0]) {
    // 解析元数据
    if (fileType === 'video') {
      const metadata = await getVideoMetadata(filePaths[0])
      /**
       * audioCodec: "ac3"
       * containerFormat: "matroska,webm"
       * duration: 6564.448
       * fileName: "穿普拉达的女王 The Devil Wears Prada (2006).mkv"
       * filePath: "D:\\BaiduNetdiskDownload\\穿普拉达的女王 The Devil Wears Prada (2006).mkv"
       * fileSize: 2108036282
       * height: 576
       * id: 1771951552574
       * videoCodec: "h264"
       * width: 1024
       */
      return metadata
    }
    return ''
  }
  return ''
}

export const transcodeVideo = async (inputPath: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const ext = path.extname(inputPath)
    const outputPath = inputPath.replace(ext, '_converted.mp4')

    console.log('开始转码:', inputPath)
    console.log('输出路径:', outputPath)

    if (fs.existsSync(outputPath)) {
      console.log('转码后的文件已存在，跳过转码')
      resolve(outputPath)
      return
    }

    const ffmpegPath = ffmpeg.path
    const ffmpegArgs = [
      '-i',
      inputPath,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      '-y',
      outputPath
    ]

    console.log('FFmpeg 命令:', ffmpegPath, ffmpegArgs.join(' '))

    const process = spawn(ffmpegPath, ffmpegArgs)

    process.stdout.on('data', (data) => {
      console.log('FFmpeg stdout:', data.toString())
    })

    process.stderr.on('data', (data) => {
      console.log('FFmpeg stderr:', data.toString())
    })

    process.on('close', (code) => {
      console.log('FFmpeg process exited with code:', code)
      if (code === 0) {
        console.log('转码成功:', outputPath)

        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath)
          console.log('转码后文件大小:', stats.size, 'bytes')
          resolve(outputPath)
        } else {
          console.error('转码后的文件不存在')
          resolve(null)
        }
      } else {
        console.error(`FFmpeg process exited with code ${code}`)
        resolve(null)
      }
    })

    process.on('error', (error) => {
      console.error('执行 FFmpeg 失败:', error)
      resolve(null)
    })
  })
}

const transcodeTasks = new Map<string, ITranscodeTask>()

// 加载保存的转码任务
const loadSavedTasks = () => {
  try {
    const userDataPath = path.join(
      process.env.APPDATA || process.env.HOME || '',
      'electron-my-tools',
      'transcode'
    )
    if (!fs.existsSync(userDataPath)) {
      return
    }

    const files = fs.readdirSync(userDataPath)
    files.forEach((file) => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(userDataPath, file)
          const data = fs.readFileSync(filePath, 'utf-8')
          const task = JSON.parse(data) as ITranscodeTask
          // 只加载未完成的任务
          if (
            task.status === ETranscodeStatus.Running ||
            task.status === ETranscodeStatus.Pending
          ) {
            transcodeTasks.set(task.taskId, task)
            console.log('加载保存的转码任务:', task.taskId, task.status)
          }
        } catch (error) {
          console.error('加载转码任务失败:', error)
        }
      }
    })
  } catch (error) {
    console.error('加载保存的转码任务失败:', error)
  }
}

// 初始化时加载保存的任务
loadSavedTasks()

const generateTaskId = (inputPath: string): string => {
  // 先对字符串进行URI编码，然后再使用Buffer进行Base64编码
  // 这样可以处理包含非Latin1字符的文件路径，与renderer进程保持一致
  const hash = Buffer.from(encodeURIComponent(inputPath)).toString('base64').replace(/[+/=]/g, '').substring(0, 16)
  return `task_${hash}`
}

const getTaskProgressFilePath = (taskId: string): string => {
  const userDataPath = path.join(
    process.env.APPDATA || process.env.HOME || '',
    'electron-my-tools',
    'transcode'
  )
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
  return path.join(userDataPath, `${taskId}.json`)
}

const saveTaskProgress = (task: ITranscodeTask) => {
  try {
    const progressPath = getTaskProgressFilePath(task.taskId)
    const progressData = {
      taskId: task.taskId,
      inputPath: task.inputPath,
      outputPath: task.outputPath,
      progress: task.progress,
      status: task.status,
      error: task.error
    }
    fs.writeFileSync(progressPath, JSON.stringify(progressData, null, 2))
  } catch (error) {
    console.error('保存任务进度失败:', error)
  }
}

export const startTranscodeTask = async (
  inputPath: string,
  config?: any,
  onProgress?: (progress: ITranscodeProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 使用配置参数或默认值
    const transcodeConfig = {
      video: {
        codec: config?.video?.codec || 'libx264',
        preset: config?.video?.preset || 'fast',
        crf: config?.video?.crf || 23
      },
      audio: {
        codec: config?.audio?.codec || 'aac',
        bitrate: config?.audio?.bitrate || '192k'
      },
      output: {
        format: config?.output?.format || 'mp4',
        fastStart: config?.output?.fastStart ?? true,
        overwrite: config?.output?.overwrite ?? true
      }
    }

    const ext = path.extname(inputPath)
    const outputPath = inputPath.replace(ext, `_converted.${transcodeConfig.output.format}`)
    const taskId = generateTaskId(inputPath)

    console.log('🚀 ~ startTranscodeTask ~ outputPath:', outputPath)
    console.log('🚀 ~ startTranscodeTask ~ fs.existsSync(outputPath):', fs.existsSync(outputPath))
    if (fs.existsSync(outputPath)) {
      console.log('转码后的文件已存在，跳过转码')
      const completedTask: ITranscodeTask = {
        taskId,
        inputPath,
        outputPath,
        progress: 100,
        status: ETranscodeStatus.Completed,
        startTime: Date.now(),
        endTime: Date.now()
      }
      transcodeTasks.set(taskId, completedTask)
      if (onProgress) {
        onProgress({
          taskId,
          inputPath,
          outputPath,
          progress: 100,
          status: ETranscodeStatus.Completed
        })
      }
      resolve(taskId)
      return
    }

    const existingTask = transcodeTasks.get(taskId)
    console.log('🚀 ~ startTranscodeTask ~ existingTask:', existingTask)
    if (
      existingTask &&
      (existingTask.status === ETranscodeStatus.Running ||
        existingTask.status === ETranscodeStatus.Pending)
    ) {
      console.log('转码任务已在运行中:', taskId)
      resolve(taskId)
      return
    }

    const task: ITranscodeTask = {
      taskId,
      inputPath,
      outputPath,
      progress: 0,
      status: ETranscodeStatus.Pending,
      startTime: Date.now()
    }

    transcodeTasks.set(taskId, task)
    saveTaskProgress(task)

    const ffmpegPath = ffmpeg.path
    const ffmpegArgs = [
      '-i',
      inputPath,
      '-c:v',
      transcodeConfig.video.codec,
      '-preset',
      transcodeConfig.video.preset,
      '-crf',
      transcodeConfig.video.crf.toString(),
      '-c:a',
      transcodeConfig.audio.codec,
      '-b:a',
      transcodeConfig.audio.bitrate
    ]

    // 添加快速启动选项（仅适用于 MP4 格式）
    if (transcodeConfig.output.fastStart && transcodeConfig.output.format === 'mp4') {
      ffmpegArgs.push('-movflags', '+faststart')
    }

    // 添加覆盖选项
    if (transcodeConfig.output.overwrite) {
      ffmpegArgs.push('-y')
    }

    ffmpegArgs.push(outputPath)

    console.log('开始转码:', inputPath)
    console.log('转码配置:', transcodeConfig)
    console.log('输出路径:', outputPath)
    console.log('FFmpeg 命令:', ffmpegPath, ffmpegArgs.join(' '))

    const process = spawn(ffmpegPath, ffmpegArgs)

    task.process = process
    task.status = ETranscodeStatus.Running
    saveTaskProgress(task)

    if (onProgress) {
      onProgress({
        taskId,
        inputPath,
        outputPath,
        progress: 0,
        status: ETranscodeStatus.Running
      })
    }

    let duration = 0
    let currentTime = 0

    process.stderr.on('data', (data) => {
      const output = data.toString()

      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/)
      if (durationMatch && duration === 0) {
        const hours = parseInt(durationMatch[1])
        const minutes = parseInt(durationMatch[2])
        const seconds = parseFloat(durationMatch[3])
        duration = hours * 3600 + minutes * 60 + seconds
      }

      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/)
      if (timeMatch) {
        const hours = parseInt(timeMatch[1])
        const minutes = parseInt(timeMatch[2])
        const seconds = parseFloat(timeMatch[3])
        currentTime = hours * 3600 + minutes * 60 + seconds

        if (duration > 0) {
          const progress = Math.min((currentTime / duration) * 100, 100)
          task.progress = progress
          saveTaskProgress(task)

          if (onProgress) {
            onProgress({
              taskId,
              inputPath,
              outputPath,
              progress,
              status: ETranscodeStatus.Running
            })
          }
        }
      }
    })

    process.on('close', (code) => {
      console.log('FFmpeg process exited with code:', code)

      if (code === 0) {
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath)
          console.log('转码成功:', outputPath)
          console.log('转码后文件大小:', stats.size, 'bytes')

          task.progress = 100
          task.status = ETranscodeStatus.Completed
          task.endTime = Date.now()
          saveTaskProgress(task)

          if (onProgress) {
            onProgress({
              taskId,
              inputPath,
              outputPath,
              progress: 100,
              status: ETranscodeStatus.Completed
            })
          }

          resolve(taskId)
        } else {
          console.error('转码后的文件不存在')
          task.status = ETranscodeStatus.Failed
          task.error = '转码后的文件不存在'
          task.endTime = Date.now()
          saveTaskProgress(task)

          if (onProgress) {
            onProgress({
              taskId,
              inputPath,
              outputPath,
              progress: task.progress,
              status: ETranscodeStatus.Failed,
              error: '转码后的文件不存在'
            })
          }

          reject(new Error('转码后的文件不存在'))
        }
      } else {
        console.error(`FFmpeg process exited with code ${code}`)
        task.status = ETranscodeStatus.Failed
        task.error = `FFmpeg process exited with code ${code}`
        task.endTime = Date.now()
        saveTaskProgress(task)

        if (onProgress) {
          onProgress({
            taskId,
            inputPath,
            outputPath,
            progress: task.progress,
            status: ETranscodeStatus.Failed,
            error: `FFmpeg process exited with code ${code}`
          })
        }

        reject(new Error(`FFmpeg process exited with code ${code}`))
      }
    })

    process.on('error', (error) => {
      console.error('执行 FFmpeg 失败:', error)
      task.status = ETranscodeStatus.Failed
      task.error = error.message
      task.endTime = Date.now()
      saveTaskProgress(task)

      if (onProgress) {
        onProgress({
          taskId,
          inputPath,
          outputPath,
          progress: task.progress,
          status: ETranscodeStatus.Failed,
          error: error.message
        })
      }

      reject(error)
    })
  })
}

export const getTranscodeTask = (taskId: string): ITranscodeTask | null => {
  return transcodeTasks.get(taskId) || null
}

export const cancelTranscodeTask = (taskId: string): boolean => {
  const task = transcodeTasks.get(taskId)
  if (task && task.process) {
    task.process.kill()
    task.status = ETranscodeStatus.Cancelled
    task.endTime = Date.now()
    saveTaskProgress(task)
    return true
  }
  return false
}

export const deleteTranscodeTask = (taskId: string): boolean => {
  const task = transcodeTasks.get(taskId)
  if (task) {
    transcodeTasks.delete(taskId)
    return true
  }
  return false
}

// 格式化文件管理器
export const formatFileManager = (win: BrowserWindow) => {
  // 选择文件
  ipcMain.handle('selectFile', async (_, fileType) => {
    return selectFile(win, fileType)
  })

  // 转化
  ipcMain.handle('transform', async (_, filePath) => {
    return transcodeVideo(filePath)
  })

  ipcMain.handle('startTranscodeTask', async (_, inputPath: string, config?: any) => {
    const taskId = await startTranscodeTask(inputPath, config, (progress) => {
      win.webContents.send('transcode-progress', progress)
    })
    return taskId
  })

  ipcMain.handle('getTranscodeTask', async (_, taskId: string) => {
    return getTranscodeTask(taskId)
  })

  ipcMain.handle('cancelTranscodeTask', async (_, taskId: string) => {
    return cancelTranscodeTask(taskId)
  })

  ipcMain.handle('deleteTranscodeTask', async (_, taskId: string) => {
    return deleteTranscodeTask(taskId)
  })

  ipcMain.handle('checkFileExists', async (_, filePath: string) => {
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      console.error('检查文件存在失败:', error)
      return false
    }
  })
}
