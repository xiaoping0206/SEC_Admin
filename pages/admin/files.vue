<template>
  <view class="page">
    <u-navbar
      title="档案管理"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :auto-back="true"
      left-icon="arrow-left"
      bg-color="#ffffff"
    >
      <template #right>
        <view class="nav-search-hit" @tap.stop="goSearch">
          <u-icon name="search" size="18" color="#333333" />
        </view>
      </template>
    </u-navbar>

    <view class="tab-bar">
      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tabs__chip"
          :class="{ 'tabs__chip--on': activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          <text class="tabs__txt">{{ tab.label }}</text>
        </view>
      </view>
      <text class="manage-btn" @tap="toggleManageMode">
        {{ isManageMode ? '退出管理' : '管理' }}
      </text>
    </view>

    <scroll-view scroll-y class="list-scroll" :style="{ height: scrollHpx + 'px' }">
      <view class="pad">
        <template v-if="currentList.length === 0">
          <view class="empty-state">
            <text class="empty-emoji">
              📋
            </text>
            <text class="empty-text">
              {{
                activeTab === 'taker'
                  ? '暂无老人档案'
                  : activeTab === 'giver'
                    ? '暂无护工档案'
                    : '暂无组合档案'
              }}
            </text>
            <button class="btn-primary" plain="false" @tap="goTakerForm">
              新建老人档案
            </button>
            <button class="btn-outline-flat" plain="false" @tap="goGiverForm">
              新建护工档案
            </button>
          </view>
        </template>

        <template v-else>
          <!-- 老人 -->
          <template v-if="activeTab === 'taker'">
            <view
              v-for="item in takerList"
              :key="'t-' + item._id"
              class="row-card"
              @tap="goRowTap('taker', item)"
            >
              <view v-if="isManageMode" class="checkbox-hit" @tap.stop="toggleSelect(item._id)">
                <view
                  class="checkbox"
                  :style="checkboxRowStyle(item._id)"
                >
                  <text v-if="selectedIds.includes(item._id)" class="checkbox-tick">✓</text>
                </view>
              </view>
              <view class="row-card__avatar" />
              <view class="row-card__txt">
                <text class="row-card__title">{{ item.name }}</text>
                <text class="row-card__sub">{{ takerSubtitle(item) }}</text>
              </view>
            </view>
          </template>

          <!-- 护工 -->
          <template v-else-if="activeTab === 'giver'">
            <view
              v-for="item in giverList"
              :key="'g-' + item._id"
              class="row-card"
              @tap="goRowTap('giver', item)"
            >
              <view v-if="isManageMode" class="checkbox-hit" @tap.stop="toggleSelect(item._id)">
                <view class="checkbox" :style="checkboxRowStyle(item._id)">
                  <text v-if="selectedIds.includes(item._id)" class="checkbox-tick">✓</text>
                </view>
              </view>
              <view class="row-card__avatar" />
              <view class="row-card__txt">
                <text class="row-card__title">{{ item.name }}</text>
                <text class="row-card__sub">{{ giverSubtitle(item) }}</text>
              </view>
            </view>
          </template>

          <!-- 组合 -->
          <template v-else>
            <view
              v-for="row in comboRows"
              :key="'c-' + row.taker._id"
              class="row-card"
              @tap="goRowTap('combo', row.taker)"
            >
              <view
                v-if="isManageMode"
                class="checkbox-hit"
                @tap.stop="toggleSelect(row.taker._id)"
              >
                <view class="checkbox" :style="checkboxRowStyle(row.taker._id)">
                  <text v-if="selectedIds.includes(row.taker._id)" class="checkbox-tick">
                    ✓
                  </text>
                </view>
              </view>
              <view class="row-card__avatar" />
              <view class="row-card__txt">
                <text class="row-card__title">{{ row.taker.name }} · {{ row.giverName }}</text>
                <text class="row-card__sub">{{ comboSubtitle(row) }}</text>
              </view>
            </view>
          </template>
        </template>
      </view>
    </scroll-view>

    <view
      v-if="currentList.length > 0"
      class="footer"
      :style="{ paddingBottom: safeBottomPx + 'px' }"
    >
      <template v-if="isManageMode">
        <view class="bottom-bar-manage footer-inner footer-inner--manage">
          <view class="select-all" @tap="toggleSelectAll">
            <view class="checkbox" :style="isAllSelected ? chkOnStyle : chkOffStyle">
              <text v-if="isAllSelected" class="checkbox-tick">✓</text>
            </view>
            <text class="muted">全选</text>
          </view>
          <button
            class="btn btn--danger btn--del-manage"
            plain="false"
            :disabled="selectedIds.length === 0"
            @tap="handleBatchDelete"
          >
            删除({{ selectedIds.length }})
          </button>
        </view>
      </template>

      <template v-else>
        <view class="footer-inner footer-inner--normal">
          <button class="btn btn--outline" plain="false" @tap="onBatchImport">批量导入</button>
          <button class="btn btn--primary btn--grow" plain="false" @tap="goNewArchive">
            新建档案
          </button>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { saveArchiveLists } from '@/utils/archive-cache.js'
import { toastCloudError, parseCloudError } from '@/utils/cloud-error.js'
import { labelGender } from '@/utils/person-labels.js'

const chkOnStyle = {
  background: '#4a90e2',
  border: '2rpx solid #4a90e2',
  borderRadius: '50%',
  width: '40rpx',
  height: '40rpx',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box'
}

const chkOffStyle = {
  background: 'transparent',
  border: '2rpx solid #4a90e2',
  borderRadius: '50%',
  width: '40rpx',
  height: '40rpx',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box'
}

const statusBarInset = ref(0)
const navBarInnerPx = ref(44)
const scrollHpx = ref(400)
const safeBottomPx = ref(0)

const activeTab = ref('taker')
const isManageMode = ref(false)
const selectedIds = ref([])

function checkboxRowStyle(id) {
  const on = selectedIds.value.includes(id)
  return {
    ...(on ? chkOnStyle : chkOffStyle)
  }
}

const takerManager = uniCloud.importObject('taker-manager')
const giverManager = uniCloud.importObject('giver-manager')

const takerList = ref([])
const giverList = ref([])

const tabs = [
  { key: 'taker', label: '老人' },
  { key: 'giver', label: '护工' },
  { key: 'combo', label: '组合' }
]

const comboRows = computed(() =>
  takerList.value.filter((t) => t.is_matched).map((t) => ({
    taker: t,
    giverName: resolveMatchedGiverName(t, giverList.value)
  }))
)

function resolveMatchedGiverName(taker, givers) {
  if (taker.matched_giver_name && String(taker.matched_giver_name).trim()) {
    return String(taker.matched_giver_name).trim()
  }
  const gid = taker.matched_giver_id ?? taker.giver_id ?? taker.linked_giver_id
  if (!gid || !Array.isArray(givers)) return '—'
  const g = givers.find((x) => x._id === gid)
  return g?.name ?? '—'
}

const currentList = computed(() => {
  if (activeTab.value === 'taker') return takerList.value
  if (activeTab.value === 'giver') return giverList.value
  return comboRows.value.map((r) => ({ _id: r.taker._id }))
})

const currentIds = computed(() => currentList.value.map((i) => i._id))

const isAllSelected = computed(
  () =>
    selectedIds.value.length === currentList.value.length &&
    currentList.value.length > 0
)

function measureScroll() {
  const s = uni.getSystemInfoSync()
  statusBarInset.value = s.statusBarHeight || 20
  safeBottomPx.value = s.safeAreaInsets?.bottom || 0

  const navTotal = statusBarInset.value + navBarInnerPx.value
  const tabH = uni.upx2px(120)
  const hasFooterBar = currentList.value.length > 0
  const footerBlockPx = hasFooterBar ? uni.upx2px(232) + safeBottomPx.value : safeBottomPx.value
  scrollHpx.value = Math.max(200, s.windowHeight - navTotal - tabH - footerBlockPx)
}

function takerSubtitle(item) {
  const gn = resolveMatchedGiverName(item, giverList.value)
  const st = item.is_matched ? '已匹配' : '待匹配'
  return `${labelGender(item.gender)}，${item.age ?? '—'}岁，${st}，护工：${gn}`
}

function giverSubtitle(item) {
  return `${labelGender(item.gender)}，${item.age ?? '—'}岁，资质：${item.qualification || '—'}`
}

function comboSubtitle(row) {
  const ts = row.taker.match_total_score
  const g = row.taker.match_grade
  const sc = typeof ts === 'number' ? `${ts.toFixed(1)} 分` : '分数待同步'
  const gr = g || '等级待同步'
  return `${sc} · ${gr}`
}

function toggleManageMode() {
  isManageMode.value = !isManageMode.value
  selectedIds.value = []
}

function toggleSelect(id) {
  const ix = selectedIds.value.indexOf(id)
  if (ix === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(ix, 1)
}

function toggleSelectAll() {
  if (isAllSelected.value) selectedIds.value = []
  else selectedIds.value = [...currentIds.value]
}

function goSearch() {
  uni.navigateTo({ url: '/pages/admin/search' })
}

function goTakerForm() {
  uni.navigateTo({ url: '/pages/taker/form' })
}

function goGiverForm() {
  uni.navigateTo({ url: '/pages/giver/form' })
}

function goNewArchive() {
  uni.navigateTo({ url: '/pages/admin/new-archive' })
}

function onBatchImport() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function goRowTap(kind, item) {
  if (isManageMode.value) {
    toggleSelect(item._id)
    return
  }
  if (kind === 'giver') {
    uni.navigateTo({ url: `/pages/giver/detail?id=${item._id}` })
    return
  }
  uni.navigateTo({ url: `/pages/taker/detail?id=${item._id}` })
}

async function loadLists() {
  uni.showLoading({ title: '加载中', mask: true })
  try {
    const [takerRes, giverRes] = await Promise.all([
      takerManager.getTakerList({ page: 1, pageSize: 50 }),
      giverManager.getGiverList({ page: 1, pageSize: 50 })
    ])
    takerList.value = Array.isArray(takerRes?.data?.list)
      ? takerRes.data.list
      : Array.isArray(takerRes?.data)
        ? takerRes.data
        : []
    giverList.value = Array.isArray(giverRes?.data?.list)
      ? giverRes.data.list
      : Array.isArray(giverRes?.data)
        ? giverRes.data
        : []
    saveArchiveLists(takerList.value, giverList.value)
  } catch (e) {
    toastCloudError(e)
  } finally {
    uni.hideLoading()
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return

  const confirm = await new Promise((resolve) => {
    uni.showModal({
      title: '确认删除',
      content: `确认删除选中的 ${selectedIds.value.length} 条档案？`,
      success: (res) => resolve(res.confirm)
    })
  })
  if (!confirm) return

  uni.showLoading({ title: '删除中…', mask: true })
  try {
    if (activeTab.value === 'giver') {
      await Promise.all(
        selectedIds.value.map((sid) => giverManager.deleteGiver({ id: sid }))
      )
    } else {
      await Promise.all(
        selectedIds.value.map((sid) => takerManager.deleteTaker({ id: sid }))
      )
    }
    uni.showToast({ title: '删除成功', icon: 'success' })
    selectedIds.value = []
    isManageMode.value = false
    await loadLists()
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

onMounted(async () => {
  measureScroll()
  await loadLists()
})

watch(
  () => [currentList.value.length, activeTab.value],
  () => measureScroll()
)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.nav-search-hit {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background: #f5f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx 8rpx;
  gap: 16rpx;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
  gap: 16rpx;
}

.manage-btn {
  flex-shrink: 0;
  font-size: 28rpx;
  color: #4a90e2;
}

.tabs__chip {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;

  &--on {
    background: #4a90e2;
  }

  &:not(.tabs__chip--on) .tabs__txt {
    color: #666666;
  }
}

.tabs__txt {
  font-size: 26rpx;
  color: #ffffff;

  .tabs__chip:not(.tabs__chip--on) & {
    color: #666666;
  }
}

.list-scroll {
  width: 100%;
}

.pad {
  padding: 0 $page-padding-x 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx 80rpx;
  gap: 32rpx;
}

.empty-emoji {
  font-size: 80rpx;
  display: block;
  text-align: center;
  line-height: 1.2;
}

.empty-text {
  font-size: 28rpx;
  color: $color-text-secondary;
  text-align: center;
}

.btn-primary {
  width: 100%;
  margin: 0;
  padding: 0;
  height: 88rpx;
  line-height: 88rpx;
  background: #4a90e2;
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 44rpx;

  &::after {
    border: none;
  }
}

.btn-outline-flat {
  width: 100%;
  margin: 0;
  padding: 0;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  color: #4a90e2;
  background: transparent;
  border-radius: 44rpx;
  border: 2rpx solid #4a90e2;

  &::after {
    border: none;
  }
}

.row-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  min-height: 176rpx;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
}

.checkbox-hit {
  margin-right: 16rpx;
  flex-shrink: 0;
}

.checkbox-tick {
  font-size: 22rpx;
  color: #ffffff;
  line-height: 1;
}

.cb {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border-width: 2rpx;
  border-style: solid;
  border-color: #cfcfcf;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb--on {
  background: #4a90e2;
  border-color: #4a90e2;
}

.row-card__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #e8e8e8;
  flex-shrink: 0;
}

.row-card__txt {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.row-card__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.row-card__sub {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666666;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 232rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.footer-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
  gap: 24rpx;
}

.bottom-bar-manage {
  width: 100%;
  justify-content: space-between !important;
}

.select-all {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.muted {
  font-size: 28rpx;
  color: #666666;
}

.btn {
  padding: 0 24rpx;
  margin: 0;
  border: none;

  &::after {
    border: none;
  }
}

.footer-inner--normal {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.footer-inner--manage {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.btn--outline {
  flex-shrink: 0;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  background: #ffffff;
  border: 2rpx solid #cccccc;
  border-radius: 44rpx;
  color: #333333;
}

.btn--primary {
  background: #4a90e2;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  color: #ffffff;
}

.btn--grow {
  flex: 1;
}

.btn--del-manage {
  flex: 1;
  margin-left: 24rpx;
  max-width: 360rpx;
  height: 88rpx;
  line-height: 88rpx;
  flex-shrink: 1;
}

.btn--danger {
  background: #ff3b30;
  border-radius: 44rpx;
  color: #ffffff;
}
</style>
