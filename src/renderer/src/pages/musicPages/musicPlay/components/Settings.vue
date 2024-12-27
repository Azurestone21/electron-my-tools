<!-- 音乐设置 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const indexStore = useIndexStore()
const { basePath } = storeToRefs(indexStore)
const formLabelWidth = '60px'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onCancel'])

const form = reactive({
  basePath: basePath.value,
})

function cancelClick() {
  emits('onCancel')
}
function submit(type:string) {
  indexStore.setStore({
    [type]: form[type]
  })
  if (type == 'basePath') {
    proxy.$eventBus.emit('refreshMusic')
  }
}
</script>

<template>
  <el-drawer :modelValue="open" :show-close="false" :size="'40%'" @closed="cancelClick">
    <template #header>
      <div>设置</div>
    </template>
    <template #default>
      <div class="demo-drawer__content">
        <el-form :model="form">
          <el-form-item label="根目录" :label-width="formLabelWidth">
            <el-input v-model="form.basePath" autocomplete="off" @blur="submit('basePath')" />
          </el-form-item>
        </el-form>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <!-- <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">确定</el-button> -->
      </div>
    </template>
  </el-drawer>
</template>

<style lang="less" scoped></style>
