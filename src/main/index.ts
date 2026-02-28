import { app, shell, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { scheduleManager } from './modules/schedule'
import { initLyricDesktopIPC } from './modules/lyricDesktop'
import { videoManager } from './modules/video'
import { musicManager } from './modules/music'
import { formatFileManager } from './modules/formatFile'

const login_width = 900
const login_height = 650
const normal_width = 1000
const normal_height = 700

enum MusicPlayType {
  play = 'play',
  pause = 'pause',
  before = 'before',
  next = 'next'
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: normal_width,
    height: normal_height,
    show: false,
    autoHideMenuBar: true, // 隐藏工具栏
    titleBarStyle: 'hidden', // 隐藏头部
    resizable: true, // 是否允许缩放
    maximizable: false, // 是否允许最大化
    // frame: true, //
    // transparent: true, // 背景透明
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // 关闭 Electron 的 Web 安全策略，允许加载本地资源。
      // nodeIntegration: true, // 渲染进程能够使用node模块的能力
    }
  })

  // 设置最小窗口尺寸
  mainWindow.setMinimumSize(1000, 700)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 监听登录，登录后允许改变窗口大小，设置可以缩放、最大化
  ipcMain.on('login', (_event, isLogin) => {
    if (isLogin) {
      mainWindow.setSize(normal_width, normal_height)
      mainWindow.setResizable(true)
      mainWindow.setMaximizable(true)
    } else {
      mainWindow.setSize(login_width, login_height)
      mainWindow.setResizable(false)
      mainWindow.setMaximizable(false)
    }
  })
  // 屏幕 最大化/最小化/关闭
  ipcMain.on('handleScreen', (_event, type) => {
    switch (type) {
      case 'full':
        mainWindow.maximize()
        break
      case 'min':
        mainWindow.minimize()
        break
      case 'close':
        mainWindow.close()
        break
    }
  })

  // 音乐相关的IPC事件
  musicManager(mainWindow)

  // 初始化桌面歌词相关的IPC事件
  initLyricDesktopIPC()

  // 视频相关的IPC事件
  videoManager(mainWindow)

  // 日程管理相关的IPC事件
  scheduleManager()

  // 格式转换相关的IPC事件
  formatFileManager(mainWindow)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 修改 CSP 以允许从特定源加载资源（请求数据）
  // mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://8.138.20.29:3000"],
  //     },
  //   });
  // })
  // 关闭窗口时触发
  mainWindow.on('close', (event) => {
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)
    event.preventDefault()
  })

  // 最小化托盘
  let iconPath = path.join(__dirname, '../../resources/icon.ico')
  let tray = new Tray(iconPath)
  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '播放/暂停',
      click: () => {
        mainWindow.webContents.send('handleMusicPlay', MusicPlayType.play)
      }
    },
    {
      label: '上一首',
      click: () => {
        mainWindow.webContents.send('handleMusicPlay', MusicPlayType.before)
      }
    },
    {
      label: '下一首',
      click: () => {
        mainWindow.webContents.send('handleMusicPlay', MusicPlayType.next)
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy()
        app.quit()
      }
    }
  ])
  tray.setToolTip('toolBox')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    // 点击托盘图标显示窗口
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 注册快捷键 Alt+Shift+I 打开控制台
  globalShortcut.register('Alt+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.webContents.openDevTools()
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
