<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 农历数据（1900-2100年）
const lunarInfo = ref([
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0,
  0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0,
  0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50,
  0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0,
  0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0,
  0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260,
  0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558,
  0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
  0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5,
  0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954,
  0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3,
  0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2,
  0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
])

// 农历月份名称
const lunarMonth = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '腊月'
]
// 农历日期名称
const lunarDay = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十'
]

// 农历传统节日（key：农历月-日，value：节日名）
const lunarHolidays = ref({
  '01-01': '春节',
  '01-15': '元宵节',
  '05-05': '端午节',
  '07-07': '七夕节',
  '08-15': '中秋节',
  '09-09': '重阳节',
  '12-08': '腊八节',
  '12-23': '小年'
})

// 公历节日（key：公历月-日，value：节日名）
const solarHolidays = ref({
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '11-01': '万圣节',
  '12-24': '平安夜',
  '12-25': '圣诞节'
})

// 响应式数据
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const dateList = ref([])

// 获取农历日期（返回农历月、日、节日）
const getLunarInfo = (year, month, day) => {
  let i,
    leap = 0,
    temp = 0
  const baseYear = 1900,
    baseMonth = 1,
    baseDay = 31
  let offset =
    (Date.UTC(year, month - 1, day) - Date.UTC(baseYear, baseMonth - 1, baseDay)) / 86400000

  // 计算农历年
  for (i = 1900; i < 2100 && offset > 0; i++) {
    temp = lYearDays(i)
    offset -= temp
  }
  if (offset < 0) {
    offset += temp
    i--
  }
  const lunarYear = i
  leap = leapMonth(lunarYear)
  let isLeap = false

  // 计算农历月
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      i--
      isLeap = true
      temp = leapDays(lunarYear)
    } else {
      temp = monthDays(lunarYear, i)
    }
    if (isLeap && i === leap + 1) isLeap = false
    offset -= temp
  }
  if (offset < 0) {
    offset += temp
    i--
  }
  const lunarMonthIndex = i - 1
  const lunarDayIndex = offset

  // 格式化农历月日（补0，用于匹配节日）
  const lunarMonthStr = String(lunarMonthIndex + 1).padStart(2, '0')
  const lunarDayStr = String(lunarDayIndex + 1).padStart(2, '0')
  const lunarHolidayKey = `${lunarMonthStr}-${lunarDayStr}`

  return {
    lunarMonthName: lunarMonth[lunarMonthIndex], // 农历月名（正月、腊月等）
    lunarDayName: lunarDay[lunarDayIndex], // 农历日名（初一、十五等）
    lunarMonth: lunarMonthIndex + 1, // 农历月数字（1-12）
    lunarDay: lunarDayIndex + 1, // 农历日数字（1-30）
    holiday: lunarHolidays.value[lunarHolidayKey] || '' // 匹配到的农历节日
  }
}

// 农历年的总天数
const lYearDays = (y) => {
  let i,
    sum = 348
  for (i = 0x8000; i > 0x8; i >>= 1) sum += lunarInfo.value[y - 1900] & i ? 1 : 0
  return sum + leapDays(y)
}

// 闰月的天数
const leapDays = (y) => {
  if (leapMonth(y)) return lunarInfo.value[y - 1900] & 0x10000 ? 30 : 29
  else return 0
}

// 闰月月份
const leapMonth = (y) => {
  return lunarInfo.value[y - 1900] & 0xf
}

// 农历月的天数
const monthDays = (y, m) => {
  return lunarInfo.value[y - 1900] & (0x10000 >> m) ? 30 : 29
}

// 渲染日历
const renderCalendar = () => {
  dateList.value = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const firstDayWeek = firstDay.getDay()
  const monthDaysCount = lastDay.getDate()
  const today = new Date()

  // 添加上个月日期（不变）
  for (let i = 0; i < firstDayWeek; i++) {
    const prevDay = new Date(currentYear.value, currentMonth.value - 1, -i)
    dateList.value.push({
      day: prevDay.getDate(),
      isOtherMonth: true,
      isToday: false,
      isWeekend: false,
      lunarDay: '',
      holiday: ''
    })
  }

  // 添加当月日期（核心：匹配双节日）
  for (let i = 1; i <= monthDaysCount; i++) {
    const currentDay = new Date(currentYear.value, currentMonth.value - 1, i)
    const week = currentDay.getDay()
    // 1. 获取农历信息（含农历节日）
    const lunar = getLunarInfo(currentYear.value, currentMonth.value, i)
    // 2. 匹配公历节日
    const solarMonthStr = String(currentMonth.value).padStart(2, '0')
    const solarDayStr = String(i).padStart(2, '0')
    const solarHoliday = solarHolidays.value[`${solarMonthStr}-${solarDayStr}`] || ''
    // 3. 节日优先级：农历节日 > 公历节日
    const finalHoliday = lunar.holiday || solarHoliday

    dateList.value.push({
      month: currentMonth.value,
      day: i,
      isOtherMonth: false,
      isToday:
        currentDay.getFullYear() === today.getFullYear() &&
        currentDay.getMonth() === today.getMonth() &&
        currentDay.getDate() === today.getDate(),
      isWeekend: week === 0 || week === 6,
      lunarMonth: lunar.lunarMonthName, // 显示农历月名
      lunarDay: lunar.lunarDayName, // 显示农历日名
      holiday: finalHoliday // 最终显示的节日
    })
  }

  // 添加下个月日期（不变）
  const totalCells = firstDayWeek + monthDaysCount
  const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  for (let i = 1; i <= nextMonthDays; i++) {
    dateList.value.push({
      day: i,
      isOtherMonth: true,
      isToday: false,
      isWeekend: false,
      lunarDay: '',
      holiday: ''
    })
  }
}

// 上个月
const prevMonth = () => {
  currentMonth.value--
  if (currentMonth.value < 1) {
    currentMonth.value = 12
    currentYear.value--
  }
  renderCalendar()
}

// 下个月
const nextMonth = () => {
  currentMonth.value++
  if (currentMonth.value > 12) {
    currentMonth.value = 1
    currentYear.value++
  }
  renderCalendar()
}

// 本月
const curMonth = () => {
  currentMonth.value = new Date().getMonth() + 1
  currentYear.value = new Date().getFullYear()
  renderCalendar()
}

// 初始化
onMounted(() => {
  renderCalendar()
})
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div id="currentDate">{{ currentYear }}年{{ String(currentMonth).padStart(2, '0') }}月</div>
      <div>
        <el-button link @click="prevMonth">&lt;</el-button>
        <el-button link @click="curMonth">今</el-button>
        <el-button link @click="nextMonth">&gt;</el-button>
      </div>
    </div>
    <div class="week-list">
      <div class="week-item">日</div>
      <div class="week-item">一</div>
      <div class="week-item">二</div>
      <div class="week-item">三</div>
      <div class="week-item">四</div>
      <div class="week-item">五</div>
      <div class="week-item">六</div>
    </div>
    <div class="date-list">
      <div
        v-for="(item, index) in dateList"
        :key="index"
        class="date-item"
        :class="{
          'other-month': item.isOtherMonth,
          today: item.isToday,
          weekend: item.isWeekend
        }"
      >
        <span class="day">{{ item.day }}</span>
        <span v-if="item.holiday" class="holiday">{{ item.holiday }}</span>
        <span v-else-if="!item.isOtherMonth" class="lunar">{{
          item.lunarDay == '初一' ? item.lunarMonth : item.lunarDay
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.calendar {
  background-color: var(--card);
  border-radius: 10px;
  width: 100%;
  height: auto;
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  div {
    color: var(--foreground);
    font-size: 16px;
  }
}

.week-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.week-item {
  text-align: center;
  padding: 10px;
  font-weight: bold;
  color: var(--foreground);
  border-radius: 5px;
}

.date-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px 5px;
}

.date-item {
  min-width: 50px;
  padding: 2px 0;
  border-radius: 5px;
  color: var(--foreground);
  text-align: center;

  cursor: pointer;
  transition: background-color 0.3s;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;

  &:hover {
    background-color: var(--primary);
    color: var(--primary-foreground);
  }

  .lunar {
    font-size: 12px;
  }

  .holiday {
    font-size: 12px;
    color: #f56c6c;
  }
}

.today {
  background-color: var(--primary);
  color: var(--primary-foreground) !important;
}

.other-month {
  color: #e6e6e6;
  &:hover {
    background-color: transparent;
    color: #e6e6e6;
  }
}

.weekend {
  color: var(--primary);
}
</style>
