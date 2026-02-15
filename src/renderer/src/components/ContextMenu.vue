<!-- 右键上下文菜单 -->
<script setup lang="ts">
import {  onMounted, onBeforeUnmount } from 'vue'

interface MenuItem {
  name: string
  handler?: () => void
}

interface Props {
  visible: boolean // 是否显示菜单
  position: { x: number; y: number } // 菜单位置
  menuItems: MenuItem[] // 菜单列表
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'select', item: MenuItem): void
}>()

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const menu = document.querySelector('.context-menu')
  if (menu && !menu.contains(event.target as Node)) {
    emit('update:visible', false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 点击菜单项
const handleItemClick = (item: MenuItem) => {
  if (item.handler) {
    item.handler()
  }
  emit('select', item)
  emit('update:visible', false)
}
</script>

<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px'
    }"
  >
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      class="context-menu-item"
      @click="handleItemClick(item)"
    >
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.context-menu {
  position: fixed;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 80px;

  .context-menu-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--foreground);

    &:hover {
      background-color: var(--border);
    }

    .menu-icon {
      font-size: 16px;
    }
  }
}
</style>
