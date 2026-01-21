<!-- 图片压缩 -->
<script setup lang="ts">
import { ElMessage } from 'element-plus'

const loading = ref(false)

// 状态管理
const fileList = ref([]) // 上传文件列表
const originalFile = ref(null) // 原始文件
const originalImageUrl = ref('') // 原图预览URL
const compressedImageUrl = ref('') // 压缩图预览URL
const compressedBlob = ref(null) // 压缩后的Blob对象

// 图片信息
const originalSize = ref(0)
const originalWidth = ref(0)
const originalHeight = ref(0)
const compressedSize = ref(0)
const compressedWidth = ref(0)
const compressedHeight = ref(0)
const compressionRatio = ref(0)

const compressOptions = ref([
  { label: '750px (移动端)', value: '750' },
  { label: '1080px (高清)', value: '1080' },
  { label: '1920px (全高清)', value: '1920' },
  { label: '原图', value: '0' }
])

// 压缩参数表单
const compressForm = reactive({
  quality: 70, // 压缩质量（10-100）
  maxWidth: 0 // 最大宽度（0为原图）
})

// 处理文件上传
const handleFileChange = (file) => {
  // 保存原始文件
  originalFile.value = file.raw
  fileList.value = [file]

  // 生成原图预览URL
  originalImageUrl.value = URL.createObjectURL(file.raw)

  // 获取原图信息
  const img = new Image()
  img.src = originalImageUrl.value
  img.onload = () => {
    originalWidth.value = img.width
    originalHeight.value = img.height
    originalSize.value = Number((file.raw.size / 1024).toFixed(2))
  }
}

/**
 * 核心压缩函数
 * @param {File} file 原始图片文件
 * @param {number} quality 压缩质量（0-1）
 * @param {number} maxWidth 最大宽度（0为原图）
 * @returns {Promise<Blob>} 压缩后的Blob对象
 */
// 定义压缩结果的类型
interface CompressResult {
  blob: Blob
  width: number
  height: number
}

// 为compressImage函数添加完整类型注解
const compressImage = (file: File, quality: number, maxWidth: number): Promise<CompressResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // 读取文件为Base64
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result as string

      img.onload = () => {
        // 创建Canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 计算缩放后的尺寸
        let width = img.width
        let height = img.height

        // 尺寸调整逻辑：只有当目标尺寸小于原图尺寸时才调整
        // 这样可以避免放大图片导致文件变大
        if (maxWidth && maxWidth > 0 && maxWidth < width) {
          const scale = maxWidth / width
          width = maxWidth
          height = Math.round(height * scale)
        }

        // 设置Canvas尺寸
        canvas.width = width
        canvas.height = height

        // 绘制图片到Canvas（核心压缩）
        ctx.drawImage(img, 0, 0, width, height)

        // 确定输出格式：保留原图格式（除了透明图片转为PNG）
        const isOriginalPNG = file.type === 'image/png'
        const hasTransparency = img.src.startsWith('data:image/png') && img.src.includes(';base64,')

        // 对于透明图片或PNG格式，默认使用PNG格式保存以保持透明度
        let outputType = isOriginalPNG || hasTransparency ? 'image/png' : 'image/jpeg'

        // 计算实际质量参数：如果是PNG，质量参数不影响（PNG是无损压缩）
        const actualQuality = outputType === 'image/jpeg' ? quality / 100 : undefined

        // 将Canvas转为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('压缩结果:', {
                outputSize: blob.size,
                compressionRatio: ((blob.size / file.size) * 100).toFixed(1) + '%'
              })

              // 关键修复：如果压缩后的图片比原图大，就返回原图
              // 这种情况通常发生在：
              // 1. 原图已经是高度压缩的JPEG
              // 2. PNG转JPEG失败（PNG是无损压缩）
              // 3. 小尺寸图片再次处理
              if (blob.size >= file.size) {
                // 创建一个包含原图信息的对象
                const originalBlob = file.slice(0, file.size, file.type)
                resolve({
                  blob: originalBlob,
                  width: img.width,
                  height: img.height
                })
                return
              }

              resolve({
                blob,
                width,
                height
              })
            } else {
              reject(new Error('压缩失败'))
            }
          },
          outputType,
          actualQuality
        )
      }
    }

    reader.onerror = () => {
      reject(new Error('图片读取失败'))
    }
  })
}

// 处理压缩
const handleCompress = async () => {
  if (!originalFile.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  try {
    loading.value = true
    const result = await compressImage(
      originalFile.value,
      compressForm.quality,
      Number(compressForm.maxWidth)
    )

    // 保存压缩结果
    compressedBlob.value = result.blob
    compressedWidth.value = result.width
    compressedHeight.value = result.height
    compressedSize.value = Number((result.blob.size / 1024).toFixed(2))
    // 计算压缩率
    compressionRatio.value = Number(
      ((1 - result.blob.size / originalFile.value.size) * 100).toFixed(1)
    )

    // 生成压缩图预览URL
    compressedImageUrl.value = URL.createObjectURL(result.blob)
  } catch (error) {
    ElMessage.error('压缩失败：' + error)
  } finally {
    loading.value = false
  }
}

// 处理下载
const handleDownload = () => {
  if (!compressedBlob.value) {
    ElMessage.warning('请先压缩图片')
    return
  }
  // 创建下载链接
  const a = document.createElement('a')
  a.href = URL.createObjectURL(compressedBlob.value)
  a.download = 'compressed-image.jpg'
  a.click()
  // 释放URL对象
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="page" v-loading="loading" :element-loading-text="'压缩中'">
    <div class="page-content flex">
      <div class="upload-container flex-1">
        <el-upload
          class="upload"
          action="#"
          drag
          multiple
          accept="image/*"
          :limit="1"
          :file-list="fileList"
          list-type="picture"
          :auto-upload="false"
          :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽图片到这里或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JPG/PNG/WebP 格式</div>
          </template>
        </el-upload>
        <!-- 压缩参数设置 -->
        <div class="compress-settings">
          <el-form :model="compressForm">
            <el-form-item label="压缩质量：">
              <el-slider v-model="compressForm.quality" :min="10" :max="100" :step="5"></el-slider>
            </el-form-item>
            <el-form-item label="最大宽度：">
              <el-select v-model="compressForm.maxWidth" placeholder="请选择">
                <el-option
                  v-for="item in compressOptions"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCompress">开始压缩</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="compress-container flex-1 ml-[20px]">
        <div class="preview-item" v-if="compressedImageUrl">
          <el-image
            :src="compressedImageUrl"
            fit="contain"
            class="preview-img"
            :preview-src-list="[compressedImageUrl]"
          ></el-image>
          <div class="img-info">大小：{{ compressedSize }} KB</div>
          <div class="img-info">分辨率：{{ compressedWidth }} × {{ compressedHeight }}</div>
          <div class="img-info">压缩率：{{ compressionRatio }}%</div>
          <div class="img-info">质量：{{ compressForm.quality }}%</div>
          <div class="download-actions">
            <el-button type="success" @click="handleDownload">下载压缩图</el-button>
            <!-- <el-button type="primary" icon="el-icon-upload2" @click="handleUploadToServer">
            上传到服务器
          </el-button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.page {
  box-sizing: border-box;
  padding: 20px 20px 34px 20px;

  .page-content {
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
    background-image: linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 100%);
    border-radius: 16px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
    padding: 30px;
    gap: 30px;
  }
}

/* 上传区域样式 */
.upload-container {
  .upload {
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 30px;
    background: #f9f9f9;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      background: var(--theme-color);
    }

    .el-upload__text {
      color: #606266;
      font-size: 16px;
      margin-top: 16px;
    }

    .el-upload__tip {
      margin-top: 16px;
      color: #909399;
      font-size: 14px;
    }
  }

  /* 压缩设置样式 */
  .compress-settings {
    background: #f9f9f9;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .el-form {
      .el-form-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
          display: flex;
          justify-content: center;
        }

        .el-form-item__label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }

        .el-slider {
          margin: 0 16px;
        }

        .el-button {
          padding: 10px 30px;
          font-size: 14px;
          border-radius: 6px;
        }
      }
    }
  }
}

/* 压缩结果区域样式 */
.compress-container {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 500px;
  display: flex;
  flex-direction: column;

  .preview-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .preview-img {
      width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.02);
      }
    }

    .img-info {
      font-size: 14px;
      color: #606266;
      margin: 8px 0;
      text-align: center;

      &:last-of-type {
        margin-bottom: 24px;
      }
    }

    .download-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;

      .el-button {
        padding: 10px 24px;
        font-size: 14px;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  /* 无压缩结果时的占位符 */
  &:not(:has(.preview-item)) {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 16px;
  }
}

/* 图片对比区域（如果需要） */
.compare-container {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;

  h3 {
    margin-bottom: 20px;
    color: #303133;
    font-size: 16px;
    font-weight: 500;
  }

  .compare-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .compare-item {
      background: #f9f9f9;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      h4 {
        margin-bottom: 16px;
        color: #606266;
        font-size: 14px;
        font-weight: 500;
      }

      img {
        width: 100%;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .info-list {
        font-size: 14px;
        color: #909399;

        .info-item {
          margin: 8px 0;
        }
      }
    }
  }
}
</style>
