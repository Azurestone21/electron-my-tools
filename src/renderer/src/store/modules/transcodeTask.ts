import { ETranscodeStatus, ITranscodeTask } from '@share/types/transcodeTask'
import { defineStore } from 'pinia'

export const useTranscodeTaskStore = defineStore('transcodeTask', {
  state: () => ({
    tasks: {} as Record<string, ITranscodeTask>
  }),

  getters: {
    getTask: (state) => (taskId: string) => {
      return state.tasks[taskId]
    },
    getTaskByInputPath: (state) => (inputPath: string) => {
      return Object.values(state.tasks).find((task) => task.inputPath === inputPath)
    },
    getAllTasks: (state) => {
      return Object.values(state.tasks)
    }
  },

  actions: {
    addTask(task: ITranscodeTask) {
      this.tasks[task.taskId] = task
    },
    updateTask(taskId: string, updates: Partial<ITranscodeTask>) {
      const task = this.tasks[taskId]
      if (task) {
        Object.assign(task, updates)
        this.tasks[taskId] = task
      }
    },
    removeTask(taskId: string) {
      delete this.tasks[taskId]
    },
    clearCompletedTasks() {
      const toRemove: string[] = []
      Object.entries(this.tasks).forEach(([taskId, task]) => {
        if (
          task.status === ETranscodeStatus.Completed ||
          task.status === ETranscodeStatus.Failed ||
          task.status === ETranscodeStatus.Cancelled
        ) {
          toRemove.push(taskId)
        }
      })
      toRemove.forEach((taskId) => delete this.tasks[taskId])
    },
    clearAllTasks() {
      this.tasks = {}
    }
  },
  persist: true
})
