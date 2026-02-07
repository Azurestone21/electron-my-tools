<!-- 自定义选项卡组件 -->
<script setup lang="ts">
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
</script>

<template>
  <div
    class="my-tabs-item"
    v-for="item in tabs"
    :key="item.key"
    :class="{ active: item.key === activeTab }"
    @click="$emit('onChangeTab', item.key)"
  >
    {{ item.name }}
  </div>
</template>

<style lang="less" scoped>
.my-tabs {
  display: flex;
  align-items: center;
  overflow-x: auto;
}
.my-tabs-item {
  padding: 6px 20px 8px 0;
  width: fit-content;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  font-weight: 500;
  color: var(--foreground);
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
