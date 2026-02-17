import { ref } from 'vue'
import { IScheduleItem } from '@share/types/schedule'
import { useToolStore } from '@renderer/store/modules/tool'
import { storeToRefs } from 'pinia'
import {
  initMainProcessSchedules,
  addMainProcessSchedules,
  updateMainProcessSchedules,
  deleteMainProcessSchedules
} from '@renderer/api/schedule'
import { cloneDeep } from 'lodash'

export default function useSchedule() {
  const toolStore = useToolStore()
  const { scheduleList } = storeToRefs(toolStore)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const initSchedules = async () => {
    loading.value = true
    error.value = null
    try {
      await initMainProcessSchedules(cloneDeep(scheduleList.value))
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化日程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addSchedule = async (schedule: IScheduleItem) => {
    loading.value = true
    error.value = null
    try {
      toolStore.addSchedule(schedule)
      await addMainProcessSchedules(schedule)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加日程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSchedule = async (schedule: IScheduleItem) => {
    loading.value = true
    error.value = null
    try {
      toolStore.editSchedule(schedule)
      await updateMainProcessSchedules(schedule)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新日程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSchedule = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      toolStore.deleteSchedule(id)
      await deleteMainProcessSchedules(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除日程失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    initSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule
  }
}
