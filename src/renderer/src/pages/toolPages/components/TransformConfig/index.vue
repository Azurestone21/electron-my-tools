<!-- 转化配置 -->
<script setup lang="ts">
import MyDialog from '@components/MyDialog.vue'
import { useTranscodeConfigStore } from '@renderer/store/modules/transcodeConfig'
import {
  supportedVideoCodecs,
  supportedPresets,
  supportedAudioCodecs,
  supportedAudioBitrates,
  supportedOutputFormats
} from '@share/config/transcodeConfig'
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onCancel'])

const transcodeConfigStore = useTranscodeConfigStore()
const config = computed(() => transcodeConfigStore.config)

const cancelClick = () => {
  emits('onCancel')
}

const resetToDefault = () => {
  transcodeConfigStore.resetToDefault()
}
</script>

<template>
  <MyDialog :open="open" @onCancel="cancelClick" title="转化配置">
    <div class="config-content">
      <el-tabs type="border-card">
        <!-- 视频设置 -->
        <el-tab-pane label="视频设置">
          <el-form label-width="120px">
            <el-form-item label="视频编码器">
              <el-select v-model="config.video.codec" class="w-full">
                <el-option
                  v-for="codec in supportedVideoCodecs"
                  :key="codec.value"
                  :label="codec.label"
                  :value="codec.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="编码预设">
              <el-select v-model="config.video.preset" class="w-full">
                <el-option
                  v-for="preset in supportedPresets"
                  :key="preset.value"
                  :label="preset.label"
                  :value="preset.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="画质(CRF)">
              <el-slider
                v-model="config.video.crf"
                :min="0"
                :max="51"
                :step="1"
                show-input
              />
              <div class="slider-desc">0=无损，23=默认，51=最低质量</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 音频设置 -->
        <el-tab-pane label="音频设置">
          <el-form label-width="120px">
            <el-form-item label="音频编码器">
              <el-select v-model="config.audio.codec" class="w-full">
                <el-option
                  v-for="codec in supportedAudioCodecs"
                  :key="codec.value"
                  :label="codec.label"
                  :value="codec.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="音频比特率">
              <el-select v-model="config.audio.bitrate" class="w-full">
                <el-option
                  v-for="bitrate in supportedAudioBitrates"
                  :key="bitrate.value"
                  :label="bitrate.label"
                  :value="bitrate.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 输出设置 -->
        <el-tab-pane label="输出设置">
          <el-form label-width="120px">
            <el-form-item label="输出格式">
              <el-select v-model="config.output.format" class="w-full">
                <el-option
                  v-for="format in supportedOutputFormats"
                  :key="format.value"
                  :label="format.label"
                  :value="format.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="快速启动">
              <el-switch v-model="config.output.fastStart" />
              <div class="switch-desc">适用于网络播放</div>
            </el-form-item>

            <el-form-item label="覆盖现有文件">
              <el-switch v-model="config.output.overwrite" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="footer-actions">
        <el-button @click="resetToDefault">恢复默认</el-button>
      </div>
    </div>
  </MyDialog>
</template>

<style lang="less" scoped>
div {
  user-select: none;
}
.config-content {
  padding: 20px;
  height: 500px;
  overflow-y: auto;
}

.slider-desc,
.switch-desc {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
