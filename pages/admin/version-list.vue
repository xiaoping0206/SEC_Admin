<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
        <text class="nav__ttl ff-yuan">版本管理</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ paddingTop: navOuterPx + 'px' }"
      :show-scrollbar="false"
    >
      <view v-if="loading" class="state-wrap">
        <text class="state-txt ff-yuan">加载中...</text>
      </view>

      <view v-else-if="versions.length === 0" class="state-wrap">
        <text class="state-txt ff-yuan">尚未上传任何规则版本</text>
        <text class="state-hint ff-yuan">点击下方按钮导入 Excel 规则表</text>
      </view>

      <view v-else class="list">
        <VersionSwipeRow
          v-for="item in versions"
          :key="item._id"
          :disabled="item.is_active"
          :action-width-px="deleteActionPx"
          :opened="openedId === item._id"
          :reset-signal="swipeResetSignal"
          @interact="onSwipeInteract(item._id)"
          @open="onSwipeOpen(item._id)"
          @close="onSwipeClose(item._id)"
          @delete="confirmDelete(item)"
        >
          <view class="card">
            <view class="card-head">
              <text class="card-ver ff-yuan">{{ item.version }}</text>
              <view
                class="tag ff-yuan"
                :class="item.is_active ? 'tag-on' : 'tag-off'"
              >
                {{ item.statusText }}
              </view>
            </view>

            <text class="meta ff-yuan">上传时间：{{ item.uploadDateText }}</text>
            <text v-if="item.file_name" class="meta ff-yuan">文件：{{ item.file_name }}</text>
            <text class="meta ff-yuan">规则条数：{{ item.ruleCount }}</text>

            <view class="card-foot">
              <button
                class="btn-act ff-yuan"
                :class="{ 'btn-act--off': item.is_active }"
                :disabled="item.is_active"
                @tap.stop="onActivateTap(item)"
              >
                激活
              </button>
            </view>
          </view>
        </VersionSwipeRow>
      </view>
    </scroll-view>

    <view class="foot">
      <view class="foot__fade" />
      <button class="foot__btn ff-yuan" @tap="goUpload">
        上传新版本
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/format'
import { useRulesStore } from '@/store/rules.js'
import VersionSwipeRow from '@/components/admin/VersionSwipeRow.vue'

const rulesStore = useRulesStore()

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)
const deleteActionPx = ref(70)
const openedId = ref('')
const swipeResetSignal = ref(0)

const loading = ref(true)
const versions = ref([])

onMounted(() => {
  layoutNav()
  deleteActionPx.value = uni.upx2px(140)
})

onShow(() => {
  loadVersions()
})

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function totalRuleCount(doc) {
  const r = doc.rules || {}
  const keys = ['wuxing', 'sixiang', 'mbti_dimension', 'mbti_modifier', 'env_items', 'env_score']
  return keys.reduce((sum, k) => {
    const arr = r[k]
    return sum + (Array.isArray(arr) ? arr.length : 0)
  }, 0)
}

function extractVersionList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  return []
}

function mapVersionRow(doc) {
  return {
    ...doc,
    statusText: doc.is_active ? '当前使用' : '未激活',
    uploadDateText: formatDate(doc.upload_date),
    ruleCount: totalRuleCount(doc)
  }
}

function parseCloudError(err) {
  const raw = err?.message ?? ''
  try {
    const j = JSON.parse(raw)
    if (j.msg) return j.msg
    if (j.code === -1002) return '当前使用中的版本不可删除'
  } catch (_) {
    /* ignore */
  }
  return raw || '操作失败'
}

async function loadVersions() {
  loading.value = true
  openedId.value = ''
  try {
    const uploadRules = uniCloud.importObject('upload-matching-rules')
    const res = await uploadRules.getRuleVersionList()
    versions.value = extractVersionList(res).map(mapVersionRow)
  } catch (err) {
    versions.value = []
    uni.showToast({ title: parseCloudError(err), icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goUpload() {
  uni.navigateTo({ url: '/pages/admin/upload-rules' })
}

function onSwipeInteract(id) {
  if (openedId.value && openedId.value !== id) {
    openedId.value = ''
  }
  swipeResetSignal.value += 1
}

function onSwipeOpen(id) {
  openedId.value = id
}

function onSwipeClose(id) {
  if (openedId.value === id) openedId.value = ''
}

function confirmDelete(row) {
  uni.showModal({
    title: '确认删除',
    content: `确定删除版本「${row.version}」？删除后不可恢复。`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        const uploadRules = uniCloud.importObject('upload-matching-rules')
        await uploadRules.deleteVersion({ id: row._id })
        rulesStore.invalidate()
        uni.showToast({ title: '已删除', icon: 'success' })
        await loadVersions()
      } catch (err) {
        uni.showToast({ title: parseCloudError(err), icon: 'none' })
      }
    }
  })
}

function onActivateTap(row) {
  if (row.is_active) return
  uni.showModal({
    title: '确认激活',
    content: `将规则版本「${row.version}」设为当前使用？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        const uploadRules = uniCloud.importObject('upload-matching-rules')
        await uploadRules.activateVersion({ id: row._id })
        rulesStore.invalidate()
        await rulesStore.fetchActiveEnvTags({ force: true })
        uni.showToast({ title: '已激活', icon: 'success' })
        await loadVersions()
      } catch (err) {
        uni.showToast({ title: parseCloudError(err), icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

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

.state-wrap {
  padding: 120rpx 44rpx calc(220rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.state-txt {
  font-size: 28rpx;
  font-weight: 600;
  color: #6c5c76;
  text-align: center;
}

.state-hint {
  font-size: 24rpx;
  font-weight: 500;
  color: #8d7a99;
  text-align: center;
}

.list {
  padding: 24rpx 44rpx calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.card {
  width: 100%;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.card-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.card-ver {
  flex: 1;
  min-width: 0;
  font-size: 32rpx;
  font-weight: 700;
  color: #31233a;
  word-break: break-all;
}

.tag {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.tag-on {
  background: rgba(146, 69, 249, 0.12);
  color: #9245f9;
}

.tag-off {
  background: #f5f0fa;
  color: #8d7a99;
}

.meta {
  display: block;
  font-size: 24rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: 1.5;
  margin-bottom: 8rpx;
  word-break: break-all;
}

.card-foot {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
}

.btn-act {
  min-width: 160rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 40rpx;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
}

.btn-act--off,
.btn-act[disabled] {
  background: #e8dff5;
  color: #b5a8c4;
}

.btn-act::after {
  border: none;
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

.foot__btn::after {
  border: none;
}
</style>
