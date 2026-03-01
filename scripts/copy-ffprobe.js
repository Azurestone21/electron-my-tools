const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..')
const sourcePath = path.join(projectRoot, 'node_modules', '@ffprobe-installer', 'win32-x64', 'ffprobe.exe')
const targetDir = path.join(projectRoot, 'resources', 'ffprobe')
const targetPath = path.join(targetDir, 'ffprobe.exe')

console.log('项目根目录:', projectRoot)
console.log('源路径:', sourcePath)
console.log('目标目录:', targetDir)

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 复制 ffprobe.exe
if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath)
  console.log('ffprobe.exe 已复制到 resources/ffprobe/')
} else {
  console.error('未找到 ffprobe.exe:', sourcePath)
  process.exit(1)
}
