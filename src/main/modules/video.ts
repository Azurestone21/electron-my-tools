import { BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import ffprobe from '@ffprobe-installer/ffprobe'
import { spawn } from 'child_process'

const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv']

interface VideoMetadata {
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

const getVideoMetadata = async (filePath: string): Promise<VideoMetadata | null> => {
  return new Promise((resolve) => {
    const stats = fs.statSync(filePath)
    const fileName = path.basename(filePath)
    const fileSize = stats.size
    const ext = path.extname(filePath).slice(1).toLowerCase()

    const ffprobePath = ffprobe.path
    const ffprobeArgs = [
      '-v', 'quiet',
      '-print_format', 'json',
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
          id: Date.now() + Math.random(),
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
      result.filePaths.map((filePath) => getVideoMetadata(filePath))
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
