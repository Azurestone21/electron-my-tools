<!-- 首页 -->
<script setup lang="ts">
import Calendar from '@renderer/components/Calendar.vue';
const indexStore = useIndexStore()
const { remark } = storeToRefs(indexStore)
</script>

<template>
  <div class="page home flex">
    <div class="remark">
      <div class="">
        <div class="title">小记</div>
      </div>
      <textarea
        type="text"
        placeholder=""
        class="remark_input hide-scrollbar"
        v-model="remark"
      ></textarea>
    </div>
    <div class="calendar">
      <calendar />
    </div>
  </div>
</template>

<style lang="less" scoped>
.remark {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  background-color: var(--card);
  margin-right: 10px;

  .title {
    color: var(--foreground);
  }

  /* 备注文本框 */
  .remark_input {
    width: 100%;
    height: calc(100% - 50px);
    padding: 10px;
    border-radius: 8px;
    outline: none;
    resize: none;
    overflow: auto;
    border: 1px dashed var(--border);
    background: transparent;
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground);
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
</style>
