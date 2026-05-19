<template>
  <view class="page">
    <view class="pulse" aria-hidden="true">
      <view class="pulse__orbit pulse__orbit--o1" />
      <view class="pulse__orbit pulse__orbit--o2" />
      <view class="pulse__core" />
    </view>
    <text class="tit">正在进行匹配</text>
    <text class="sub">云端计算适配度中，请稍候</text>

    <view v-if="phase === 'fail'" class="fail">
      <text class="fail__txt">{{ failMsg }}</text>
      <view class="fail__row">
        <button class="btn btn--ghost" @tap="goBack">返回</button>
        <button class="btn btn--pri" @tap="retry">重试</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMatchingStore } from '@/store/matching'

const phase = ref('running')
const failMsg = ref('')

async function executeAndGo() {
  const store = useMatchingStore()
  if (!store.selectedTaker?._id) {
    uni.showToast({ title: '未选择老人', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  if (store.matchMode === 'single' && !store.selectedGiver?._id) {
    uni.showToast({ title: '未选择护理员', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }
  phase.value = 'running'
  failMsg.value = ''
  try {
    await store.executeMatch()
    const tid = store.selectedTaker._id
    const mode = store.matchMode
    uni.redirectTo({
      url: `/pages/matching/result?takerId=${encodeURIComponent(tid)}&mode=${encodeURIComponent(mode)}`
    })
  } catch (e) {
    failMsg.value = e?.message || '匹配失败'
    phase.value = 'fail'
  }
}

function retry() {
  executeAndGo()
}

function goBack() {
  uni.navigateBack()
}

onLoad(() => {
  executeAndGo()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 120rpx 48rpx 48rpx;
  padding-top: calc(120rpx + env(safe-area-inset-top));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pulse {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 56rpx;
}

.pulse__orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2rpx solid rgba(74, 144, 226, 0.35);
  animation: ripple 1.6s ease-out infinite;
}

.pulse__orbit--o1 {
  width: 200rpx;
  height: 200rpx;
}
.pulse__orbit--o2 {
  width: 140rpx;
  height: 140rpx;
  animation-delay: 0.35s;
  border-color: rgba(74, 144, 226, 0.55);
}

.pulse__core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 64rpx;
  height: 64rpx;
  margin-left: -32rpx;
  margin-top: -32rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #5ea0ea, #3d7fd4);
}

@keyframes ripple {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.96);
  }
  70% {
    opacity: 0.35;
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(0.96);
  }
}

.tit {
  font-size: 38rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 16rpx;
}

.sub {
  font-size: 26rpx;
  color: $color-text-secondary;
  text-align: center;
  line-height: 1.5;
}

.fail {
  margin-top: 80rpx;
  width: 100%;
  max-width: 600rpx;
}

.fail__txt {
  display: block;
  font-size: 28rpx;
  color: $color-error;
  text-align: center;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.fail__row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.btn--ghost {
  background: #fff;
  color: $color-text-secondary;
  border: 2rpx solid $color-border;
}

.btn--pri {
  background: $color-primary;
  color: #fff;
}
</style>
