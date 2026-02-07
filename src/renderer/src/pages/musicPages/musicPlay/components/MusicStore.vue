<!-- 音乐设置 -->
<script setup lang="ts">
import PlaylistManager from './PlaylistManager.vue'
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

const activeTab = ref('songList')
const tabs = [
  {
    key: 'songList',
    name: '我的歌单',
    component: PlaylistManager
  }
]
function handleChangeTab(tab) {
  activeTab.value = tab
}
</script>

<template>
  <el-dialog :modelValue="open" :show-close="false" :width="'60%'">
    <template #header>
      <div class="music-store-header">
        <div>音乐库</div>
        <div class="close-btn" @click="cancelClick">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </template>
    <template #default>
      <div class="music-store-content">
        <div class="music-store-tabs">
          <MyTabs :tabs="tabs" :activeTab="activeTab" @onChangeTab="handleChangeTab" />
        </div>
        <div class="music-store-tabs-content">
          <component :is="tabs.find(tab => tab.key === activeTab).component" />
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.music-store-header {
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
.music-store-content {
  height: 400px;
  display: flex;
  flex-direction: column;

  .music-store-tabs-content {
    flex: 1;
    padding-top: 10px;
  }
}
</style>
