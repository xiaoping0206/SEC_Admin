<template>
  <view class="page">
    <view class="brand">SECare</view>

    <view class="decor">
      <view class="dot dot--1" />
      <view class="dot dot--2" />
      <view class="dot dot--3" />
      <view class="dot dot--4" />
      <view class="dot dot--5" />
      <view class="dot dot--6" />
      <text class="star star--1">★</text>
      <text class="star star--2">★</text>
      <text class="star star--3">★</text>
      <text class="star star--4">★</text>

      <view class="rings">
        <view class="rings__c rings__c--1" />
        <view class="rings__c rings__c--2" />
        <view class="rings__c rings__c--3" />
        <view class="rings__c rings__c--4" />
        <view class="rings__c rings__c--5" />
      </view>
    </view>

    <view class="btns">
      <view class="btns__half btns__half--outline" @tap="openMulti">
        <text class="btns__tit">多人匹配</text>
      </view>
      <view class="btns__half btns__half--gray" @tap="openSingle">
        <text class="btns__tit">单人匹配</text>
      </view>
    </view>

    <view v-if="maskVisible" class="mask" @tap="closePanels" />
    <view v-if="showMultiPanel" class="panel" @tap.stop>
      <view class="panel__bar" />
      <text class="panel__ttl">多人匹配</text>
      <view class="panel__line" />
      <text class="panel__lab"><text class="req">*</text>选择老人</text>
      <view class="panel__field" @tap="goSelectTaker('multi')">
        <text :class="['panel__ph', takerName ? 'panel__ph--on' : '']">{{ takerName || '请选择' }}</text>
        <u-icon name="arrow-right" color="#BFBFBF" size="28" />
      </view>
      <button class="panel__btn" @tap="submitMulti">开始匹配</button>
    </view>

    <view v-if="showSinglePanel" class="panel" @tap.stop>
      <view class="panel__bar" />
      <text class="panel__ttl">单人匹配</text>
      <view class="panel__line" />
      <text class="panel__lab"><text class="req">*</text>选择老人</text>
      <view class="panel__field" @tap="goSelectTaker('single')">
        <text :class="['panel__ph', takerName ? 'panel__ph--on' : '']">{{ takerName || '请选择' }}</text>
        <u-icon name="arrow-right" color="#BFBFBF" size="28" />
      </view>
      <text class="panel__lab panel__lab--mt"><text class="req">*</text>选择护理员</text>
      <view class="panel__field" @tap="goSelectGiver">
        <text :class="['panel__ph', giverName ? 'panel__ph--on' : '']">{{ giverName || '请选择' }}</text>
        <u-icon name="arrow-right" color="#BFBFBF" size="28" />
      </view>
      <button class="panel__btn" @tap="submitSingle">开始匹配</button>
    </view>

    <AppCustomTabBar v-if="!maskVisible" active="matching" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { onShow } from '@dcloudio/uni-app'
import { useMatchingStore } from '@/store/matching'
import AppCustomTabBar from '@/components/common/AppCustomTabBar.vue'

const matchingStore = useMatchingStore()
const { selectedTaker, selectedGiver } = storeToRefs(matchingStore)

const showMultiPanel = ref(false)
const showSinglePanel = ref(false)
/** 选人页返回时需恢复的弹窗：'multi' | 'single' | null */
const pendingPanel = ref(null)

const maskVisible = computed(() => showMultiPanel.value || showSinglePanel.value)

const takerName = computed(() =>
  selectedTaker.value?.name ? String(selectedTaker.value.name).trim() : ''
)
const giverName = computed(() =>
  selectedGiver.value?.name ? String(selectedGiver.value.name).trim() : ''
)

function closePanels() {
  pendingPanel.value = null
  showMultiPanel.value = false
  showSinglePanel.value = false
}

/** 从选人/选护工页返回：恢复离开时对应的弹窗 */
function resumePanelIfNeeded() {
  const p = pendingPanel.value
  if (!p) return
  pendingPanel.value = null
  if (p === 'multi') {
    matchingStore.setMatchMode('multi')
    showMultiPanel.value = true
    showSinglePanel.value = false
  } else {
    matchingStore.setMatchMode('single')
    showSinglePanel.value = true
    showMultiPanel.value = false
  }
}

onShow(() => {
  resumePanelIfNeeded()
})

function openMulti() {
  pendingPanel.value = null
  matchingStore.setMatchMode('multi')
  showSinglePanel.value = false
  showMultiPanel.value = true
}

function openSingle() {
  pendingPanel.value = null
  matchingStore.setMatchMode('single')
  showMultiPanel.value = false
  showSinglePanel.value = true
}

function goSelectTaker(mode) {
  const m = mode === 'single' ? 'single' : 'multi'
  matchingStore.setMatchMode(m)
  pendingPanel.value = m
  uni.navigateTo({
    url: `/pages/matching/select-taker?mode=${m}`
  })
}

function goSelectGiver() {
  pendingPanel.value = 'single'
  uni.navigateTo({ url: '/pages/matching/select-giver' })
}

function runMatchFlow() {
  closePanels()
  uni.navigateTo({ url: '/pages/matching/loading' })
}

function submitMulti() {
  if (!selectedTaker.value?._id) {
    uni.showToast({ title: '请选择老人', icon: 'none' })
    return
  }
  matchingStore.setMatchMode('multi')
  runMatchFlow()
}

function submitSingle() {
  if (!selectedTaker.value?._id) {
    uni.showToast({ title: '请选择老人', icon: 'none' })
    return
  }
  if (!selectedGiver.value?._id) {
    uni.showToast({ title: '请选择护理员', icon: 'none' })
    return
  }
  matchingStore.setMatchMode('single')
  runMatchFlow()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: env(safe-area-inset-top);
  padding-bottom: calc(126rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.brand {
  position: relative;
  z-index: 2;
  padding: 48rpx 40rpx 0;
  font-size: 64rpx;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 1rpx;
}

.decor {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 680rpx;
  margin-top: 24rpx;
}

.rings {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: 440rpx;
  height: 440rpx;
}

.rings__c {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1rpx solid rgba(74, 144, 226, 0.95);
  box-sizing: border-box;
}

.rings__c--1 {
  width: 440rpx;
  height: 440rpx;
  border-color: rgba(74, 144, 226, 0.1);
}
.rings__c--2 {
  width: 348rpx;
  height: 348rpx;
  border-color: rgba(74, 144, 226, 0.15);
}
.rings__c--3 {
  width: 258rpx;
  height: 258rpx;
  border-color: rgba(74, 144, 226, 0.2);
}
.rings__c--4 {
  width: 166rpx;
  height: 166rpx;
  border-color: rgba(74, 144, 226, 0.3);
}
.rings__c--5 {
  width: 76rpx;
  height: 76rpx;
  border: none;
  background: #3d7fd4;
}

.dot {
  position: absolute;
  border-radius: 50%;
  background: #4a90e2;
}

.dot--1 {
  width: 22rpx;
  height: 22rpx;
  left: 60rpx;
  top: 120rpx;
  opacity: 0.45;
}
.dot--2 {
  width: 36rpx;
  height: 36rpx;
  right: 80rpx;
  top: 200rpx;
  opacity: 0.35;
}
.dot--3 {
  width: 28rpx;
  height: 28rpx;
  left: 100rpx;
  bottom: 180rpx;
  opacity: 0.55;
}
.dot--4 {
  width: 54rpx;
  height: 54rpx;
  right: 50rpx;
  bottom: 120rpx;
  opacity: 0.3;
}
.dot--5 {
  width: 32rpx;
  height: 32rpx;
  left: 50%;
  margin-left: -100rpx;
  top: 60rpx;
  opacity: 0.5;
}
.dot--6 {
  width: 24rpx;
  height: 24rpx;
  right: 120rpx;
  top: 400rpx;
  opacity: 0.6;
}

.star {
  position: absolute;
  color: #ffd700;
  line-height: 1;
}

.star--1 {
  font-size: 32rpx;
  left: 80rpx;
  top: 240rpx;
}
.star--2 {
  font-size: 46rpx;
  right: 100rpx;
  top: 100rpx;
}
.star--3 {
  font-size: 26rpx;
  left: 120rpx;
  bottom: 200rpx;
}
.star--4 {
  font-size: 38rpx;
  right: 70rpx;
  bottom: 280rpx;
}

.btns {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 30rpx;
  padding: 0 40rpx;
  margin-top: -40rpx;
}

.btns__half {
  width: 280rpx;
  height: 156rpx;
  border-radius: 24rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.btns__half--outline {
  border: 2rpx solid #4a90e2;
}
.btns__half--gray {
  border: 2rpx solid #d9d9d9;
}

.btns__tit {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a2e;
}

/* 须高于 components/common/AppCustomTabBar 的 z-index:900，否则会盖住按钮与半透明层 */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
}

.panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  max-height: 78vh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 16rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.panel__bar {
  width: 64rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: #e5e8ef;
  margin: 0 auto 24rpx;
}

.panel__ttl {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 20rpx;
}

.panel__line {
  height: 1rpx;
  background: #e5e8ef;
  margin-bottom: 28rpx;
}

.panel__lab {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.panel__lab--mt {
  margin-top: 24rpx;
}

.req {
  color: $color-error;
}

.panel__field {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding: 0 24rpx;
  background: #f7f8fa;
  border-radius: 16rpx;
  margin-bottom: 8rpx;
}

.panel__ph {
  flex: 1;
  font-size: 30rpx;
  color: #b0b7c3;
}

.panel__ph--on {
  color: #1a1a2e;
  font-weight: 500;
}

.panel__btn {
  display: block;
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  margin: 32rpx 0 0;
  padding: 0;
  background: $color-primary;
  color: #ffffff;
  border-radius: 46rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.panel__btn::after {
  border: none;
}
</style>
