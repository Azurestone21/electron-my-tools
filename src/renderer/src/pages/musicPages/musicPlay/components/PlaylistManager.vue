<!-- 歌单管理 -->
<script setup lang="ts">
import DropList from '@renderer/components/DropList.vue'
import ContextMenu from '@renderer/components/ContextMenu.vue'

import { ref, computed } from 'vue'
import { useMusicStore } from '@renderer/store/modules/music'
import { ElMessage, ElMessageBox } from 'element-plus'
const musicStore = useMusicStore()
const { playlists } = storeToRefs(musicStore)

// 计算歌单数量
const playlistCount = computed(() => playlists.value.length)
const activeId = ref(playlists.value[0]?.id || 0)

// --------------------- 歌单管理 ---------------------
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
  } else {
    musicStore.createPlaylist(editingPlaylistName.value.trim())
  }
  editingPlaylistId.value = 0
  editingPlaylistName.value = ''
  showEditPlaylistDialog.value = false
  dialogMode.value = 'new'
}

// 删除歌单
const deletePlaylist = (playlist) => {
  ElMessageBox.confirm(`确定要删除歌单「${playlist.listname}」吗？`, '删除歌单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      musicStore.deletePlaylist(playlist.id)
    })
    .catch(() => {})
}

// --------------------- 歌曲管理 ---------------------
// 新增歌曲到歌单
const addSongToPlaylist = async () => {
  if (!activeId.value) {
    ElMessage.warning('请先选择一个歌单')
    return
  }
  const audioFiles = await window.musicApi.selectAudioFile()
  audioFiles.forEach((audioFile) => {
    musicStore.addSongToPlaylist(activeId.value, {
      ...audioFile,
      parentIndex: activeId.value
    })
  })
}
// 删除歌曲
const deleteSong = (song) => {
  ElMessageBox.confirm(`确定要删除歌曲「${song.songer} - ${song.songName}」吗？`, '删除歌曲', {
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

// --------------------- 歌单排序 ---------------------
const handleListDrop = (index, targetIndex) => {
  if (index !== targetIndex) {
    const newPlaylists = [...playlists.value]
    const [draggedPlaylist] = newPlaylists.splice(index, 1)
    newPlaylists.splice(targetIndex, 0, draggedPlaylist)
    musicStore.sortPlaylists(newPlaylists)
  }
}
// --------------------- 歌曲排序 ---------------------
const handleSongDrop = (index, draggedIndex) => {
  if (draggedIndex !== null && draggedIndex !== index) {
    const temp = currentPlaylist.value[draggedIndex]
    currentPlaylist.value.splice(draggedIndex, 1)
    currentPlaylist.value.splice(index, 0, temp)
  }
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
        <DropList
          v-model:activeId="activeId"
          :lists="playlists"
          @onClick="(item) => (activeId = item.id)"
          @onDrop="handleListDrop"
          @showContextMenu="(e, item) => showContextMenu(e, item, playlistContextMenuItems)"
        >
          <template #item="{ item }">
            <div>{{ item.listname }} （{{ item.songs.length || 0 }}首）</div>
          </template>
        </DropList>
      </div>
    </div>

    <div class="right">
      <div class="add_song">
        <div v-show="activeId" @click="addSongToPlaylist">
          <el-icon><Plus /></el-icon>
        </div>
      </div>
      <div class="songs_list">
        <DropList
          :lists="playlists.find((p) => p.id === activeId)?.songs || []"
          @onDrop="handleSongDrop"
          @showContextMenu="(e, item) => showContextMenu(e, item, songContextMenuItems)"
        >
          <template #item="{ item, index }">
            <div>{{ index + 1 }}. {{ item.songer }} - {{ item.songName }}</div>
          </template>
        </DropList>
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
    }
  }
}
</style>
