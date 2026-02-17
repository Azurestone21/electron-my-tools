<!-- 日程通知 -->
<script setup lang="ts">
const toolStore = useToolStore()
const { scheduleList } = storeToRefs(toolStore)
const { deleteSchedule } = useSchedule()

import moment from 'moment'
import _ from 'lodash'

import { options } from './components/UpdateSchedule/config'

// 设置日程表单组件
const updateScheduleRef = ref<any>()
import UpdateSchedule from './components/UpdateSchedule/index.vue'

const getWeekLabel = (week: string[]) => {
  return week.map((w) => options.find((o) => o.value === w)?.label).join('、')
}

// 新增
const onOpenDrawer = () => {
  updateScheduleRef?.value?.open()
}
// 编辑
const onEdit = (row, index) => {
  updateScheduleRef?.value?.setFormData(row)
  updateScheduleRef?.value?.open()
}
// 删除
const onDelete = (row, index) => {
  deleteSchedule(row.id)
}
</script>

<template>
  <div class="page">
    <el-button type="primary" size="default" @click="onOpenDrawer">新增</el-button>
    <el-button type="" size="default" @click="">导入</el-button>

    <el-table :data="scheduleList" style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="日程名称" width="160" />
      <el-table-column prop="date" label="触发时间">
        <template #default="scope">
          <span>{{ scope.row.frequency == '1' ? '每' : '' }}</span>
          <span>{{ getWeekLabel(scope.row.week) + '的' }}</span>
          <span v-for="(item, index) in scope.row.timeData" :key="index">
            {{ moment(item.time).format('HH:mm:ss')
            }}{{ index != scope.row.timeData.length - 1 ? '/' : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="160">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="onEdit(scope.row, scope.$index)">
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="onDelete(scope.row, scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <UpdateSchedule ref="updateScheduleRef" />
  </div>
</template>

<style lang="less" scoped>
.page {
  padding: 20px;
}
</style>
