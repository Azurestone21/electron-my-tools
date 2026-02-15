<!-- 歌单管理 -->
<script setup lang="ts">
import ContextMenu from '@renderer/components/ContextMenu.vue'

import { ref, computed } from 'vue'
import { useMusicStore } from '@renderer/store/modules/music'
import { ElMessage, ElMessageBox } from 'element-plus'
const musicStore = useMusicStore()
const { playlists } = storeToRefs(musicStore)

// 计算歌单数量
const playlistCount = computed(() => playlists.value.length)
const activeId = ref(playlists.value[0]?.id || 0)

const editingPlaylistId = ref(0)
const editingPlaylistName = ref('')
const showEditPlaylistDialog = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
// 编辑歌单-打开弹窗
const editPlaylist = (playlist) => {
  editingPlaylistId.value = playlist.id
  editingPlaylistName.value = playlist.name
  dialogMode.value = 'edit'
  showEditPlaylistDialog.value = true
}
// 保存歌单名称
const editPlaylistName = () => {
  if (!editingPlaylistName.value.trim()) {
    ElMessage.warning('请输入歌单名称')
    return
  }
  if (dialogMode.value === 'edit') {
    musicStore.updatePlaylistName(editingPlaylistId.value, editingPlaylistName.value.trim())
    ElMessage.success('歌单名称修改成功')
  } else {
    musicStore.createPlaylist(editingPlaylistName.value.trim())
    ElMessage.success('歌单创建成功')
  }
  editingPlaylistId.value = 0
  editingPlaylistName.value = ''
  showEditPlaylistDialog.value = false
  dialogMode.value = 'new'
}

// 删除歌单
const deletePlaylist = (playlist) => {
  ElMessageBox.confirm(`确定要删除歌单「${playlist.name}」吗？`, '删除歌单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      musicStore.deletePlaylist(playlist.id)
      ElMessage.success('歌单删除成功')
    })
    .catch(() => {})
}

// 歌单排序
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
    const newPlaylists = [...playlists.value]
    const [draggedPlaylist] = newPlaylists.splice(dragStartIndex.value, 1)
    newPlaylists.splice(targetIndex, 0, draggedPlaylist)
    musicStore.sortPlaylists(newPlaylists)
    ElMessage.success('歌单排序成功')
  }
}

// --------------------- 歌曲管理 ---------------------
// 新增歌曲到歌单
const addSongToPlaylist = () => {
  if (!activeId.value) {
    ElMessage.warning('请先选择一个歌单')
    return
  }

  // 创建文件选择输入
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/*'
  input.multiple = true

  // 处理文件选择
  input.onchange = (event) => {
    const files = (event.target as HTMLInputElement).files
    console.log('🚀 ~ files:', files)

    if (!files || files.length === 0) {
      return
    }

    // 处理选择的文件
    const addedSongs = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.path) {
        continue
      }
      // 创建歌曲对象
      const fileName = file.name.replace(/\.[^/.]+$/, '') // 移除文件扩展名
      const songname = fileName?.split(' - ')?.[1]?.trim() || fileName?.trim() || '未知歌曲'
      const songer = fileName?.split(' - ')?.[0]?.trim() || '未知'
      const song = {
        id: Date.now() + i,
        songname,
        songer,
        songURL: file.path, // 使用文件路径或文件名
        parentIndex: activeId.value,
        imgSrc: '' // 可以后续添加封面图片逻辑
      }

      // 添加歌曲到歌单
      musicStore.addSongToPlaylist(activeId.value, song)
      addedSongs.push(song)
    }

    // 显示成功提示
    if (addedSongs.length > 0) {
      ElMessage.success(`成功添加 ${addedSongs.length} 首歌曲到歌单`)
    }
  }

  // 触发文件选择
  input.click()
}

// 编辑歌曲
const editSong = (song) => {}
// 删除歌曲
const deleteSong = (song) => {
  ElMessageBox.confirm(`确定要删除歌曲「${song.songer} - ${song.songname}」吗？`, '删除歌曲', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      musicStore.removeSongFromPlaylist(activeId.value, song.id)
      ElMessage.success('歌曲删除成功')
    })
    .catch(() => {})
}

const currentPlaylist = computed(
  () => playlists.value?.find((p) => p.id === activeId.value)?.songs || []
)

// --------------------- 歌单歌曲排序 ---------------------
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

// --------------------- 歌单上下文菜单 ---------------------
const playlistContextMenuItems = computed(() => [
  {
    name: '编辑',
    handler: () => {
      editPlaylist(contextMenuSelected.value)
    }
  },
  {
    name: '删除',
    handler: () => {
      if (contextMenuSelected.value && playlists.value) {
        deletePlaylist(contextMenuSelected.value)
      }
    }
  }
])

// --------------------- 歌曲上下文菜单 ---------------------
const songContextMenuItems = computed(() => [
  {
    name: '删除',
    handler: () => {
      if (contextMenuSelected.value && currentPlaylist.value) {
        deleteSong(contextMenuSelected.value)
      }
    }
  }
])
</script>

<template>
  <div class="playlist_manager">
    <!-- 歌单标题和新建按钮 -->
    <div class="left">
      <div class="title_container">
        <div class="text">歌单列表</div>
        <div @click="showEditPlaylistDialog = true">
          <el-icon><Plus /></el-icon>
        </div>
      </div>

      <!-- 歌单列表 -->
      <div class="playing_list">
        <div v-if="playlistCount === 0" class="empty_playlist">暂无歌单</div>
        <div
          v-for="(playlist, index) in playlists"
          :key="playlist.id"
          :class="{ playing_item: true, active: playlist.id === activeId }"
          draggable
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver"
          @drop="handleDrop($event, index)"
          @contextmenu="(e) => showContextMenu(e, playlist, playlistContextMenuItems)"
        >
          <div class="playing_info" @click="activeId = playlist.id">
            <div class="playing_name">
              {{ playlist.listname }} （{{ playlist.songs.length || 0 }}首）
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="add_song">
        <div v-show="activeId" @click="addSongToPlaylist">
          <el-icon><Plus /></el-icon>
        </div>
      </div>
      <div class="songs_list">
        <div
          class="song_item"
          v-for="(song, index) in playlists.find((p) => p.id === activeId)?.songs || []"
          :key="song.id"
          :title="song.songURL"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover.prevent="onDragOver($event, index)"
          @dragenter.prevent="onDragEnter($event, index)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, index)"
          @contextmenu="(e) => showContextMenu(e, song, songContextMenuItems)"
        >
          <div class="song_index">{{ index + 1 }}</div>
          <div class="song_info">
            <div class="song_name">{{ song.songer }} - {{ song.songname }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建、编辑歌单对话框 -->
    <el-dialog v-model="showEditPlaylistDialog" width="300px" custom-class="playlist_dialog">
      <template #title>
        <div class="dialog-title">
          {{ dialogMode === 'new' ? '新建歌单' : '编辑歌单' }}
        </div>
      </template>
      <el-input
        v-model="editingPlaylistName"
        placeholder="请输入歌单名称"
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

    <!-- 上下文菜单 -->
    <ContextMenu
      v-model:visible="contextMenuVisible"
      :position="contextMenuPosition"
      :menuItems="contextMenuItems"
    />
  </div>
</template>

<style lang="less" scoped>
.playlist_manager {
  height: 100%;
  display: flex;

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

    .playing_list {
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

      .playing_item {
        padding: 4px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        cursor: pointer;

        .playing_info {
          flex: 1;

          .playing_name {
            color: var(--foreground);
            font-size: 14px;
          }

          .playing_meta {
            color: var(--muted-foreground);
            font-size: 12px;
          }
        }

        &.active {
          .playing_info {
            flex: 1;

            .playing_name {
              color: var(--primary) !important;
              font-weight: 500;
            }
          }
        }
        &:hover {
          background-color: aliceblue;
        }
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .add_song {
      padding: 0 10px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .songs_list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 0;

      &::-webkit-scrollbar {
        display: none;
      }

      .song_item {
        padding: 4px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--background);
        cursor: pointer;

        .song_index {
          margin-right: 8px;
          width: 20px;
          text-align: right;
          color: var(--foreground);
          font-size: 14px;
        }

        .song_info {
          flex: 1;

          .song_name {
            color: var(--foreground);
            font-size: 14px;
          }

          .song_meta {
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
