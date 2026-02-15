<!-- 播放列表管理 -->
<script setup lang="ts">
import ContextMenu from '@renderer/components/ContextMenu.vue'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVideoStore } from '@renderer/store/modules/video'
const videoStore = useVideoStore()
const { videoList } = storeToRefs(videoStore)

// 计算播放列表数量
const activeId = ref(videoList.value[0]?.id || 0)
// 切换播放列表
const changeActiveId = (id) => {
  activeId.value = id
}

const editingPlaylistId = ref(0)
const editingPlaylistName = ref('')
const showEditPlaylistDialog = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
// 编辑播放列表-打开弹窗
const editPlaylist = (playlist) => {
  editingPlaylistId.value = playlist.id
  editingPlaylistName.value = playlist.name
  dialogMode.value = 'edit'
  showEditPlaylistDialog.value = true
}
// 保存播放列表名称
const editPlaylistName = () => {
  if (!editingPlaylistName.value.trim()) {
    ElMessage.warning('请输入播放列表名称')
    return
  }
  if (dialogMode.value === 'edit') {
    videoStore.updatePlaylistName(editingPlaylistId.value, editingPlaylistName.value.trim())
    ElMessage.success('播放列表名称修改成功')
  } else {
    videoStore.createPlaylist(editingPlaylistName.value.trim())
    ElMessage.success('播放列表创建成功')
  }
  editingPlaylistId.value = 0
  editingPlaylistName.value = ''
  showEditPlaylistDialog.value = false
  dialogMode.value = 'new'
}
// 删除播放列表
const deletePlaylist = (playlist) => {
  ElMessageBox.confirm(`确定要删除播放列表「${playlist.name}」吗？`, '删除播放列表', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      videoStore.deletePlaylist(playlist.id)
    })
    .catch(() => {})
}

// ---------------------- 播放列表排序 ----------------------
const isDragging = ref(false)
const dragStartIndex = ref(0)
const handleDragStart = (event, index) => {
  isDragging.value = true
  dragStartIndex.value = index
  event.target.style.opacity = '0.5'
}
const handleDragEnd = (event) => {
  isDragging.value = false
  event.target.style.opacity = '1'
}
const handleDragOver = (event) => {
  event.preventDefault()
}
const handleDrop = (event, targetIndex) => {
  event.preventDefault()
  if (dragStartIndex.value !== targetIndex) {
    const newPlaylists = [...videoList.value]
    const [draggedPlaylist] = newPlaylists.splice(dragStartIndex.value, 1)
    newPlaylists.splice(targetIndex, 0, draggedPlaylist)
    videoStore.sortPlaylists(newPlaylists)
  }
}

// --------------------- 视频管理 ---------------------
// 添加视频
const addVideoToList = async () => {
  const videos = await window.videoHandle.selectVideoFile()
  if (videos && videos.length > 0) {
    if (videoList.value.length === 0) {
      videoStore.createPlaylist('默认列表')
    }
    const listId = activeId.value || videoList.value[0].id
    videos.forEach((video) => {
      videoStore.addVideoToPlaylist(listId, {
        ...video,
        parentId: listId
      })
    })
  }
}
// 删除视频
const deleteVideo = (video) => {
  ElMessageBox.confirm(`确定要删除视频「${video.fileName}」吗？`, '删除视频', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      videoStore.removeVideoFromPlaylist(activeId.value, video.id)
    })
    .catch(() => {})
}

const currentPlaylist = computed(
  () => videoList.value?.find((p) => p.id === activeId.value)?.list || []
)

// --------------------- 视频排序 ---------------------
let draggedIndex = null
const dragOverIndex = ref(null)

const onDragStart = (event, index) => {
  draggedIndex = index
  event.dataTransfer.setData('text/plain', index)
  event.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (event, index) => {
  event.preventDefault()
  if (draggedIndex !== index) {
    dragOverIndex.value = index
  }
}

const onDragEnter = (event, index) => {
  event.preventDefault()
  dragOverIndex.value = index
}

const onDragLeave = (event) => {
  // 防止子元素触发
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dragOverIndex.value = null
  }
}

const onDrop = (event, index) => {
  event.preventDefault()
  if (draggedIndex !== null && draggedIndex !== index) {
    // 交换数组元素
    const temp = currentPlaylist.value[draggedIndex]
    currentPlaylist.value.splice(draggedIndex, 1)
    currentPlaylist.value.splice(index, 0, temp)
  }
  dragOverIndex.value = null
  draggedIndex = null
}

// --------------------- 上下文菜单 ---------------------
const contextMenuVisible = ref<boolean>(false)
const contextMenuPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const contextMenuSelected = ref<any>(null)
const contextMenuItems = ref<any>(null)
const showContextMenu = (e: MouseEvent, item: any, menuItems: any) => {
  e.preventDefault()
  e.stopPropagation()
  contextMenuSelected.value = item
  contextMenuItems.value = menuItems
  contextMenuPosition.value = {
    x: e.clientX,
    y: e.clientY
  }
  contextMenuVisible.value = true
}

// --------------------- 视频集合上下文菜单 ---------------------
const videoListContextMenuItems = computed(() => [
  {
    name: '编辑',
    handler: () => {
      editPlaylist(contextMenuSelected.value)
    }
  },
  {
    name: '删除',
    handler: () => {
      if (contextMenuSelected.value && videoList.value) {
        deletePlaylist(contextMenuSelected.value)
      }
    }
  }
])

// --------------------- 视频上下文菜单 ---------------------
const videoContextMenuItems = computed(() => [
  {
    name: '删除',
    handler: () => {
      if (contextMenuItems.value && currentPlaylist.value) {
        deleteVideo(contextMenuItems.value)
      }
    }
  }
])
</script>

<template>
  <div class="video_list_manager">
    <!-- 视频集合标题和新建按钮 -->
    <div class="left">
      <div class="title_container">
        <div class="text">视频集合</div>
        <div @click="showEditPlaylistDialog = true">
          <el-icon><Plus /></el-icon>
        </div>
      </div>

      <!-- 视频集合列表 -->
      <div class="video_list">
        <div v-if="videoList.length === 0" class="empty_playlist">暂无视频集合</div>
        <div
          v-for="(item, index) in videoList"
          :key="item.id"
          :class="{ video_item: true, active: item.id === activeId }"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover.prevent="handleDragOver"
          @dragend.prevent="handleDragEnd"
          @drop="handleDrop($event, index)"
          @contextmenu="showContextMenu($event, item, videoListContextMenuItems)"
        >
          <div class="video_info" @click="changeActiveId(item.id)">
            <div class="video_name">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="add_video">
        <div v-show="activeId" @click="addVideoToList">
          <el-icon><Plus /></el-icon>
        </div>
      </div>
      <div class="videos_list">
        <div
          class="video_item"
          v-for="(video, index) in currentPlaylist"
          :key="video.id"
          :title="video.fileName"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover.prevent="onDragOver($event, index)"
          @dragenter.prevent="onDragEnter($event, index)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, index)"
          @contextmenu="showContextMenu($event, video, videoContextMenuItems)"
        >
          <div class="video_index">{{ index + 1 }}</div>
          <div class="video_info">
            <div class="video_name">{{ video.fileName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上下文菜单 -->
    <ContextMenu
      v-model:visible="contextMenuVisible"
      :position="contextMenuPosition"
      :menuItems="contextMenuItems"
    />

    <!-- 新建、编辑视频集合对话框 -->
    <el-dialog v-model="showEditPlaylistDialog" width="300px" custom-class="video_dialog">
      <template #title>
        <div class="dialog-title">
          {{ dialogMode === 'new' ? '新建视频集合' : '编辑视频集合' }}
        </div>
      </template>
      <el-input
        v-model="editingPlaylistName"
        placeholder="请输入视频集合名称"
        maxlength="20"
        show-word-limit
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditPlaylistDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="editPlaylistName"
            style="background-color: var(--primary); border-color: var(--primary)"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.video_list_manager {
  height: 100%;
  display: flex;
  position: relative;

  .left,
  .right {
    padding: 10px 0 0;
    border: 1px solid var(--border);
  }

  .left {
    width: 30%;
    margin-right: 10px;
    display: flex;
    flex-direction: column;

    .title_container {
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: var(--foreground);
    }

    .video_list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 0;

      &::-webkit-scrollbar {
        display: none;
      }

      .empty_playlist {
        text-align: center;
        color: var(--muted-foreground);
        font-size: 14px;
      }

      .video_item {
        padding: 4px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;

        .video_info {
          flex: 1;

          .video_name {
            color: var(--foreground);
            font-size: 14px;
          }

          .video_meta {
            color: var(--muted-foreground);
            font-size: 12px;
          }
        }

        &.active {
          .video_info {
            flex: 1;

            .video_name {
              color: var(--primary);
              font-weight: 500;
            }
          }
        }
        &:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .add_video {
      padding: 0 10px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .videos_list {
      flex: 1;
      height: 0;
      overflow-y: auto;
      padding: 6px 0;

      &::-webkit-scrollbar {
        display: none;
      }

      .video_item {
        padding: 4px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--background);
        cursor: pointer;

        .video_index {
          margin-right: 8px;
          width: 20px;
          text-align: right;
          color: var(--foreground);
          font-size: 14px;
        }

        .video_info {
          flex: 1;

          .video_name {
            color: var(--foreground);
            font-size: 14px;
          }

          .video_meta {
            color: var(--muted-foreground);
            font-size: 12px;
          }
        }

        &::nth-child(even) {
          background-color: var(--alternate);
        }

        &:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
      }
    }
  }
}
</style>
