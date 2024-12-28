<!-- 音乐设置 -->
<script setup lang="ts">
const { proxy } = getCurrentInstance()
const musicStore = useMusicStore()
const { basePath } = storeToRefs(musicStore)
const formLabelWidth = '60px'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onCancel'])

const form = reactive({
  basePath: basePath.value
})

function cancelClick() {
  emits('onCancel')
}
function submit(type: string) {
  musicStore.setStore({
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
    <template #footer> </template>
  </el-drawer>
</template>

<style lang="less" scoped></style>
