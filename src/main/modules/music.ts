import { BrowserWindow, ipcMain } from 'electron'
import { handleMusicLyric } from './musicLyric'

export const musicManager = (win: BrowserWindow) => {
  // 获取本地音乐
  // ipcMain.handle('getMusicList', async (_event, basePath) => {
  //   const data = getLocalMusic(basePath)
  //   return data
  // })

  // 获取本地音乐歌词
  ipcMain.handle('getLyric', async (_event, filePath) => {
    const data = handleMusicLyric(filePath)
    return data
  })
}
