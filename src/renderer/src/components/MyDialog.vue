<!-- 音乐设置 -->
<script setup lang="ts">
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['onCancel'])

const cancelClick = () => {
  emits('onCancel')
}
</script>

<template>
  <el-dialog :modelValue="open" :show-close="false" :width="'60%'">
    <template #header>
      <div class="dialog-header">
        <div>{{ title }}</div>
        <div class="close-btn" @click="cancelClick">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </template>
    <template #default>
      <div class="dialog-content">
        <slot></slot>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.dialog-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .close-btn {
    cursor: pointer;
  }
}
.dialog-content {
  height: 400px;
  display: flex;
  flex-direction: column;
}
</style>
