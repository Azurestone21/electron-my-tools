<!-- 自定义选项卡组件 -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: ''
  },
  tabs: {
    type: Array as PropType<{ key: string; name: string }[]>,
    default: () => []
  }
})
defineEmits(['onChangeTab'])

const tabsContainer = ref<HTMLElement>()
let isDragging = false
let startX = 0
let scrollLeft = 0

const handleMouseDown = (e: MouseEvent) => {
  isDragging = true
  startX = e.pageX - (tabsContainer.value?.offsetLeft || 0)
  scrollLeft = tabsContainer.value?.scrollLeft || 0
  tabsContainer.value?.classList.add('dragging')
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  e.preventDefault()
  const x = e.pageX - (tabsContainer.value?.offsetLeft || 0)
  const walk = (x - startX) * 2
  if (tabsContainer.value) {
    tabsContainer.value.scrollLeft = scrollLeft - walk
  }
}

const handleMouseUp = () => {
  isDragging = false
  tabsContainer.value?.classList.remove('dragging')
}

const handleMouseLeave = () => {
  isDragging = false
  tabsContainer.value?.classList.remove('dragging')
}

onMounted(() => {
  tabsContainer.value?.addEventListener('mousedown', handleMouseDown)
  tabsContainer.value?.addEventListener('mousemove', handleMouseMove)
  tabsContainer.value?.addEventListener('mouseup', handleMouseUp)
  tabsContainer.value?.addEventListener('mouseleave', handleMouseLeave)
})

onBeforeUnmount(() => {
  tabsContainer.value?.removeEventListener('mousedown', handleMouseDown)
  tabsContainer.value?.removeEventListener('mousemove', handleMouseMove)
  tabsContainer.value?.removeEventListener('mouseup', handleMouseUp)
  tabsContainer.value?.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <div class="my-tabs" ref="tabsContainer">
    <div
      class="my-tabs-item"
      v-for="item in tabs"
      :key="item.key"
      :class="{ active: item.key === activeTab }"
      @click="$emit('onChangeTab', item.key)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<style lang="less" scoped>
.my-tabs {
  display: flex;
  align-items: center;
  overflow-x: auto;
  cursor: grab;
  user-select: none;
  &::-webkit-scrollbar {
    display: none;
  }
  &.dragging {
    cursor: grabbing;
  }
}
.my-tabs-item {
  padding: 6px 20px 8px 0;
  width: fit-content;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  font-weight: 500;
  color: var(--foreground);
  white-space: nowrap;
}
.my-tabs-item.active {
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: calc((100% - 20px) / 2);
    transform: translateX(-50%);
    width: 20px;
    height: 5px;
    border-radius: 2px;
    background-color: var(--primary);
    transition: all 0.3s ease-in-out;
  }
}
</style>
