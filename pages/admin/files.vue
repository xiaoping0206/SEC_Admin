<template>
  <view class="page">
    <!-- Figma 3588:9167 导航栏 -->
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
        <text class="nav__ttl ff-yuan">档案管理</text>
        <view class="nav__search" @tap="goSearch">
          <u-icon name="search" size="16" color="#666666" />
        </view>
      </view>
    </view>

    <!-- Figma 3588:9164 空状态 -->
    <view
      v-if="!loading && isAllEmpty"
      class="empty"
      :style="{ paddingTop: navOuterPx + 'px' }"
    >
      <view class="empty__body">
        <image
          class="empty__illus"
          src="/static/figma/files/empty_state.png"
          mode="aspectFit"
        />
        <text class="empty__txt ff-yuan">还没有建立档案</text>
        <button class="empty__btn ff-yuan" @tap="goTakerForm">新建老人</button>
        <button class="empty__btn ff-yuan" @tap="goGiverForm">新建护工</button>
      </view>
    </view>

    <!-- 有档案：列表 -->
    <template v-else-if="!loading">
      <view class="tab-bar" :style="{ paddingTop: navOuterPx + 'px' }">
        <view class="tabs">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tabs__chip"
            :class="{ 'tabs__chip--on': activeTab === tab.key }"
            @tap="activeTab = tab.key"
          >
            <text class="tabs__txt ff-yuan">{{ tab.label }}</text>
          </view>
        </view>
        <text class="manage-btn ff-yuan" @tap="toggleManageMode">
          {{ isManageMode ? '退出管理' : '管理' }}
        </text>
      </view>

      <scroll-view scroll-y class="list-scroll" :style="{ height: scrollHpx + 'px' }">
        <view class="pad">
          <template v-if="currentList.length === 0">
            <view class="tab-empty">
              <text class="tab-empty__txt ff-yuan">
                {{
                  activeTab === 'taker'
                    ? '暂无老人档案'
                    : activeTab === 'giver'
                      ? '暂无护工档案'
                      : '暂无组合档案'
                }}
              </text>
            </view>
          </template>

          <template v-else>
            <view
              v-for="(row, idx) in displayRows"
              :key="row.key"
              class="row-card"
              @tap="goRowTap(row.kind, row.item)"
            >
              <view
                v-if="isManageMode"
                class="checkbox-hit"
                @tap.stop="toggleSelect(row.id)"
              >
                <view class="checkbox" :style="checkboxRowStyle(row.id)">
                  <text v-if="selectedIds.includes(row.id)" class="checkbox-tick">✓</text>
                </view>
              </view>
              <image
                class="row-card__avatar"
                :src="row.avatarSrc"
                mode="aspectFill"
              />
              <view class="row-card__txt">
                <text class="row-card__title ff-yuan">{{ row.title }}</text>
                <text class="row-card__sub ff-yuan">{{ row.subtitle }}</text>
              </view>
            </view>
          </template>
        </view>
      </scroll-view>

      <view
        v-if="!isAllEmpty"
        class="foot"
        :style="{ paddingBottom: safeBottomPx + 'px' }"
      >
        <view class="foot__fade" />
        <template v-if="isManageMode">
          <view class="foot__bar foot__bar--manage">
            <view class="select-all" @tap="toggleSelectAll">
              <view class="checkbox" :style="isAllSelected ? chkOnStyle : chkOffStyle">
                <text v-if="isAllSelected" class="checkbox-tick">✓</text>
              </view>
              <text class="muted ff-yuan">全选</text>
            </view>
            <button
              class="foot__btn foot__btn--danger ff-yuan"
              plain="false"
              :disabled="selectedIds.length === 0"
              @tap="handleBatchDelete"
            >
              删除({{ selectedIds.length }})
            </button>
          </view>
        </template>

        <template v-else>
          <view class="foot__bar">
            <button class="foot__btn foot__btn--outline ff-yuan" plain="false" @tap="onBatchImport">
              批量导入
            </button>
            <button class="foot__btn foot__btn--primary ff-yuan" plain="false" @tap="goNewArchive">
              新建文档
            </button>
          </view>
        </template>
      </view>
    </template>

    <view v-else class="loading-wrap" :style="{ paddingTop: navOuterPx + 'px' }">
      <text class="loading-txt ff-yuan">加载中...</text>
    </view>

    <!-- Figma 6842:8056 / 6842:8057 确认删除 -->
    <view v-if="showDeleteConfirm" class="dlg-mask" @tap="closeDeleteConfirm">
      <view class="dlg" @tap.stop>
        <text class="dlg__ttl ff-yuan">确认删除</text>
        <view class="dlg__hline" />
        <view class="dlg__actions">
          <view class="dlg__action" @tap="closeDeleteConfirm">
            <text class="dlg__cancel ff-yuan">取消</text>
          </view>
          <view class="dlg__vline" />
          <view class="dlg__action" @tap="confirmBatchDelete">
            <text class="dlg__ok ff-yuan">确认</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { saveArchiveLists } from '@/utils/archive-cache.js'
import { toastCloudError, parseCloudError } from '@/utils/cloud-error.js'
import { labelGender } from '@/utils/person-labels.js'

const AVATAR_SAMPLES = [
  '/static/figma/files/avatar_sample_1.png',
  '/static/figma/files/avatar_sample_2.png',
  '/static/figma/files/avatar_sample_3.png'
]

const chkOnStyle = {
  background: '#9245f9',
  border: '2rpx solid #9245f9',
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
  border: '2rpx solid #9245f9',
  borderRadius: '50%',
  width: '40rpx',
  height: '40rpx',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box'
}

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)
const scrollHpx = ref(400)
const safeBottomPx = ref(0)
const loading = ref(true)

const activeTab = ref('taker')
const isManageMode = ref(false)
const selectedIds = ref([])
const showDeleteConfirm = ref(false)

function checkboxRowStyle(id) {
  const on = selectedIds.value.includes(id)
  return on ? chkOnStyle : chkOffStyle
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

const isAllEmpty = computed(
  () => takerList.value.length === 0 && giverList.value.length === 0
)

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

const displayRows = computed(() => {
  if (activeTab.value === 'taker') {
    return takerList.value.map((item, idx) => ({
      key: `t-${item._id}`,
      kind: 'taker',
      id: item._id,
      item,
      title: item.name,
      subtitle: takerSubtitle(item),
      avatarSrc: pickAvatarSrc(item, idx)
    }))
  }
  if (activeTab.value === 'giver') {
    return giverList.value.map((item, idx) => ({
      key: `g-${item._id}`,
      kind: 'giver',
      id: item._id,
      item,
      title: item.name,
      subtitle: giverSubtitle(item),
      avatarSrc: pickAvatarSrc(item, idx)
    }))
  }
  return comboRows.value.map((row, idx) => ({
    key: `c-${row.taker._id}`,
    kind: 'combo',
    id: row.taker._id,
    item: row.taker,
    title: `${row.taker.name} · ${row.giverName}`,
    subtitle: comboSubtitle(row),
    avatarSrc: pickAvatarSrc(row.taker, idx)
  }))
})

function pickAvatarSrc(item, index) {
  const custom = item?.avatar || item?.photo_url || item?.avatar_url
  if (custom && String(custom).trim()) return String(custom).trim()
  return AVATAR_SAMPLES[index % AVATAR_SAMPLES.length]
}

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
  safeBottomPx.value = s.safeAreaInsets?.bottom || 0
}

function measureScroll() {
  const s = uni.getSystemInfoSync()
  const tabH = uni.upx2px(88)
  const hasFooterBar = !isAllEmpty.value
  const footerBlockPx = hasFooterBar ? uni.upx2px(232) + safeBottomPx.value : safeBottomPx.value
  scrollHpx.value = Math.max(
    200,
    s.windowHeight - navOuterPx.value - tabH - footerBlockPx
  )
}

function resolveMatchedGiverName(taker, givers) {
  if (taker.matched_giver_name && String(taker.matched_giver_name).trim()) {
    return String(taker.matched_giver_name).trim()
  }
  const gid = taker.matched_giver_id ?? taker.giver_id ?? taker.linked_giver_id
  if (!gid || !Array.isArray(givers)) return '—'
  const g = givers.find((x) => x._id === gid)
  return g?.name ?? '—'
}

function takerSubtitle(item) {
  const gn = resolveMatchedGiverName(item, giverList.value)
  const st = item.is_matched ? '有效' : '待匹配'
  const base = `${labelGender(item.gender)}，${item.age ?? '—'}岁，${st}`
  if (gn && gn !== '—') return `${base}，${gn}`
  return base
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

function goBack() {
  uni.navigateBack()
}

function goSearch() {
  uni.navigateTo({ url: '/pages/admin/search' })
}

function goTakerForm() {
  uni.navigateTo({ url: '/pages/taker/form?from=files' })
}

function goGiverForm() {
  uni.navigateTo({ url: '/pages/giver/form?from=files' })
}

function goNewArchive() {
  if (activeTab.value === 'taker') {
    uni.navigateTo({ url: '/pages/taker/form?from=files' })
    return
  }
  if (activeTab.value === 'giver') {
    uni.navigateTo({ url: '/pages/giver/form?from=files' })
    return
  }
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
  loading.value = true
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
    loading.value = false
    measureScroll()
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
}

async function confirmBatchDelete() {
  if (selectedIds.value.length === 0) {
    closeDeleteConfirm()
    return
  }
  closeDeleteConfirm()

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

onMounted(() => {
  layoutNav()
})

onShow(() => {
  loadLists()
})

watch(
  () => [isAllEmpty.value, activeTab.value, loading.value],
  () => {
    if (!loading.value && !isAllEmpty.value) measureScroll()
  }
)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* Figma 3588:9178 — 375×812，1px = 2rpx */
.page {
  min-height: 100vh;
  background: #f0e8fb;
  box-sizing: border-box;
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: #f0e8fb;
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

.nav__search {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  border-radius: 40rpx;
  background: #f8f8f8;
  border: 1rpx solid #e4e4e4;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.empty {
  min-height: 100vh;
  box-sizing: border-box;
}

.empty__body {
  min-height: calc(100vh - 200rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 44rpx 80rpx;
  box-sizing: border-box;
}

.empty__illus {
  width: 178rpx;
  height: 178rpx;
  margin-bottom: 32rpx;
}

.empty__txt {
  font-size: 26rpx;
  font-weight: 500;
  color: #31233a;
  margin-bottom: 80rpx;
  text-align: center;
}

.empty__btn {
  width: 280rpx;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0 0 24rpx;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
}

.empty__btn::after {
  border: none;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-txt {
  font-size: 28rpx;
  color: #8d7a99;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx 28rpx;
  gap: 24rpx;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  gap: 20rpx;
}

.manage-btn {
  flex-shrink: 0;
  margin-left: 8rpx;
  padding-left: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #8d7a99;
}

.tabs__chip {
  padding: 10rpx 28rpx;
  border-radius: 100rpx;
  background: #ffffff;

  &--on {
    background: #9245f9;
  }
}

.tabs__txt {
  font-size: 26rpx;
  font-weight: 500;
  color: #8d7a99;

  .tabs__chip--on & {
    font-weight: 700;
    color: #ffffff;
  }
}

.list-scroll {
  width: 100%;
}

.pad {
  padding: 16rpx 40rpx calc(240rpx + env(safe-area-inset-bottom));
}

.tab-empty {
  padding: 120rpx 48rpx;
  display: flex;
  justify-content: center;
}

.tab-empty__txt {
  font-size: 28rpx;
  color: #8d7a99;
  text-align: center;
}

.row-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ffffff;
  border-radius: 32rpx;
  min-height: 144rpx;
  margin-bottom: 40rpx;
  padding: 24rpx 28rpx;
  box-sizing: border-box;
}

.row-card:last-child {
  margin-bottom: 0;
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

.row-card__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #e8dff5;
  flex-shrink: 0;
}

.row-card__txt {
  margin-left: 24rpx;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.row-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #31233a;
}

.row-card__sub {
  font-size: 22rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: 1.4;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  padding: 0 40rpx calc(48rpx + env(safe-area-inset-bottom));
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

.foot__bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
}

.foot__bar--manage {
  justify-content: space-between;
}

.foot__btn {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.foot__btn::after {
  border: none;
}

.foot__btn--outline {
  background: #fbf9ff;
  border: 2rpx solid #766680;
  color: #31233a;
}

.foot__btn--primary {
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
}

.foot__btn--danger {
  max-width: 360rpx;
  color: #ffffff;
  background: #e32525;
}

/* Figma 6842:8056 / 6842:8057 */
.dlg-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.12);
}

.dlg {
  width: 508rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.dlg__ttl {
  display: block;
  padding: 48rpx 32rpx 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #31233a;
  text-align: center;
  line-height: 1.4;
}

.dlg__hline {
  height: 1rpx;
  background: #e8dff5;
}

.dlg__actions {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 88rpx;
}

.dlg__action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  box-sizing: border-box;
}

.dlg__vline {
  width: 1rpx;
  background: #e8dff5;
  flex-shrink: 0;
}

.dlg__cancel {
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
}

.dlg__ok {
  font-size: 28rpx;
  font-weight: 500;
  color: #e32525;
}

.select-all {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.muted {
  font-size: 28rpx;
  color: #8d7a99;
}
</style>
