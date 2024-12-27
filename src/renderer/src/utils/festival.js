import calendar from '@renderer/utils/calendar-converter.js'

// 是否节假日
export function isFestival(slotData) {
  let solarDayArr = slotData.day.split('-')
  let lunarDay = calendar.solar2lunar(solarDayArr[0], solarDayArr[1], solarDayArr[2])

  // 公历节日\农历节日\农历节气
  let festAndTerm = []
  festAndTerm.push(lunarDay.festival == null ? '' : ' ' + lunarDay.festival)
  festAndTerm.push(lunarDay.lunarFestival == null ? '' : '' + lunarDay.lunarFestival)
  // festAndTerm.push(lunarDay.Term == null ? '' : '' + lunarDay.Term)

  return festAndTerm.join('') != ''
}
// 公历转农历
export function solarToLunar(slotData) {
  let solarDayArr = slotData.day.split('-')
  let lunarDay = calendar.solar2lunar(solarDayArr[0], solarDayArr[1], solarDayArr[2])

  // 农历日期
  let lunarMD = ''
  if (lunarDay.IDayCn == '初一') {
    lunarMD = lunarDay.IMonthCn
  } else {
    lunarMD = lunarDay.IDayCn
  }

  // 公历节日\农历节日\农历节气
  let festAndTerm = []
  festAndTerm.push(lunarDay.festival == null ? '' : ' ' + lunarDay.festival)
  festAndTerm.push(lunarDay.lunarFestival == null ? '' : ' ' + lunarDay.lunarFestival)
  festAndTerm.push(lunarDay.Term == null ? '' : ' ' + lunarDay.Term)

  return festAndTerm.join('') == '' ? lunarMD : festAndTerm.join('')
}
