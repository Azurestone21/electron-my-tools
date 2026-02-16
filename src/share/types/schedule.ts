export interface ITimeData {
  time: string | null | Date
}
export interface IScheduleItem {
  id: string
  name: string
  frequency: string
  // type: string
  week: string[]
  timeData: ITimeData[]
  message: string
}
