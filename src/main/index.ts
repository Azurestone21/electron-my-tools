import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const login_width = 900
const login_height = 670
const normal_width = 1000
const normal_height = 750

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: login_width,
    height: login_height,
    show: false,
    autoHideMenuBar: true, // 隐藏工具栏
    titleBarStyle: 'hidden', // 隐藏头部
    resizable: true, // 是否允许缩放
    maximizable: false,  // 是否允许最大化
    // frame: true, //
    // transparent: true, // 背景透明
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 监听登录，登录后允许改变窗口大小，设置可以缩放、最大化
  ipcMain.on('login', (event, isLogin) => {
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
  ipcMain.on('handleScreen', (event, type) => {
    switch (type) {
      case 'full':
        mainWindow.maximize();
        break;
      case 'min':
        mainWindow.minimize();
        break;
      case 'close':
        mainWindow.close();
        break;
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 修改 CSP 以允许从特定源加载资源（请求数据）
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://8.138.20.29:3000"],
      },
    });
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
