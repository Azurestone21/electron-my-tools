import { spawn } from 'child_process'

export enum ETranscodeStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

export interface ITranscodeTask {
  taskId: string
  inputPath: string
  outputPath: string
  progress: number
  status: ETranscodeStatus
  process?: ReturnType<typeof spawn>
  error?: string
  startTime?: number
  endTime?: number
}

export interface ITranscodeProgress {
  taskId: string
  inputPath: string
  outputPath: string
  progress: number
  status: ETranscodeStatus
  error?: string
}
