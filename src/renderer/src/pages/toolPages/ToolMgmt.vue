<!-- 工具 -->
<script setup>
const router = useRouter()

const jumpTo = (e) => {
  router.push(e)
}
</script>

<template>
  <div class="page">
    <!-- 日程工具组 -->
    <div class="tool-group">
      <div class="title">日程</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/schedule')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="tool-name">日程通知</div>
              <div class="tool-desc">管理日程提醒和通知</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 实用工具组 -->
    <div class="tool-group">
      <div class="title">实用工具</div>
      <el-row :gutter="20">
        <!-- <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/music')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><Headset /></el-icon>
              </div>
              <div class="tool-name">音乐解码</div>
              <div class="tool-desc">音频文件解码和播放</div>
            </div>
          </el-card>
        </el-col> -->
        <!-- <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/color')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><Brush /></el-icon>
              </div>
              <div class="tool-name">颜色转换</div>
              <div class="tool-desc">颜色格式转换和预览</div>
            </div>
          </el-card>
        </el-col> -->
        <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/data')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="tool-name">数据转换</div>
              <div class="tool-desc">各种数据格式转换</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/photoCompression')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><Picture /></el-icon>
              </div>
              <div class="tool-name">图片压缩</div>
              <div class="tool-desc">图片文件压缩和优化</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" @click="jumpTo('/tool/getColor')">
            <div class="tool-card">
              <div class="tool-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="tool-name">颜色拾取</div>
              <div class="tool-desc">拾取屏幕上的颜色</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
.page {
  /* 标题样式 */
  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 24px;
    padding-left: 12px;
    border-left: 4px solid var(--primary);
    line-height: 38px;
  }

  /* 工具组样式 */
  .tool-group {
    margin-bottom: 40px;
  }

  /* Element Plus 卡片样式覆盖 */
  .el-row {
    margin-bottom: 16px;

    .el-col {
      /* 卡片容器 */
      .el-card {
        height: 100%;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        border: none;
        box-shadow: var(--shadow-md);
        background: var(--card);

        /* 卡片内容 */
        .el-card__body {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 140px;
        }

        /* 悬停效果 */
        &:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        /* 点击效果 */
        &:active {
          transform: translateY(-4px);
        }
      }
    }
  }

  /* 工具卡片内容样式 */
  .tool-card {
    text-align: center;
    width: 100%;

    /* 工具图标 */
    .tool-icon {
      font-size: 48px;
      color: var(--primary);
      transition: all 0.3s ease;

      .el-card:hover & {
        transform: scale(1.1);
        color: var(--primary-foreground);
      }
    }

    /* 工具名称 */
    .tool-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--foreground);
      margin-bottom: 8px;
      transition: color 0.3s ease;

      .el-card:hover & {
        color: var(--primary);
      }
    }

    /* 工具描述 */
    .tool-desc {
      font-size: 12px;
      color: var(--muted-foreground);
      line-height: 1.4;
    }
  }
}
</style>
