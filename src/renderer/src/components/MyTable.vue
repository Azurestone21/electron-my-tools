<!-- 表格组件 -->
<script setup lang="ts">
import { PropType } from 'vue'
import { ActionButton, Column } from './MyTable'

const props = defineProps({
  columns: {
    type: Array as PropType<Column[]>,
    default: () => []
  },
  fileData: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  actions: {
    type: Array as PropType<ActionButton[]>,
    default: () => []
  }
})

// 处理操作按钮点击
const handleAction = async (action: ActionButton, row: any) => {
  await action.handler(row)
}
</script>

<template>
  <div class="my-table">
    <table>
      <tr class="table-header">
        <th
          v-for="(column, columnIndex) in columns"
          :key="column.key"
          :align="column.align || 'center'"
          style="width: 200px"
        >
          {{ column.label }}
        </th>
      </tr>
      <tr class="table-row" v-for="(item, itemIndex) in fileData" :key="item.id || itemIndex">
        <td
          v-for="(column, columnIndex) in columns"
          :key="column.key"
          :align="column.align || 'center'"
          style="width: 200px"
        >
          <!-- 处理操作列 -->
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <template v-for="(action, actionIndex) in actions" :key="actionIndex">
                <el-button
                  v-if="!action.hide?.(item)"
                  :type="action.type || 'primary'"
                  :size="action.size || 'small'"
                  @click="handleAction(action, item)"
                  link
                >
                  {{ action.label }}
                </el-button>
              </template>
            </div>
          </template>
          <!-- 处理其他列 -->
          <template v-else>
            {{ column.render ? column.render(item) : item[column.key] }}
          </template>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="less" scoped>
.my-table {
  margin-top: 20px;
  width: 100%;

  table {
    width: 100%;
    border-collapse: collapse;
  }
  .table-header {
    height: 40px;
    color: var(--foreground);
    font-size: 15px;
    border-bottom: 1px solid var(--border);
  }
  .table-row {
    padding: 10px 0;
    min-height: 40px;
    color: var(--foreground);
    font-size: 14px;
    border-bottom: 1px solid var(--border);

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
  }
}
</style>
