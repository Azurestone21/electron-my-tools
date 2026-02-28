<!-- 格式转换 -->
<script setup lang="ts">
import MyTable from '@components/MyTable.vue'
import { Column, ActionButton } from '@renderer/components/MyTable'

import { formatFileSize } from '@share/utils/common'
import { ref, onMounted, computed } from 'vue'

import TransformConfigDialog from './components/TransformConfig/index.vue'
import { useTranscodeTaskStore } from '@renderer/store/modules/transcodeTask'
import { ETranscodeStatus } from '@share/types/transcodeTask'

const fileType = ref('')
const fileData = ref([])
const loading = ref(false)

const transformConfigOpen = ref(false)
const cancelTransformConfig = () => {
  transformConfigOpen.value = false
}

// 任务中心抽屉
const taskCenterDrawer = ref(false)
const openTranscodeTaskCenter = () => {
  taskCenterDrawer.value = true
}

const transcodeTaskStore = useTranscodeTaskStore()

// 计算所有转码任务
const allTasks = computed(() => transcodeTaskStore.getAllTasks)

// 转码状态文本
const getTranscodeStatusText = (progress: number, status: ETranscodeStatus) => {
  switch (status) {
    case ETranscodeStatus.Pending:
      return '等待中'
    case ETranscodeStatus.Running:
      return `转码中 ${Math.round(progress)}%`
    case ETranscodeStatus.Completed:
      return '转码完成'
    case ETranscodeStatus.Failed:
      return '转码失败'
    case ETranscodeStatus.Cancelled:
      return '已取消'
    default:
      return ''
  }
}

const fileTypeOptions = [
  {
    label: '视频',
    value: 'video'
  }
]

const columns = [
  {
    key: 'fileName',
    label: '文件名'
  },
  {
    key: 'containerFormat',
    label: '容器格式'
  },
  {
    key: 'videoCodec',
    label: '视频编码'
  },
  {
    key: 'audioCodec',
    label: '音频编码'
  },
  {
    key: 'fileSize',
    label: '文件大小',
    render: (row) => formatFileSize(row.fileSize)
  }
] as Column[]

// 选择文件
const handleSelectFile = async () => {
  const file = await window.formatHandle.selectFile(fileType.value)
  if (file) {
    fileData.value.push(file)
  }
}

// 配置
const handleConfig = () => {
  transformConfigOpen.value = true
}

// 提交
const submit = async () => {
  loading.value = true
  await handleTransformAll()
  // 清除已处理文件
  fileData.value = []
  loading.value = false
}

// 生成任务ID的辅助函数
const generateTaskId = (inputPath: string): string => {
  // 先对字符串进行URI编码，然后再使用btoa进行Base64编码
  // 这样可以处理包含非Latin1字符的文件路径
  const hash = btoa(encodeURIComponent(inputPath)).replace(/[+/=]/g, '').substring(0, 16)
  return `task_${hash}`
}

// 转化单个文件
const handleTranscode = async (file, type: 'new' | 'retry' = 'new') => {
  // 生成任务ID（与main进程相同的生成方式）
  const taskId = generateTaskId(file.filePath)

  // 检查任务是否已存在
  const existingTask = transcodeTaskStore.getTask(taskId)
  if (!existingTask) {
    // 使用字符串操作获取文件扩展名
    const lastDotIndex = file.filePath.lastIndexOf('.')
    const ext = lastDotIndex !== -1 ? file.filePath.substring(lastDotIndex) : ''
    // 创建初始任务记录
    transcodeTaskStore.addTask({
      taskId,
      inputPath: file.filePath,
      outputPath: file.filePath.replace(ext, '_converted.mp4'),
      progress: 0,
      status: ETranscodeStatus.Pending,
      startTime: Date.now()
    })
  }

  // 开始转码任务
  const resultTaskId = await window.formatHandle.startTranscodeTask(file.filePath, type)
  console.log('转码任务ID:', resultTaskId)
}

// 转化所有文件
const handleTransformAll = async () => {
  for (const file of fileData.value) {
    await handleTranscode(file)
  }
}

// 监听转码进度
const setupProgressListener = () => {
  if (window.formatHandle.onTranscodeProgress) {
    window.formatHandle.onTranscodeProgress((progress) => {
      console.log('转码进度:', progress)
      // 检查任务是否存在
      const existingTask = transcodeTaskStore.getTask(progress.taskId)
      if (existingTask) {
        // 更新现有任务
        transcodeTaskStore.updateTask(progress.taskId, {
          progress: progress.progress,
          status: progress.status,
          error: progress.error
        })
      } else {
        // 创建新任务
        transcodeTaskStore.addTask({
          taskId: progress.taskId,
          inputPath: progress.inputPath,
          outputPath: progress.outputPath,
          progress: progress.progress,
          status: progress.status,
          error: progress.error,
          startTime: Date.now()
        })
      }
    })
  }
}

// 任务中心列配置
const taskCenterColumns = [
  {
    key: 'taskId',
    label: '任务ID'
  },
  {
    key: 'inputPath',
    label: '原文件路径'
  },
  {
    key: 'outputPath',
    label: '输出文件路径'
  },
  {
    key: 'progress',
    label: '进度',
    render: (row) => {
      if (row.status === ETranscodeStatus.Completed) {
        return '100%'
      }
      return `${Math.round(row.progress || 0)}%`
    }
  },
  {
    key: 'status',
    label: '状态',
    render: (row) => {
      return getTranscodeStatusText(row.progress, row.status)
    }
  },
  {
    key: 'action',
    label: '操作'
  }
] as Column[]

// 任务中心操作按钮
const taskCenterActions: ActionButton[] = [
  {
    label: '取消',
    handler: async (task) => {
      await window.formatHandle.cancelTranscodeTask(task.taskId)
    },
    hide: (task) => {
      return task.status !== ETranscodeStatus.Running && task.status !== ETranscodeStatus.Pending
    }
  },
  {
    label: '删除',
    handler: async (task) => {
      await window.formatHandle.deleteTranscodeTask(task.taskId)
      transcodeTaskStore.removeTask(task.taskId)
    }
  }
]

// 生命周期
onMounted(() => {
  setupProgressListener()
})
</script>

<template>
  <div class="page">
    <div class="flex justify-between">
      <div class="title">格式转换</div>
      <div>
        <el-button @click="openTranscodeTaskCenter">任务中心</el-button>
      </div>
    </div>
    <div class="">
      <el-form label-suffix="：">
        <el-form-item label="文件类型">
          <el-select v-model="fileType" placeholder="请选择文件类型" clearable>
            <el-option
              v-for="item in fileTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="fileType">
        <el-button type="primary" @click="handleSelectFile">选择文件</el-button>
        <el-button @click="handleConfig">转化配置</el-button>
        <el-button @click="handleTransformAll" v-if="fileData.length">批量转化</el-button>
      </div>

      <div class="table" v-if="fileType === 'video'">
        <MyTable :columns="columns" :fileData="fileData" />
      </div>

      <div v-if="fileData.length" class="mt-4">
        <el-button type="primary" @click="submit" :loading="loading" disabled="loading"
          >确认</el-button
        >
      </div>
    </div>

    <TransformConfigDialog :open="transformConfigOpen" @onCancel="cancelTransformConfig" />

    <!-- 任务中心抽屉 -->
    <el-drawer v-model="taskCenterDrawer" title="转码任务中心" direction="rtl" size="80%">
      <div class="task-center">
        <MyTable :columns="taskCenterColumns" :fileData="allTasks" :actions="taskCenterActions" />
      </div>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.page {
  width: 100%;
}
</style>
