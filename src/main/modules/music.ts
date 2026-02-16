import { BrowserWindow, dialog, ipcMain } from 'electron'
import { handleMusicLyric } from '../../share/utils/musicLyric'
import { IAudioMetadata } from '../../share/types/music'
import fs from 'fs'
import path from 'path'

const audioExtensions = ['mp3']

// ID 生成器 - 使用递增计数器确保唯一性
let idCounter = 0
const generateId = (): number => {
  const timestamp = Date.now()
  const counter = (idCounter++ % 10000)
  return timestamp * 10000 + counter
}

export const selectAudioFile = async (win: BrowserWindow) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio Files', extensions: audioExtensions }]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const audioFiles =
      result.filePaths
        .map((filePath) => {
          const stats = fs.statSync(filePath)
          const fileName = path.basename(filePath)
          const fileSize = stats.size
          const ext = path.extname(filePath).slice(1).toLowerCase()
          let songName = ''
          let songer = ''
          if (fileName.indexOf('-') != -1) {
            let arr = fileName.split('-')
            songName = arr.length > 1 ? arr[1] : '未知歌曲'
            songer = arr.length > 1 ? arr[0] : '未知歌手'
          } else {
            songName = fileName
            songer = '未知歌手'
          }
          return {
            id: generateId(),
            fileName,
            filePath,
            songName: songName.replace('.mp3', '').trim(),
            songer: songer.trim(),
            lyricPath: fs.existsSync(filePath.replace('mp3', 'lrc'))
              ? filePath.replace('mp3', 'lrc')
              : '',
            coverPath: fs.existsSync(filePath.replace('mp3', 'jpg'))
              ? filePath.replace('mp3', 'jpg')
              : '',
            size: fileSize,
            containerFormat: ext
          }
        })
        ?.filter((v): v is IAudioMetadata => v !== null) || []

    return audioFiles
  }

  return []
}

export const musicManager = (win: BrowserWindow) => {
  // 获取本地音乐
  // ipcMain.handle('getMusicList', async (_event, basePath) => {
  //   const data = getLocalMusic(basePath)
  //   return data
  // })

  // 选择文件
  ipcMain.handle('selectAudioFile', async () => {
    return selectAudioFile(win)
  })

  // 获取本地音乐歌词
  ipcMain.handle('getLyric', async (_event, filePath) => {
    const data = handleMusicLyric(filePath)
    return data
  })
}
