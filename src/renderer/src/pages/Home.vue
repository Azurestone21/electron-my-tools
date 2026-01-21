<!-- 首页 -->
<script setup lang="ts">
import { isFestival, solarToLunar } from '@renderer/utils/festival.js'
const indexStore = useIndexStore()
const { remark } = storeToRefs(indexStore)
</script>

<template>
  <div class="page home flex-between">
    <div class="remark">
      <div class="flex-row-between-center">
        <div class="title">小记</div>
      </div>
      <textarea type="text" placeholder="" class="remark_input" v-model="remark"></textarea>
    </div>
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
</template>

<style lang="less" scoped>
.icon_delete {
  margin-left: 5px;
}
.remark {
  background-color: rgb(240, 249, 255);
  flex: 1;
  padding: 0 10px;

  /* 备注文本框 */
  .remark_input {
    width: 100%;
    height: 100%;
    max-height: 90%;
    padding: 10px;
    border-radius: 8px;
    outline: none;
    resize: none;
    overflow: auto;
    border: 1px dashed rgb(240, 249, 255);
    background: transparent;
    font-size: 16px;
    font-weight: 600;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  /* 获得焦点时 */
  .remark_input:focus {
    border: 1px dashed #ccc;
  }
  /* 占位符（输入文本前的文本显示） */
  .remark_input::placeholder {
    color: #a6a6a6;
  }
}

// 日历
.calendar {
  width: 460px;
  height: 400px;
  :deep(.el-calendar) {
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
