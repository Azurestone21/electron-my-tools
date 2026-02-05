<!-- 图片压缩 -->
<script setup lang="ts">
import { ref } from 'vue'
const imageUrl = ref('')
const colorResult = ref('')

const uploadImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = handleImageUpload
  input.click()
}

const handleImageUpload = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 拾取颜色
const pickColor = () => {
  if (!(window as any).EyeDropper) {
    console.log('你的浏览器不支持 EyeDropper API')
    return
  }

  const eyeDropper = new (window as any).EyeDropper()
  const abortController = new AbortController()

  eyeDropper
    .open({ signal: abortController.signal })
    .then((result) => {
      colorResult.value = result.sRGBHex
    })
    .catch(() => {})
    .finally(() => {
      abortController.abort()
    })
}

// 重置
const refresh = () => {
  colorResult.value = ''
  imageUrl.value = ''
}
</script>

<template>
  <div class="page" id="get-color-page">
    <div class="page-content">
      <div>
        <el-button type="primary" @click="pickColor">拾取颜色</el-button>
        <el-button type="default" @click="uploadImage">上传图片</el-button>
        <el-button type="default" @click="refresh">重置</el-button>
      </div>

      <div class="color-result">
        <div class="text"><span style="user-select: none">颜色值：</span>{{ colorResult }}</div>
        <div class="color" :style="{ backgroundColor: colorResult }"></div>
      </div>

      <div class="image-container">
        <img :src="imageUrl" alt="上传的图片" v-if="imageUrl" class="uploaded-image" />
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
    background-color: var(--card);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    padding: 30px;
    gap: 30px;
    display: flex;
    flex-direction: column;
  }

  .color-result {
    padding: 0 16px;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    color: var(--foreground);
    // background-color: var(--accent);
    border: 1px solid var(--border);
    border-radius: 8px;

    display: flex;
    align-items: center;

    .color {
      display: inline-block;
      width: 30px;
      height: 20px;
      margin-left: 8px;
      border-radius: 4px;
    }
  }

  .image-container {
    width: 100%;
    height: 0;
    flex: 1;
  }

  .uploaded-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
}
</style>
