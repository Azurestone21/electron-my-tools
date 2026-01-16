<!-- 工具 -->
<script setup>
const router = useRouter()

const jumpTo = (e) => {
  router.push(e)
}
</script>

<template>
  <div class="page">
    <div class="title">日程</div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/schedule')"
          >日程通知</el-card
        >
      </el-col>
    </el-row>
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
        <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/data')">数据转换</el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width: 100%" shadow="hover" @click="jumpTo('/tool/photoCompression')"
          >图片压缩</el-card
        >
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less" scoped>
.title {
  margin-top: 20px;
}
</style>
