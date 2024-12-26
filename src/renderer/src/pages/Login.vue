<!-- 登录页 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import _ from 'lodash'
import { ElMessage } from 'element-plus';

const isRegister = ref(false) // 是否注册

const defaultFromData = {
  username: '',
  password: '',
  repassword: ''
}
interface RuleformInterface {
  username: string
  password: string
  repassword?: string
}

const registerFormRef = ref()
const loginFormRef = ref()
const formData = ref<RuleformInterface>(_.cloneDeep(defaultFromData))
// 表单校验
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 10, message: '用户名必须是4-10位的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6-15位的非空字符',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6-15的非空字符',
      trigger: 'blur'
    },
    {
      validator: (_rule, value, callback) => {
        if (value !== formData.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
watch(isRegister, () => {
  formData.value = defaultFromData
})
// 注册
const register = async () => {
  await registerFormRef.value.validate()
  isRegister.value = false
  ElMessage.success('注册成功')
}
// 登录
const login = async () => {
  await loginFormRef.value.validate()
  // loginRequest(formData.value)
  window.myHandle.login(true)
  router.push('/layout')
}
</script>

<template>
  <div class="page drag">
    <el-row>
      <el-col :span="12">
        <div class="left"></div>
      </el-col>
      <el-col :span="12" class="right">
        <el-form
          ref="registerFormRef"
          :model="formData"
          :rules="rules"
          size="large"
          autocomplete="off"
          class="form no_drag"
          v-if="isRegister"
        >
          <el-form-item>
            <h1>注册</h1>
          </el-form-item>
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
            ></el-input>
          </el-form-item>
          <el-form-item prop="repassword">
            <el-input
              v-model="formData.repassword"
              type="password"
              placeholder="请输入再次密码"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="button" type="primary" auto-insert-space @click="register">
              注册
            </el-button>
          </el-form-item>
          <el-form-item class="flex">
            <el-link type="info" :underline="false" @click="isRegister = false"> ← 返回 </el-link>
          </el-form-item>
        </el-form>
        <el-form
          ref="loginFormRef"
          :model="formData"
          :rules="rules"
          size="large"
          autocomplete="off"
          class="form no_drag"
          v-else
        >
          <el-form-item>
            <h1>登录</h1>
          </el-form-item>
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
            ></el-input>
          </el-form-item>
          <div class="remember">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
          <el-form-item>
            <el-button class="button" type="primary" auto-insert-space @click="login"
              >登录</el-button
            >
          </el-form-item>
          <el-form-item class="flex">
            <el-link type="info" :underline="false" @click="isRegister = true"> 注册 → </el-link>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less" scoped>
.el-row {
  height: 100%;
}
.left {
  width: 100%;
  height: 100%;
  background-color: rgb(13, 31, 56);
}
.right {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .form {
    width: 400px;
    background-color: #fff;
    padding: 0 24px;
    border-radius: 8px;
  }
  .title {
    margin: 0 auto;
  }

  .remember {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
