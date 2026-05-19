<template>
  <view class="page">
    <!-- Figma 3588:8203 导航栏 -->
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
        <text class="nav__ttl ff-yuan">规则管理</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ paddingTop: navOuterPx + 'px' }"
      :show-scrollbar="false"
    >
      <view class="form">
        <!-- Figma 3588:8188 -->
        <text class="lab ff-yuan"><text class="req">*</text>导入规则表</text>

        <!-- Figma 3588:8195 -->
        <view class="import-box" @tap="pickFile">
          <template v-if="!selectedFile">
            <text class="import-box__hint ff-yuan">点击导入Excel文件</text>
          </template>
          <template v-else>
            <text class="import-box__name ff-yuan">{{ selectedFile.name }}</text>
            <text class="import-box__meta ff-yuan">{{ fileSizeKb }} KB</text>
          </template>
        </view>

        <!-- Figma 3588:8189 -->
        <text class="lab lab--version ff-yuan"><text class="req">*</text>版本号</text>

        <!-- Figma 3588:8194 -->
        <input
          v-model="versionNo"
          class="inp ff-yuan"
          type="text"
          placeholder="V1.0"
          placeholder-class="inp-ph"
          maxlength="32"
        />

        <!-- Figma 3588:8190 -->
        <view class="switch-row">
          <view class="switch-row__txt">
            <text class="lab lab--plain ff-yuan">版本覆盖</text>
            <text class="switch-hint ff-yuan">开启后先删除该version下全部规则在写入</text>
          </view>
          <switch
            :checked="overwrite"
            color="#9245f9"
            class="switch-ctrl"
            @change="onOverwriteChange"
          />
        </view>

        <view class="link" @tap="goVersionList">
          <text class="link__txt ff-yuan">查看历史版本</text>
          <view class="link__chev" aria-hidden="true" />
        </view>
      </view>
    </scroll-view>

    <!-- Figma 3588:8198 底部渐变 + 3588:8201 确认导入 -->
    <view class="foot">
      <view class="foot__fade" />
      <button
        class="foot__btn ff-yuan"
        :class="{ 'foot__btn--off': submitDisabled }"
        :disabled="submitDisabled"
        @tap="confirmImport"
      >
        {{ phase === 'upload' ? '导入中...' : '确认导入' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { parseMatchRulesWorkbook } from '@/utils/match-rules-xlsx'
import { useRulesStore } from '@/store/rules.js'

const rulesStore = useRulesStore()

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)

const selectedFile = ref(null)
const versionNo = ref('')
const overwrite = ref(false)
/** idle | parse | upload */
const phase = ref('idle')
/** @type {import('vue').Ref<ReturnType<typeof parseMatchRulesWorkbook> | null>} */
const parsedBundle = ref(null)

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

onMounted(() => {
  layoutNav()
})

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function goBack() {
  uni.navigateBack()
}

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

function extractVersionFromFileName(fileName) {
  if (!fileName) return ''
  const base = String(fileName).replace(/\.xlsx$/i, '')
  const verMatch = base.match(/ver\s+[\d.]+/i)
  if (verMatch) return verMatch[0]
  const vMatch = base.match(/[_\s-](v[\d.]+)$/i)
  if (vMatch) return vMatch[1]
  return ''
}

function applyVersionFromFileName(fileName) {
  const extracted = extractVersionFromFileName(fileName)
  if (extracted) versionNo.value = extracted
}

async function parseSelectedFile(file) {
  parsedBundle.value = null
  phase.value = 'parse'
  try {
    const base64Data = await readFileBase64(file.path)
    const wb = XLSX.read(base64Data, { type: 'base64' })
    const parsed = parseMatchRulesWorkbook(wb)
    parsedBundle.value = parsed
    applyVersionFromFileName(file.name)
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

    rulesStore.invalidate()

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

/* Figma 3588:8187 — 375×812，1px = 2rpx */
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf6ff 0%, #eadaff 100%);
  box-sizing: border-box;
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: #faf6ff;
}

.nav__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__back {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__back-ico {
  width: 24rpx;
  height: 48rpx;
}

.nav__ttl {
  font-size: 34rpx;
  font-weight: 600;
  color: rgba(49, 35, 58, 0.9);
  line-height: normal;
}

.scroll {
  height: 100vh;
  box-sizing: border-box;
}

.form {
  padding: 24rpx 44rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.lab {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #6c5c76;
  line-height: 1.2;
  margin-bottom: 16rpx;
}

.lab--version {
  margin-top: 8rpx;
}

.lab--plain {
  margin-bottom: 8rpx;
}

.req {
  color: #e32525;
}

.import-box {
  width: 100%;
  height: 280rpx;
  box-sizing: border-box;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  border: 2rpx dashed #9245f9;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx 24rpx;
}

.import-box__hint {
  font-size: 26rpx;
  font-weight: 600;
  color: #31233a;
  line-height: 1.3;
  text-align: center;
}

.import-box__name {
  font-size: 26rpx;
  font-weight: 600;
  color: #9245f9;
  text-align: center;
  word-break: break-all;
  margin-bottom: 12rpx;
}

.import-box__meta {
  font-size: 24rpx;
  font-weight: 500;
  color: #8d7a99;
}

.inp {
  width: 100%;
  height: 82rpx;
  line-height: 82rpx;
  box-sizing: border-box;
  padding: 0 40rpx;
  margin-bottom: 32rpx;
  border-radius: 100rpx;
  background: #ffffff;
  font-size: 26rpx;
  font-weight: 600;
  color: #31233a;
}

.inp-ph {
  color: #8d7a99;
  font-weight: 600;
}

.switch-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.switch-row__txt {
  flex: 1;
  min-width: 0;
}

.switch-hint {
  display: block;
  font-size: 20rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: 1.4;
}

.switch-ctrl {
  transform: scale(0.92);
  flex-shrink: 0;
}

.link {
  margin-top: 8rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.link__txt {
  font-size: 26rpx;
  font-weight: 500;
  color: #9245f9;
}

.link__chev {
  width: 12rpx;
  height: 12rpx;
  border-top: 2rpx solid #9245f9;
  border-right: 2rpx solid #9245f9;
  transform: rotate(45deg);
  box-sizing: border-box;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  padding: 0 60rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.foot__fade {
  position: absolute;
  left: 0;
  right: 0;
  top: -80rpx;
  height: 80rpx;
  background: linear-gradient(
    180deg,
    rgba(240, 232, 251, 0) 0%,
    #f0e8fb 23.45%,
    #f0e8fb 100%
  );
  pointer-events: none;
}

.foot__btn {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
}

.foot__btn--off {
  opacity: 0.55;
}

.foot__btn::after {
  border: none;
}
</style>
