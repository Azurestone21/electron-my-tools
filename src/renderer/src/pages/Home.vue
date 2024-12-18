<!-- 首页 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import request from '@renderer/utils/request'
import moment from 'moment'
import calendar from '@renderer/utils/calendar-converter.js'

// 是否节假日
function isFestival(slotData) {
  let solarDayArr = slotData.day.split('-')
  let lunarDay = calendar.solar2lunar(solarDayArr[0], solarDayArr[1], solarDayArr[2])

  // 公历节日\农历节日\农历节气
  let festAndTerm = []
  festAndTerm.push(lunarDay.festival == null ? '' : ' ' + lunarDay.festival)
  festAndTerm.push(lunarDay.lunarFestival == null ? '' : '' + lunarDay.lunarFestival)
  // festAndTerm.push(lunarDay.Term == null ? '' : '' + lunarDay.Term)
  festAndTerm = festAndTerm.join('')

  return festAndTerm != ''
}
// 公历转农历
function solarToLunar(slotData) {
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
  festAndTerm = festAndTerm.join('')

  return festAndTerm == '' ? lunarMD : festAndTerm
}
const value = ref(new Date())

const articlesList = ref([])
const getArticlesList = async () => {
  try {
    let { status, data } = await request({
      url: 'article/list',
      method: 'get',
      data: {
        pageNum: 1,
        pageSize: 10
      }
    })
    if (status == 1) {
      data.list = data.list?.map((x) => {
        return {
          ...x,
          create_time: moment(x.create_time).format('YYYY-MM-DD')
        }
      })
      console.log('data.list', data.list)

      articlesList.value = data.list
    }
  } catch (error) {
    console.log('error:', error)
  }
}

const jumpTo = (e) => {
  router.push(e)
}
onMounted(() => {
  // getArticlesList()
})
</script>

<template>
  <div class="container drag">
    <div class="no_drag">
      <div class="flex-between">
        <div></div>
        <div class="calendar">
          <el-calendar>
            <template #date-cell="{ data }">
              <div>
                <div class="solar">{{ data.day.split('-')[2] }}</div>
                <div class="lunar" :class="{ festival: isFestival(data) }">
                  {{ solarToLunar(data) }}
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>

      <div class="title">实用工具</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/music')"
            >音乐解码</el-card
          >
        </el-col>
        <el-col :span="6">
          <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/color')"
            >颜色转换</el-card
          >
        </el-col>
        <el-col :span="6">
          <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/data')"
            >数据转换</el-card
          >
        </el-col>
        <el-col :span="6">
          <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/photoCompression')"
            >图片压缩</el-card
          >
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
.calendar {
  width: 460px;
  height: 400px;

  /deep/ .el-calendar {
    width: 100%;
    height: 100%;
    font-size: 12px;
    .next {
      border: none;
    }
    td {
      border: none;
    }
    .el-calendar-day {
      height: 46px !important;
      text-align: center;
      border: none;
    }
    .el-calendar__header {
      justify-content: space-between;
    }
    .is-selected {
      background-color: #1d8dd8;
      color: #fff;
    }
    // 本月农历节日设置颜色
    .lunar.festival {
      color: #adadeb;
    }
  }
}
</style>
