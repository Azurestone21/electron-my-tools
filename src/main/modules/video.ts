import { BrowserWindow, dialog, ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import ffprobe from '@ffprobe-installer/ffprobe'
import { spawn } from 'child_process'
import { VideoMetadata } from '@share/types/video'
import { generateSimpleId } from '@share/utils/common'

const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv']

// 获取 ffprobe 可执行文件路径
const getFFprobePath = (): string => {
  const isPackaged = app.isPackaged
  console.log('是否打包:', isPackaged)

  if (isPackaged) {
    // 打包后，从 resources/app.asar.unpacked 目录查找 ffprobe
    const resourcesPath = process.resourcesPath
    console.log('resources 路径:', resourcesPath)

    // 由于 asarUnpack 配置，resources 目录被解包到 app.asar.unpacked
    const unpackedPath = path.join(
      resourcesPath,
      'app.asar.unpacked',
      'resources',
      'ffprobe',
      'ffprobe.exe'
    )
    console.log('打包后 ffprobe 路径:', unpackedPath)

    // 如果 app.asar.unpacked 目录下有 ffprobe，使用它
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath
    }

    // 尝试直接从 resources 目录查找
    const directPath = path.join(resourcesPath, 'ffprobe', 'ffprobe.exe')
    console.log('直接路径:', directPath)
    if (fs.existsSync(directPath)) {
      return directPath
    }

    console.log('打包后未找到 ffprobe，使用 @ffprobe-installer 的路径')
  }

  // 开发环境或打包后未找到 ffprobe，使用 @ffprobe-installer 的路径
  const defaultPath = ffprobe.path
  console.log('默认 ffprobe 路径:', defaultPath)
  return defaultPath
}

// 获取视频元数据
export const getVideoMetadata = async (
  filePath: string,
  index: number
): Promise<VideoMetadata | null> => {
  return new Promise((resolve) => {
    const stats = fs.statSync(filePath)
    const fileName = path.basename(filePath)
    const fileSize = stats.size
    const ext = path.extname(filePath).slice(1).toLowerCase()

    const ffprobePath = getFFprobePath()
    const ffprobeArgs = [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      filePath
    ]

    const process = spawn(ffprobePath, ffprobeArgs)
    let output = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`ffprobe process exited with code ${code}`)
        resolve(null)
        return
      }

      try {
        const metadata = JSON.parse(output)
        const format = metadata.format || {}
        const streams = metadata.streams || []

        const videoStream = streams.find((s: any) => s.codec_type === 'video')
        const audioStream = streams.find((s: any) => s.codec_type === 'audio')

        const result: VideoMetadata = {
          id: generateSimpleId(index),
          fileName,
          filePath,
          fileSize,
          duration: parseFloat(format.duration) || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          videoCodec: videoStream?.codec_name || '',
          audioCodec: audioStream?.codec_name || '',
          containerFormat: format.format_name || ext
        }

        resolve(result)
      } catch (error) {
        console.error('解析视频元数据失败:', error)
        resolve(null)
      }
    })

    process.on('error', (error) => {
      console.error('执行 ffprobe 失败:', error)
      resolve(null)
    })
  })
}

export const selectVideoFile = async (win: BrowserWindow) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Video Files', extensions: videoExtensions }]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const videos = await Promise.all(
      result.filePaths.map((filePath, index) => getVideoMetadata(filePath, index))
    )
    return videos.filter((v): v is VideoMetadata => v !== null)
  }

  return []
}

export const videoManager = (win: BrowserWindow) => {
  ipcMain.handle('selectVideoFile', async () => {
    return selectVideoFile(win)
  })
}
