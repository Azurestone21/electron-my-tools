import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

// 桌面歌词窗口实例
let lyricDesktopWindow = null

/**
 * 创建桌面歌词窗口
 */
export const createLyricDesktopWindow = () => {
  // 如果窗口已存在，直接显示
  if (lyricDesktopWindow) {
    lyricDesktopWindow.show()
    return lyricDesktopWindow
  }

  // 创建新的桌面歌词窗口
  lyricDesktopWindow = new BrowserWindow({
    width: 400,
    height: 100,
    frame: false, // 无边框
    transparent: true, // 透明
    resizable: true, // 可调整大小
    movable: true, // 可拖动
    alwaysOnTop: true, // 始终置顶
    skipTaskbar: true, // 跳过任务栏
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'), // 注意路径是否正确，否则调用方法会报错
      contextIsolation: true,
      sandbox: false
    }
  })

  // 加载桌面歌词页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricDesktopWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/musicPlay/lyric-desktop`)
  } else {
    lyricDesktopWindow.loadFile(path.join(__dirname, '../../renderer/index.html'), {
      hash: '/musicPlay/lyric-desktop'
    })
  }

  // 窗口关闭时清理
  lyricDesktopWindow.on('closed', () => {
    lyricDesktopWindow = null
  })

  return lyricDesktopWindow
}

/**
 * 显示/隐藏桌面歌词
 */
export const toggleLyricDesktop = () => {
  if (lyricDesktopWindow) {
    if (lyricDesktopWindow.isVisible()) {
      lyricDesktopWindow.hide()
    } else {
      lyricDesktopWindow.show()
    }
  } else {
    createLyricDesktopWindow()
  }
}

/**
 * 发送歌词数据到桌面歌词窗口
 */
export const sendLyricData = (lyricData, currentTime, isPlaying) => {
  if (lyricDesktopWindow && lyricDesktopWindow.isVisible()) {
    lyricDesktopWindow.webContents.send('updateLyricData', {
      lyricData,
      currentTime,
      isPlaying
    })
  }
}

/**
 * 发送播放状态到桌面歌词窗口
 */
export const sendPlayStatus = (currentTime, isPlaying) => {
  if (lyricDesktopWindow && lyricDesktopWindow.isVisible()) {
    lyricDesktopWindow.webContents.send('updatePlayStatus', {
      currentTime,
      isPlaying
    })
  }
}

/**
 * 初始化桌面歌词相关的IPC事件
 */
export const initLyricDesktopIPC = () => {
  // 创建桌面歌词窗口
  ipcMain.handle('createLyricDesktop', () => {
    createLyricDesktopWindow()
    return true
  })

  // 显示/隐藏桌面歌词
  ipcMain.handle('toggleLyricDesktop', () => {
    toggleLyricDesktop()
    return true
  })

  // 发送歌词数据
  ipcMain.handle('sendLyricData', (_event, lyricData, currentTime, isPlaying) => {
    sendLyricData(lyricData, currentTime, isPlaying)
    return true
  })

  // 发送播放状态
  ipcMain.handle('sendPlayStatus', (_event, currentTime, isPlaying) => {
    sendPlayStatus(currentTime, isPlaying)
    return true
  })

  // 保存桌面歌词配置
  ipcMain.handle('saveLyricDesktopConfig', (_event, config) => {
    // 这里可以保存配置到本地文件
    console.log('保存桌面歌词配置:', config)
    return true
  })

  // 加载桌面歌词配置
  ipcMain.handle('loadLyricDesktopConfig', () => {
    // 这里可以从本地文件加载配置
    return {
      position: { x: 100, y: 100 },
      size: { width: 400, height: 100 },
      opacity: 0.8,
      fontSize: 16,
      fontColor: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      isShow: true
    }
  })

  // 移动桌面歌词窗口
  ipcMain.handle('moveLyricDesktopWindow', (_event, position) => {
    if (lyricDesktopWindow) {
      lyricDesktopWindow.setPosition(position.x, position.y)
    }
    return true
  })
}

/**
 * 获取桌面歌词窗口实例
 */
export const getLyricDesktopWindow = () => {
  return lyricDesktopWindow
}
