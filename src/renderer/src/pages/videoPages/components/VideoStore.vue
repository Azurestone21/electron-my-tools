<!-- 音乐设置 -->
<script setup lang="ts">
import VideoListManager from './VideoListManager.vue'
import MyTabs from '@renderer/components/MyTabs.vue'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onCancel'])

const cancelClick = (e) => {
  e.stopPropagation()
  emits('onCancel')
}

const activeTab = ref('videoList')
const tabs = [
  {
    key: 'videoList',
    name: '我的视频',
    component: VideoListManager
  }
]
function handleChangeTab(tab) {
  activeTab.value = tab
}
</script>

<template>
  <el-dialog :modelValue="open" :show-close="false" :width="'60%'">
    <template #header>
      <div class="video-store-header">
        <div>视频库</div>
        <div class="close-btn" @click="cancelClick">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </template>
    <template #default>
      <div class="video-store-content">
        <div class="video-store-tabs">
          <MyTabs :tabs="tabs" :activeTab="activeTab" @onChangeTab="handleChangeTab" />
        </div>
        <div class="video-store-tabs-content">
          <component :is="tabs.find(tab => tab.key === activeTab).component" />
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.video-store-header {
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
.video-store-content {
  height: 400px;
  display: flex;
  flex-direction: column;

  .video-store-tabs-content {
    flex: 1;
    height: 0;
    padding-top: 10px;
  }
}
</style>
