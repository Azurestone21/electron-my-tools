<!-- 设置 -->
<script setup lang="ts">
import { IAppSettings } from '@renderer/types/global'
const indexStore = useIndexStore()
const { appSettingsVisible, appSettings } = storeToRefs(indexStore)

const formLabelWidth = '80px'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onCancel'])

// 关闭设置弹窗
const onClose = () => {
  indexStore.setStore({
    appSettingsVisible: false
  })
}

// 确保 appSettings 存在
const form = reactive(appSettings.value)
const onSubmit = () => {
  indexStore.setAppSettings(form as IAppSettings)
  onClose()
}
</script>

<template>
  <el-dialog
    class="custom-transition-dialog"
    v-model="appSettingsVisible"
    :title="'设置'"
    width="70%"
    closed="onClose"
  >
    <div>
      <el-form :model="form" :label-width="formLabelWidth" ref="formRef">
        <el-form-item label="主题" prop="theme">
          <el-radio-group v-model="form.theme">
            <el-radio-button label="light">亮色</el-radio-button>
            <el-radio-button label="dark">暗色</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped></style>
