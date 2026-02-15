<!-- 可拖拽列表 -->
<script setup lang="ts">
import { ref } from 'vue'

export interface Props {
  activeId?: number | string
  lists: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['onDrop', 'showContextMenu', 'onClick', 'onDblClick'])

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
  emit('onDrop', index, draggedIndex)
  dragOverIndex.value = null
  draggedIndex = null
}

// 点击项
const onClick = (item) => {
  emit('onClick', item)
}

// 双击项
const onDblClick = (item) => {
  emit('onDblClick', item)
}
</script>

<template>
  <div class="drop-list">
    <div
      v-for="(item, index) in lists"
      :key="item.id"
      :class="{ item: true, active: item.id === activeId }"
      draggable="true"
      @dragstart="onDragStart($event, index)"
      @dragover.prevent="onDragOver($event, index)"
      @dragenter.prevent="onDragEnter($event, index)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, index)"
      @contextmenu="(e) => emit('showContextMenu', e, item)"
      @click="onClick(item)"
      @dblclick="onDblClick(item)"
    >
      <div class="info">
        <slot name="item" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.drop-list {
  display: flex;
  flex-direction: column;
}
.item {
  padding: 4px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background);
  cursor: pointer;

  .info {
    flex: 1;
    color: var(--foreground);
    font-size: 14px;
  }

  &.active {
    .info {
      flex: 1;
      color: var(--primary) !important;
      font-weight: 500;
    }
  }
  &:hover {
    background-color: var(--border);
  }
}
</style>
