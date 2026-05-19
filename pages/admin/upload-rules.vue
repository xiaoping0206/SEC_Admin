<template>
  <view class="page">
    <text class="sec-tit">导入规则表</text>

    <view class="import-box" @tap="pickFile">
      <template v-if="!selectedFile">
        <text class="import-box__hint">点击导入Excel文件</text>
      </template>
      <template v-else>
        <text class="import-box__name">{{ selectedFile.name }}</text>
        <text class="import-box__meta">{{ fileSizeKb }} KB</text>
      </template>
    </view>

    <text v-if="previewLine" class="preview">{{ previewLine }}</text>

    <view class="field">
      <text class="field-lab"><text class="req">*</text>版本号</text>
      <input
        class="field-inp"
        v-model="versionNo"
        type="text"
        placeholder="V1.0"
        maxlength="32"
      />
    </view>

    <view class="switch-row">
      <view class="switch-row__txt">
        <text class="field-lab">版本覆盖</text>
        <text class="switch-hint">开启后先删除该version下全部规则再写入</text>
      </view>
      <switch :checked="overwrite" color="#4A90D9" @change="onOverwriteChange" />
    </view>

    <view class="foot-spacer" />

    <view class="foot">
      <button class="btn" :disabled="submitDisabled" @tap="confirmImport">
        {{ phase === 'upload' ? '导入中...' : '确认导入' }}
      </button>
      <view class="link" @tap="goVersionList">
        <text class="link__txt">查看历史版本 &gt;</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { parseMatchRulesWorkbook } from '@/utils/match-rules-xlsx'

const selectedFile = ref(null)
const versionNo = ref('')
const overwrite = ref(false)
/** idle | parse | upload */
const phase = ref('idle')
/** @type {import('vue').Ref<ReturnType<typeof parseMatchRulesWorkbook> | null>} */
const parsedBundle = ref(null)
const previewLine = ref('')

const fileSizeKb = computed(() => {
  const f = selectedFile.value
  if (!f || f.size == null) return '0'
  return (f.size / 1024).toFixed(1)
})

const submitDisabled = computed(() => {
  if (!selectedFile.value || !String(versionNo.value).trim()) return true
  if (!parsedBundle.value) return true
  if (phase.value === 'parse' || phase.value === 'upload') return true
  return false
})

function onOverwriteChange(e) {
  overwrite.value = !!e.detail.value
}

function readFileBase64(filePath) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success(r) {
        resolve(r.data)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function parseCloudErr(err) {
  const raw = err?.message ?? ''
  try {
    const j = JSON.parse(raw)
    return { code: j.code ?? null, msg: j.msg || raw || '操作失败' }
  } catch {
    return { code: null, msg: raw || '操作失败' }
  }
}

function buildPreviewText(parsed) {
  const r = parsed.rules
  const mbtiN =
    (r.mbti_dimension?.length || 0) + (r.mbti_modifier?.length || 0)
  const envN = (r.env_items?.length || 0) + (r.env_score?.length || 0)
  return `已解析：五行${r.wuxing?.length || 0}条 / 四象${r.sixiang?.length || 0}条 / MBTI${mbtiN}条 / 环境${envN}条`
}

async function parseSelectedFile(file) {
  previewLine.value = ''
  parsedBundle.value = null
  phase.value = 'parse'
  try {
    const base64Data = await readFileBase64(file.path)
    const wb = XLSX.read(base64Data, { type: 'base64' })
    const parsed = parseMatchRulesWorkbook(wb)
    parsedBundle.value = parsed
    previewLine.value = buildPreviewText(parsed)
  } catch {
    uni.showToast({ title: 'Excel解析失败', icon: 'none' })
  } finally {
    phase.value = 'idle'
  }
}

function pickFile() {
  if (phase.value === 'parse' || phase.value === 'upload') return
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.xlsx'],
    success(res) {
      const f = res.tempFiles && res.tempFiles[0]
      if (!f) return
      selectedFile.value = f
      parseSelectedFile(f)
    }
  })
}

function goVersionList() {
  uni.navigateTo({ url: '/pages/admin/version-list' })
}

async function confirmImport() {
  if (submitDisabled.value) return
  const v = String(versionNo.value).trim()
  if (!parsedBundle.value) {
    uni.showToast({ title: '请先成功解析Excel', icon: 'none' })
    return
  }

  phase.value = 'upload'
  try {
    const p = parsedBundle.value
    const rulesManager = uniCloud.importObject('upload-matching-rules')
    await rulesManager.uploadRules({
      version: v,
      overwrite: overwrite.value,
      rules: p.rules,
      weights: p.weights,
      mbti_config: p.mbti_config,
      env_config: p.env_config,
      file_name: selectedFile.value?.name || ''
    })

    uni.showToast({
      title: `版本${v}导入成功`,
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/admin/version-list' })
    }, 500)
  } catch (err) {
    const { code, msg } = parseCloudErr(err)
    if (code === -1003) {
      uni.showToast({
        title: '版本已存在，请开启版本覆盖后重试',
        icon: 'none'
      })
    } else {
      uni.showToast({ title: msg, icon: 'none' })
    }
  } finally {
    phase.value = 'idle'
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40rpx 40rpx 280rpx;
  box-sizing: border-box;
}

.sec-tit {
  display: block;
  margin-left: 10rpx;
  margin-bottom: 24rpx;
  font-size: 60rpx;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.import-box {
  width: 100%;
  height: 276rpx;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: $radius-lg;
  margin-bottom: 28rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
}

.import-box__hint {
  font-size: $font-size-base;
  color: #8c9199;
}

.import-box__name {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-primary;
  text-align: center;
  word-break: break-all;
  margin-bottom: 12rpx;
}

.import-box__meta {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.preview {
  display: block;
  font-size: $font-size-sm;
  color: #34c759;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.field {
  margin-bottom: 48rpx;
}

.field-lab {
  display: block;
  font-size: $font-size-sm;
  color: #1a1a2e;
  margin-bottom: 16rpx;
}

.req {
  color: $color-error;
}

.field-inp {
  width: 100%;
  height: 76rpx;
  line-height: 76rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #ffffff;
  font-size: $font-size-base;
  color: #1a1a2e;
}

.switch-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.switch-row__txt {
  flex: 1;
  min-width: 0;
}

.switch-hint {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
  line-height: 1.5;
}

.foot-spacer {
  height: 32rpx;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 68rpx calc(28rpx + env(safe-area-inset-bottom));
  background: #f5f7fa;
  box-sizing: border-box;
}

.btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: $font-weight-medium;
  color: #ffffff;
  background: $color-primary;

  &[disabled] {
    opacity: 0.65;
    color: #ffffff;
    background: $color-primary;
  }
}

.link {
  margin-top: 28rpx;
  text-align: center;
}

.link__txt {
  font-size: $font-size-sm;
  color: $color-primary;
}
</style>
