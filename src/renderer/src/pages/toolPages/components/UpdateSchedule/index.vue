<!-- 日程通知 -->
<script setup lang="ts">
const emit = defineEmits(['submitCb'])

import { ref, reactive } from 'vue'
const toolStore = useToolStore()
import type { FormInstance, FormRules } from 'element-plus'
import { IScheduleItem } from '@renderer/types/schedule'
import { options } from './config'
import { addMainProcessSchedules, updateMainProcessSchedules } from '@renderer/hooks/schedules/schedules'
import { cloneDeep } from 'lodash'

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
let formData = reactive<IScheduleItem>({ ...defaultFormData })
const formLabelWidth = '100px'

const validateTimeData = (rule: any, value: any, callback: any) => {
  value.map((t) => {
    if (!t.time) {
      callback(new Error('请设置时间'))
      return
    }
  })
  callback()
}
// 校验规则
const rules = reactive<FormRules<IScheduleItem>>({
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
  message: [
    { required: false, message: '请输入消息', trigger: 'blur' },
    { min: 1, max: 100, message: '字符长度限制1~100', trigger: 'blur' }
  ]
})
// 添加时间
const addTime = () => {
  formData.timeData.push({ time: null })
}
// 删除时间
const deleteTime = (index) => {
  formData.timeData.splice(index, 1)
  formRef.value.validate() // 重新校验
}
// 提交
const onSubmit = async () => {
  if (!formRef) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const data = cloneDeep(formData)
      if (!data.id) {
        data.id = new Date().getTime().toString()
        toolStore.addSchedule(data)
        addMainProcessSchedules(data)
      } else {
        toolStore.editSchedule(data)
        updateMainProcessSchedules(data)
      }
      onClose()
    }
  })
}

const open = ref<boolean>(false)
// 打开抽屉
const onOpen = () => {
  open.value = true
}
// 关闭抽屉
const onClose = () => {
  if (!formRef) return
  open.value = false
  formData = reactive({ ...defaultFormData })
  formRef.value.resetFields()
}

defineExpose({
  open: onOpen,
  setFormData: (data: IScheduleItem) => {
    formData = reactive({ ...defaultFormData, ...data })
  }
})
</script>

<template>
  <div>
    <el-drawer
      :modelValue="open"
      :show-close="false"
      :size="'60%'"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #header>
        <div class="text-[#222222] font-bold">{{ formData.id ? '编辑' : '新增' }}日程</div>
      </template>
      <template #default>
        <div>
          <el-form ref="formRef" :model="formData" :rules="rules" :label-width="formLabelWidth">
            <el-form-item prop="name" label="日程名称：">
              <el-input v-model="formData.name" autocomplete="off" style="width: 220px" />
            </el-form-item>
            <el-form-item prop="frequency" label="触发频率：">
              <el-radio-group v-model="formData.frequency">
                <el-radio value="1">重复</el-radio>
                <el-radio value="2">一次</el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- <el-form-item label="触发方式：">
              <el-radio-group v-model="formData.type">
                <el-radio value="1">星期</el-radio>
                <el-radio value="2">日期</el-radio>
              </el-radio-group>
            </el-form-item> -->
            <el-form-item prop="week" label="触发星期：">
              <el-checkbox-group v-model="formData.week">
                <el-checkbox-button
                  v-for="option in options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item prop="timeData" label="触发时间：">
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
            <el-form-item label="">
              <el-button type="primary" size="small" @click="addTime">添加时间</el-button>
            </el-form-item>
            <el-form-item prop="message" label="日程消息：">
              <el-input v-model="formData.message" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" @click="onSubmit()">提交</el-button>
        <el-button @click="onClose()">取消</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.time-wrapper {
  width: 100%;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
