<!-- 日程通知 -->
<script setup lang="ts">
const toolStore = useToolStore()
const { scheduleList } = storeToRefs(toolStore)
import moment from 'moment'
import _ from 'lodash'
import type { FormInstance, FormRules } from 'element-plus'

interface ITimeData {
  time: string
}
interface IRuleForm {
  id: string
  name: string
  frequency: string
  // type: string
  week: string[]
  timeData: ITimeData[]
  message: string
}
const defaultFormData = {
  id: '',
  name: '',
  frequency: '1',
  // type: '1',
  week: [],
  timeData: [{ time: null }],
  message: ''
}
const formRef = ref<FormInstance>()
let formData = reactive<IRuleForm>({ ...defaultFormData })
const formLabelWidth = '100px'
const options = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const validateTimeData = (rule: any, value: any, callback: any) => {
  value.map((t) => {
    if (!t.time) {
      callback(new Error('请设置时间'))
      return
    }
  })
  callback()
}
const rules = reactive<FormRules<IRuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 20, message: '字符长度限制2~20', trigger: 'blur' }
  ],
  frequency: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  // type: [
  //   {
  //     required: true,
  //     message: '请选择',
  //     trigger: 'change'
  //   }
  // ],
  week: [
    {
      type: 'array',
      required: true,
      message: '请选择至少一项',
      trigger: 'change'
    }
  ],
  timeData: [{ validator: validateTimeData, trigger: 'change' }],
  name: [
    { required: true, message: '请输入消息', trigger: 'blur' },
    { min: 1, max: 100, message: '字符长度限制1~100', trigger: 'blur' }
  ]
})
const addTime = () => {
  formData.timeData.push({ time: null })
}
const deleteTime = (index) => {
  formData.timeData.splice(index, 1)
  formRef.value.validate() // 重新校验
}
const onSubmit = async () => {
  if (!formRef) return
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      if (!formData.id) {
        formData.id = new Date().getTime().toString()
        toolStore.addSchedule(formData)
      } else {
        toolStore.editSchedule(formData)
      }
      onCloseDrawer()
    }
  })
}

const open = ref<boolean>(false)
const onOpenDrawer = () => {
  open.value = true
}
const onCloseDrawer = () => {
  if (!formRef) return
  open.value = false
  formRef.value.resetFields()
}
const onEdit = (row, index) => {
  formData = reactive(_.cloneDeep(row))
  onOpenDrawer()
}
const onDelete = (row, index) => {
  toolStore.deleteSchedule(index)
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
          <span>{{ scope.row.week?.join('、') + '的' }}</span>
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

    <el-drawer
      :modelValue="open"
      :show-close="false"
      :size="'50%'"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #header>
        <div>{{ formData.id ? '编辑' : '新增' }}日程</div>
      </template>
      <template #default>
        <div>
          <el-form ref="formRef" :model="formData" :rules="rules">
            <el-form-item prop="name" label="日程名称：" :label-width="formLabelWidth">
              <el-input v-model="formData.name" autocomplete="off" style="width: 220px" />
            </el-form-item>
            <el-form-item prop="frequency" label="触发频率：" :label-width="formLabelWidth">
              <el-radio-group v-model="formData.frequency">
                <el-radio value="1">重复</el-radio>
                <el-radio value="2">一次</el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- <el-form-item label="触发方式：" :label-width="formLabelWidth">
              <el-radio-group v-model="formData.type">
                <el-radio value="1">星期</el-radio>
                <el-radio value="2">日期</el-radio>
              </el-radio-group>
            </el-form-item> -->
            <el-form-item prop="week" label="触发星期：" :label-width="formLabelWidth">
              <el-checkbox-group v-model="formData.week">
                <el-checkbox-button v-for="option in options" :key="option" :value="option">
                  {{ option }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item prop="timeData" label="触发时间：" :label-width="formLabelWidth">
              <div v-for="(item, index) in formData.timeData" :key="index" class="time-wrapper">
                <el-time-picker v-model="item.time" placeholder="" />
                <el-button
                  size="small"
                  circle
                  class="ml-[20px]"
                  v-if="formData.timeData.length != 1"
                  @click="deleteTime(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="" :label-width="formLabelWidth">
              <el-button type="primary" size="small" @click="addTime">添加时间</el-button>
            </el-form-item>
            <el-form-item prop="message" label="日程消息：" :label-width="formLabelWidth">
              <el-input v-model="formData.message" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" @click="onSubmit()">提交</el-button>
        <el-button @click="onCloseDrawer()">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.page {
  padding: 20px;
}
.time-wrapper {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
